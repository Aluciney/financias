export interface FiiTablePaginacao {
  pagina: number
  lastPage: number
  total: number
  perPage: number
  onPagina: (pagina: number) => void
}

export interface FiiTableProps {
  fiis: Fii[]
  onRemover: (id: number) => Promise<void>
  onAtualizarCotas: (id: number, quantidadeCotas: number) => Promise<void>
  offset?: number
  paginacao?: FiiTablePaginacao
}
