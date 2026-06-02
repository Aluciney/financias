interface Fii {
  id: number
  ticker: string
  nome: string
  cotacao: number
  dividendo: number
  dataCom: string
  dataPagamento: string
  dyMensal: number
  dyAnual: number
  atualizadoEm: string | null
  criadoEm: string
}

interface PaginaFiis {
  data: Fii[]
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

interface ResultadoAtualizacao {
  atualizadas: number
  falhas: Array<{ ticker: string; motivo: string }>
  fiis: Fii[]
}
