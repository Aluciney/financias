import { useCallback, useEffect, useState } from 'react'
import { listarFiisPaginado } from '../services/fiis'

export const useFiisPaginadas = (perPage = 10) => {
  const [pagina, setPagina] = useState(1)
  const [dados, setDados] = useState<Fii[]>([])
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const pagina2 = await listarFiisPaginado(pagina, perPage)
      // se a página esvaziou após uma remoção, recua uma página
      if (pagina2.data.length === 0 && pagina2.currentPage > 1) {
        setPagina((p) => p - 1)
        return
      }
      setDados(pagina2.data)
      setTotal(pagina2.total)
      setLastPage(pagina2.lastPage)
    } finally {
      setCarregando(false)
    }
  }, [pagina, perPage])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { dados, pagina, total, lastPage, perPage, carregando, setPagina, recarregar: carregar }
}
