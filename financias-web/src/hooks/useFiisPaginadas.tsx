import { useCallback, useEffect, useState } from 'react'
import { listarFiisPaginado } from '../services/fiis'

export const useFiisPaginadas = (perPage = 10) => {
  const [pagina, setPagina] = useState(1)
  const [busca, setBuscaState] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [dados, setDados] = useState<Fii[]>([])
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [carregando, setCarregando] = useState(true)

  // debounce: só aplica a busca (e reseta para a página 1) após o usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaAplicada(busca.trim())
      setPagina(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [busca])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const pagina2 = await listarFiisPaginado(pagina, perPage, buscaAplicada)
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
  }, [pagina, perPage, buscaAplicada])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { dados, pagina, total, lastPage, perPage, busca, carregando, setPagina, setBusca: setBuscaState, recarregar: carregar }
}
