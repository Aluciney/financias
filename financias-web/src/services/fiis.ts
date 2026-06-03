import { api } from './api'

export const listarFiis = async (): Promise<Fii[]> => {
  const { data } = await api.get<Fii[]>('/fiis')
  return data
}

export const listarFiisPaginado = async (page: number, perPage: number, busca?: string): Promise<PaginaFiis> => {
  const { data } = await api.get<PaginaFiis>('/fiis/paginado', { params: { page, perPage, busca: busca || undefined } })
  return data
}

export const cadastrarFii = async (ticker: string, quantidadeCotas: number): Promise<Fii> => {
  const { data } = await api.post<Fii>('/fiis', { ticker, quantidadeCotas })
  return data
}

export const atualizarCotasFii = async (id: number, quantidadeCotas: number): Promise<Fii> => {
  const { data } = await api.patch<Fii>(`/fiis/${id}/cotas`, { quantidadeCotas })
  return data
}

export const atualizarFiis = async (): Promise<ResultadoAtualizacao> => {
  const { data } = await api.post<ResultadoAtualizacao>('/fiis/atualizar')
  return data
}

export const removerFii = async (id: number): Promise<void> => {
  await api.delete(`/fiis/${id}`)
}
