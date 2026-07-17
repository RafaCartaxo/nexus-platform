export interface IClienteSaldoQuery {
  sumByClienteId(clienteId: string): Promise<number>
}
