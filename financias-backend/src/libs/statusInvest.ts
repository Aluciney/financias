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
	// categoria do ativo conforme o caminho da página (ex.: 'fundos-imobiliarios', 'fiagros', 'acoes', 'etfs')
	categoria: string
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

export interface TypeFII {
	id: number,
	parentId: number,
	nameFormated: string;
	name: string;
	normalizedName: string;
	code: string;
	price: string;
	variation: string;
	variationUp: boolean;
	type: number;
	url: string;
}

// Consulta a busca do StatusInvest para descobrir o ativo e, principalmente, o caminho
// correto da página conforme o tipo (FII, Fiagro, FI-Infra, ação...).
export async function getTipoFII(ticker: string): Promise<TypeFII> {
	const url = `https://statusinvest.com.br/home/mainsearchquery?q=${encodeURIComponent(ticker)}`
	const { data } = await axios.get<TypeFII[]>(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0',
			Accept: 'application/json',
		},
	})

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error('Ativo não encontrado')
	}

	// a busca devolve vários resultados; prioriza o de código idêntico ao ticker informado
	const ativo = data.find((item) => item.code?.toUpperCase() === ticker)
	if (!ativo) {
		throw new Error('Ativo não encontrado')
	}

	return ativo
}

export async function getFiiDataStatusInvest(ticker: string): Promise<FiiData> {
	const ativo = await getTipoFII(ticker)

	// usa o caminho retornado pela busca, já apontando para a página do tipo correto
	const caminho = ativo.url.startsWith('/') ? ativo.url : `/${ativo.url}`
	const url = `https://statusinvest.com.br${caminho}`
	// primeiro segmento do caminho identifica a categoria (ex.: 'etfs', 'fundos-imobiliarios')
	const categoria = caminho.split('/').filter(Boolean)[0] ?? 'outro'

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
	// cotação via scraping; se falhar, usa o preço que a própria busca já trouxe
	const cotacaoScraping = parseNumero($('.special').first().find('strong').text())
	const cotacao = cotacaoScraping > 0 ? cotacaoScraping : parseNumero(ativo.price)
	const nome = ativo.name.toUpperCase()
	const valorProvento = parseNumero(primeiraLinha.find('td').eq(3).text())
	const dataComRaw = primeiraLinha.find('td').eq(1).text().trim()
	const dataPagamentoRaw = primeiraLinha.find('td').eq(2).text().trim()

	// tipos sem tabela de proventos (ex.: ETF) caem na primeira linha de outra tabela e
	// trazem lixo ("0", "0,00"); só aceita quando há valor e datas no formato dd/mm/aaaa
	const ehData = (texto: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(texto)
	const temProvento = valorProvento > 0 && ehData(dataComRaw) && ehData(dataPagamentoRaw)

	const proximoPagamento: ProximoPagamento = temProvento
		? { valor: valorProvento, dataCom: dataComRaw, dataPagamento: dataPagamentoRaw }
		: { valor: 0, dataCom: '', dataPagamento: '' }

	const dyMensal = cotacao > 0 ? (proximoPagamento.valor / cotacao) * 100 : 0
	const dyAnual = dyMensal * 12

	return {
		ticker: ativo.code?.toUpperCase() || ticker,
		nome,
		categoria,
		cotacao,
		proximoPagamento,
		dyMensal: Number(dyMensal.toFixed(2)),
		dyAnual: Number(dyAnual.toFixed(2)),
	}
}
