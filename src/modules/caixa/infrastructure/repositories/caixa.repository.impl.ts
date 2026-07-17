import { eq, and, gte, lte, sql, count, sum, desc, isNull } from "drizzle-orm"
import { db, sqlite, movimentacoesFinanceiras, caixaConfig, fechamentosSemanais, contratos, pagamentos } from "../../../../database.js"
import type { CaixaConfig, MovimentacaoFinanceira, FechamentoSemanal } from "../../domain/caixa.entity.js"
import type { ICaixaRepository, ListMovimentacoesParams, ListMovimentacoesResult } from "../../application/ports/caixa.repository.js"
import { getLocalDateString } from "../../../../shared/utils/parseDateLocal.js"

export class CaixaRepository implements ICaixaRepository {
  async getCaixaConfig(): Promise<CaixaConfig | null> {
    const rows = await db
      .select()
      .from(caixaConfig)
      .where(eq(caixaConfig.id, "default"))
      .limit(1)
    if (rows.length === 0) return null
    return {
      id: rows[0].id,
      caixaBase: rows[0].caixaBase,
      updatedAt: rows[0].updatedAt,
    }
  }

  async updateCaixaBase(valor: number): Promise<void> {
    const now = new Date().toISOString()
    await db
      .update(caixaConfig)
      .set({
        caixaBase: sql`${caixaConfig.caixaBase} + ${valor}`,
        updatedAt: now,
      })
      .where(eq(caixaConfig.id, "default"))
  }

  async saveMovimentacaoFinanceira(m: MovimentacaoFinanceira): Promise<void> {
    await db.insert(movimentacoesFinanceiras).values({
      id: m.id,
      tipo: m.tipo,
      valor: m.valor,
      origem: m.origem,
      origemId: m.origemId ?? "",
      descricao: m.descricao ?? null,
      data: m.data,
      createdAt: m.createdAt,
    })
  }

  async listMovimentacoes(params: ListMovimentacoesParams): Promise<ListMovimentacoesResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const offset = (page - 1) * limit

    const conditions: string[] = ["1=1"]
    const bindings: string[] = []

    if (params.dataInicio) {
      conditions.push("m.data >= ?")
      bindings.push(params.dataInicio)
    }
    if (params.dataFim) {
      conditions.push("m.data <= ?")
      bindings.push(params.dataFim)
    }
    if (params.origem) {
      conditions.push("m.origem = ?")
      bindings.push(params.origem)
    }

    const where = conditions.join(" AND ")

    const data = sqlite.prepare(`
      SELECT
        m.id, m.tipo, m.valor, m.origem, m.origemId, m.descricao, m.data, m.createdAt,
        CASE
          WHEN m.origem IN ('Contrato', 'Cancelamento', 'Ajuste') THEN
            (SELECT cl.nome FROM clientes cl
             JOIN contratos ct ON ct.clienteId = cl.id
             WHERE ct.id = m.origemId)
          WHEN m.origem = 'Pagamento' THEN
            (SELECT cl.nome FROM clientes cl
             JOIN contratos ct ON ct.clienteId = cl.id
             JOIN pagamentos pg ON pg.contratoId = ct.id
             WHERE pg.id = m.origemId)
          WHEN m.origem = 'Gasto' THEN NULL
          ELSE NULL
        END AS clienteNome,
        CASE
          WHEN m.origem = 'Gasto' THEN
            (SELECT g.categoria FROM gastos g WHERE g.id = m.origemId AND g.deletedAt IS NULL)
          ELSE NULL
        END AS categoria
      FROM movimentacoesFinanceiras m
      WHERE ${where}
      ORDER BY m.createdAt DESC
      LIMIT ? OFFSET ?
    `).all(...bindings, limit, offset) as (MovimentacaoFinanceira & { clienteNome: string | null; categoria: string | null })[]

    const countRow = sqlite.prepare(`
      SELECT COUNT(*) AS total FROM movimentacoesFinanceiras m WHERE ${where}
    `).get(...bindings) as { total: number }

    const total = countRow.total

