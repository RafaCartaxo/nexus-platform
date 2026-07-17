export interface IClienteExistenceQuery {
  exists(clienteId: string): Promise<boolean>
}
