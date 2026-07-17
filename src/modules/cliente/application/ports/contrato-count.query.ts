export interface IContratoCountQuery {
  countByClienteId(clienteId: string): Promise<number>
}
