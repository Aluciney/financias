import { useCallback, useEffect, useState } from 'react'
import { atualizarFiis, cadastrarFii, listarFiis, removerFii } from '../services/fiis'

interface ErroApi {
  response?: { data?: { message?: string } }
}

const extrairMensagem = (erro: unknown, padrao: string) => {
  const apiErro = erro as ErroApi
  return apiErro?.response?.data?.message ?? padrao
}

export const useFiis = () => {
  const [fiis, setFiis] = useState<Fii[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setFiis(await listarFiis())
    } catch (e) {
      setErro(extrairMensagem(e, 'Não foi possível carregar as FIIs'))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const cadastrar = useCallback(async (ticker: string) => {
    const nova = await cadastrarFii(ticker)
    setFiis((atual) => [...atual, nova].sort((a, b) => b.dyAnual - a.dyAnual))
    return nova
  }, [])

  const atualizarTodas = useCallback(async () => {
    setAtualizando(true)
    setErro(null)
    try {
      const resultado = await atualizarFiis()
      setFiis(resultado.fiis)
      return resultado
    } catch (e) {
      setErro(extrairMensagem(e, 'Falha ao atualizar as FIIs'))
      throw e
    } finally {
      setAtualizando(false)
    }
  }, [])

  const remover = useCallback(async (id: number) => {
    await removerFii(id)
    setFiis((atual) => atual.filter((fii) => fii.id !== id))
  }, [])

  return { fiis, carregando, atualizando, erro, carregar, cadastrar, atualizarTodas, remover }
}
