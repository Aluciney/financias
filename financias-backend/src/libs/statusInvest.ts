import axios from 'axios'
import * as cheerio from 'cheerio'
import * as iconv from 'iconv-lite'

export interface ProximoPagamento {
	valor: number
	dataCom: string
	dataPagamento: string
}

export interface FiiData {
	ticker: string
	nome: string
	cotacao: number
	proximoPagamento: ProximoPagamento
	// dividend yield mensal (%) calculado a partir do último provento / cotação
	dyMensal: number
	// dividend yield anualizado (%) — projeção do provento mensal em 12 meses
	dyAnual: number
}

const parseNumero = (texto: string) => {
	const valor = parseFloat(texto.trim().replace(/\./g, '').replace(',', '.'))
	return Number.isFinite(valor) ? valor : 0
}

export async function getFiiDataStatusInvest(ticker: string): Promise<FiiData> {
	ticker = ticker.toUpperCase()
	const url = `https://statusinvest.com.br/fundos-imobiliarios/${ticker}`

	const response = await axios.get(url, {
		responseType: 'arraybuffer',
		headers: {
			'User-Agent': 'Mozilla/5.0',
		},
	})

	const html = iconv.decode(response.data, 'latin1')
	const $ = cheerio.load(html)

	// histórico de dividendos — primeira linha é o provento mais recente
	const primeiraLinha = $('table tbody tr').first()
	const cotacao = parseNumero($('.special').first().find('strong').text())
	const [, nome] = $('h1.lh-4')
		.first()
		.text()
		.trim()
		.toUpperCase()
		.split('-')
		.map((s) => s.trim())

	const proximoPagamento: ProximoPagamento = {
		valor: parseNumero(primeiraLinha.find('td').eq(3).text()),
		dataCom: primeiraLinha.find('td').eq(1).text().trim(),
		dataPagamento: primeiraLinha.find('td').eq(2).text().trim(),
	}

	const dyMensal = cotacao > 0 ? (proximoPagamento.valor / cotacao) * 100 : 0
	const dyAnual = dyMensal * 12

	return {
		ticker,
		nome: nome ?? ticker,
		cotacao,
		proximoPagamento,
		dyMensal: Number(dyMensal.toFixed(2)),
		dyAnual: Number(dyAnual.toFixed(2)),
	}
}
