import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AddFiiFormProps } from './types'

const schema = z.object({
  ticker: z
    .string()
    .trim()
    .min(4, 'Ticker inválido')
    .regex(/^[A-Za-z]{4}11$/, 'Use o formato do ticker, ex.: MXRF11')
    .transform((valor) => valor.toUpperCase()),
})

type FormData = z.infer<typeof schema>

export const AddFiiForm: React.FC<AddFiiFormProps> = ({ onCadastrar }) => {
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const enviar = handleSubmit(async ({ ticker }) => {
    setErroApi(null)
    try {
      await onCadastrar(ticker)
      reset()
    } catch (e) {
      const apiErro = e as { response?: { data?: { message?: string } } }
      setErroApi(apiErro?.response?.data?.message ?? 'Não foi possível cadastrar a FII')
    }
  })

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-300">Cadastrar nova FII</h2>
      <p className="mt-1 text-xs text-zinc-500">Os dados são buscados automaticamente no StatusInvest</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          {...register('ticker')}
          placeholder="Ex.: MXRF11"
          autoComplete="off"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 uppercase placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Cadastrar
        </button>
      </div>

      {(errors.ticker || erroApi) && <p className="mt-2 text-sm text-rose-400">{errors.ticker?.message ?? erroApi}</p>}
    </form>
  )
}