    return {
      data: data.map((row) => ({
        id: row.id,
        tipo: row.tipo as MovimentacaoFinanceira["tipo"],
        valor: row.valor,
        origem: row.origem as MovimentacaoFinanceira["origem"],
        origemId: row.origemId || undefined,
        descricao: row.descricao ?? undefined,
        clienteNome: row.clienteNome ?? undefined,
        categoria: row.categoria ?? undefined,
        data: row.data,
        createdAt: row.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getRecebidoSemana(dataInicio: string, dataFim: string): Promise<number> {
    const result = await db
      .select({ total: sum(movimentacoesFinanceiras.valor) })
      .from(movimentacoesFinanceiras)
      .where(
        and(
          eq(movimentacoesFinanceiras.origem, "Pagamento"),
          gte(movimentacoesFinanceiras.data, dataInicio),
          lte(movimentacoesFinanceiras.data, dataFim),
        ),
      )
    return Number(result[0]?.total) || 0
  }

  async getGastoSemana(dataInicio: string, dataFim: string): Promise<number> {
    const result = await db
      .select({ total: sum(movimentacoesFinanceiras.valor) })
      .from(movimentacoesFinanceiras)
      .where(
        and(
          eq(movimentacoesFinanceiras.origem, "Gasto"),
          gte(movimentacoesFinanceiras.data, dataInicio),
          lte(movimentacoesFinanceiras.data, dataFim),
        ),
      )
    return Number(result[0]?.total) || 0
  }

  async getSaldoAtual(dataInicio?: string): Promise<number> {
    let entradasQuery = `SELECT COALESCE(SUM(valor), 0) AS total FROM movimentacoesFinanceiras WHERE tipo = 'entrada'`
    let saidasQuery = `SELECT COALESCE(SUM(valor), 0) AS total FROM movimentacoesFinanceiras WHERE tipo = 'saida'`

    if (dataInicio) {
      const filtro = ` AND data >= '${dataInicio}'`
      entradasQuery += filtro
      saidasQuery += filtro
    }

    const entradas = sqlite.prepare(entradasQuery).get() as { total: number }
    const saidas = sqlite.prepare(saidasQuery).get() as { total: number }

    const caixa = await this.getCaixaConfig()
    const base = caixa?.caixaBase ?? 0
    const totalEntradas = Number(entradas.total) || 0
    const totalSaidas = Number(saidas.total) || 0
    return base + totalEntradas - totalSaidas
  }

  async getLucro(): Promise<number> {
    const entradas = sqlite.prepare(
      `SELECT COALESCE(SUM(valor), 0) AS total FROM movimentacoesFinanceiras WHERE tipo = 'entrada'`
    ).get() as { total: number }
    const saidas = sqlite.prepare(
      `SELECT COALESCE(SUM(valor), 0) AS total FROM movimentacoesFinanceiras WHERE tipo = 'saida'`
    ).get() as { total: number }
    return (Number(entradas.total) || 0) - (Number(saidas.total) || 0)
  }

  async getAReceberHoje(): Promise<number> {
    const hoje = getLocalDateString(new Date())
    const result = sqlite
      .prepare(
        `SELECT COALESCE(SUM(p.saldoPendente), 0) AS total
         FROM parcelas p
         JOIN contratos ct ON ct.id = p.contratoId
         WHERE p.dataVencimento = ? AND p.saldoPendente > 0 AND p.deletedAt IS NULL AND ct.deletedAt IS NULL`
      )
      .get(hoje) as { total: number }
    return result.total
  }

  async getRecebidoHoje(): Promise<number> {
    const hoje = getLocalDateString(new Date())
    const result = sqlite
      .prepare(
        `SELECT COALESCE(SUM(valor), 0) AS total
         FROM pagamentos
         WHERE data = ?`
      )
      .get(hoje) as { total: number }
    return result.total
  }

  async getVendasSemana(dataInicio: string, dataFim: string): Promise<number> {
    const result = sqlite
      .prepare(
        `SELECT COALESCE(SUM(valorBase), 0) AS total
         FROM contratos
         WHERE dataInicio >= ? AND dataInicio <= ? AND deletedAt IS NULL`
      )
      .get(dataInicio, dataFim) as { total: number }
    return result.total
  }

  async getUltimaLiquidacao(): Promise<FechamentoSemanal | null> {
    const rows = await db
      .select()
      .from(fechamentosSemanais)
      .orderBy(desc(fechamentosSemanais.createdAt))
      .limit(1)
    if (rows.length === 0) return null
    return {
      id: rows[0].id,
      dataInicio: rows[0].dataInicio,
      dataFim: rows[0].dataFim,
      totalRecebido: rows[0].totalRecebido,
      totalGasto: rows[0].totalGasto,
      resultado: rows[0].resultado,
      caixaBase: rows[0].caixaBase,
      saldoFechamento: rows[0].saldoFechamento,
      createdAt: rows[0].createdAt,
    }
  }

  async saveFechamentoSemanal(f: FechamentoSemanal): Promise<void> {
    await db.insert(fechamentosSemanais).values({
      id: f.id,
      dataInicio: f.dataInicio,
      dataFim: f.dataFim,
      totalRecebido: f.totalRecebido,
      totalGasto: f.totalGasto,
      resultado: f.resultado,
      caixaBase: f.caixaBase,
      saldoFechamento: f.saldoFechamento,
      createdAt: f.createdAt,
    })
  }

  async findFechamentoPorPeriodo(dataInicio: string, dataFim: string): Promise<FechamentoSemanal | null> {
    const rows = await db
      .select()
      .from(fechamentosSemanais)
      .where(
        and(
          eq(fechamentosSemanais.dataInicio, dataInicio),
          eq(fechamentosSemanais.dataFim, dataFim),
        ),
      )
      .limit(1)
    if (rows.length === 0) return null
    return {
      id: rows[0].id,
      dataInicio: rows[0].dataInicio,
      dataFim: rows[0].dataFim,
      totalRecebido: rows[0].totalRecebido,
      totalGasto: rows[0].totalGasto,
      resultado: rows[0].resultado,
      caixaBase: rows[0].caixaBase,
      saldoFechamento: rows[0].saldoFechamento,
      createdAt: rows[0].createdAt,
    }
  }
}
