export interface CobrancaItem {
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  clienteLat: number | null
  clienteLng: number | null
  clienteLogradouro: string
  clienteNumero: string | null
  clienteBairro: string | null
  clienteCidade: string | null
  clienteEstado: string | null
  contratoId: string
  totalPendente: number
  quantidadeParcelas: number
  situacao: "atrasado" | "venceHoje"
  resultadoOperacional: string
  proximaParcela: number
  proximoNumeroParcela: number
  totalParcelasContrato: number
  saldoTotal: number
}

export interface CobrancaDoDiaResult {
  indicadores: {
    aReceberHoje: number
    recebidoHoje: number
    clientesParaCobrar: number
    atrasado: number
    aVencer: number
  }
  cobrancas: CobrancaItem[]
}

export interface PagamentoDoDiaItem {
  pagamentoId: string
  valor: number
  clienteId: string
  clienteNome: string
  contratoId: string
  data: string
  createdAt: string
}

export interface RegistrarVisitaInput {
  clienteId: string
  contratoId: string
  tipo: "visitado" | "nao_localizado" | "promessa"
  dataPromessa?: string | null
}

export interface RegistrarVisitaOutput {
  id: string
  clienteId: string
  contratoId: string
  tipo: string
  dataPromessa: string | null
  createdAt: string
}

export interface ParcelaDoDia {
  numero: number
  valorPrevisto: number
  saldoPendente: number
}

export interface ParcelaHojeCliente {
  clienteId: string
  clienteNome: string
  contratoId: string
  parcelas: ParcelaDoDia[]
}

export interface IOperacoesRepository {
  listarCobrancasDoDia(operadorLat?: number, operadorLng?: number): Promise<CobrancaDoDiaResult>
  listarPagamentosDoDia(dataInicio?: string, dataFim?: string): Promise<PagamentoDoDiaItem[]>
  listarParcelasHoje(): Promise<ParcelaHojeCliente[]>
  listarParcelasSemana(): Promise<ParcelaHojeCliente[]>
  registrarVisita(input: RegistrarVisitaInput): Promise<RegistrarVisitaOutput>
}
