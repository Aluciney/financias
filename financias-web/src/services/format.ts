const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarMoeda = (valor: number) => moeda.format(valor)

export const formatarPercentual = (valor: number) => `${valor.toFixed(2).replace('.', ',')}%`

const numero = new Intl.NumberFormat('pt-BR')

export const formatarNumero = (valor: number) => numero.format(valor)
