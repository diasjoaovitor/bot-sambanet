import puppeteer, { Browser, Page } from 'puppeteer'
import dotenv from 'dotenv'
import { delay, obterEntradaNfURL, obterEstoqueURL } from '.'

dotenv.config()

const URL = process.env.URL as string
const CNPJ = process.env.CNPJ as string
const USUARIO = process.env.USUARIO as string
const SENHA = process.env.SENHA as string

type TDadosDoProduto = {
  id: string
  nome: string
  barra: string
  barraXML: string
}

export async function iniciar() {
  const browser = await puppeteer.launch({ headless: 'new' })
  const pagina = await browser.newPage()
  await pagina.goto(URL)
  return { browser, pagina }
}

export async function login(pagina: Page, browser: Browser) {
  await pagina.type('[formcontrolname=cnpj]', CNPJ)
  await pagina.type('[formcontrolname=usuario]', USUARIO)
  await pagina.type('[formcontrolname=senha]', SENHA)
  await pagina.click('button')
  await pagina.waitForNavigation()
  const dashboardURL = pagina.url()
  const cookies = await pagina.cookies()
  const dashboard = await browser.newPage()
  await dashboard.setCookie(...cookies)
  await dashboard.goto(dashboardURL)
  return { dashboard, dashboardURL }
}

export async function navegarParaEstoque(pagina: Page, browser: Browser) {
  const dashboardHTML = await pagina.content()
  const estoqueURL = obterEstoqueURL(dashboardHTML)
  if (!estoqueURL) throw 'URL de Estoque não encontrada!'
  const estoque = await browser.newPage()
  await estoque.goto(estoqueURL)
  return { estoque, estoqueURL: estoque.url() }
}

export async function navegarParaEntradaNF(pagina: Page, browser: Browser) {
  const estoqueHTML = await pagina.content()
  const entradaNfURL = obterEntradaNfURL(estoqueHTML)
  if (!entradaNfURL) throw 'URL de Entrada NF não encontrada!'
  const entradaNF = await browser.newPage()
  await entradaNF.goto(entradaNfURL)
  return { entradaNF, entradaNfURL: entradaNF.url() }
}

export async function buscarNotasPendentes(pagina: Page) {
  await pagina.click('#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes')
  await pagina.waitForSelector('#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes[checked=checked]')
}

export async function selecionarQuantidadeDeItensPagina(pagina: Page) {
  await delay()
  await pagina.select('#ContentPlaceHolder1_ddlPageSize', '60')
  await delay()
}

export async function obterNotasPendentes(pagina: Page) {
  return await pagina.evaluate(() => {
    const tabela = document.getElementById('ContentPlaceHolder1_gvDados')
    const nfs: {
      descricao: string
      codigo: string
    }[] = []
    const tds = tabela.querySelectorAll('td')
    tds.forEach((td, index) => {
      td.title && nfs.push({
        descricao: `${tds[index - 2].textContent} - ${td.textContent}`,
        codigo: tds[index - 3].textContent
      })
    })
    let proximaPaginaId = null
    const paginas = document.querySelectorAll('.pagination')
    paginas.forEach(pagina => {
      if (pagina.textContent === 'Próximo') proximaPaginaId = pagina.id
    })
    return { nfs, proximaPaginaId }
  })
}

export async function navegarParaItensDaNF(codigoDaNF: string, browser: Browser) {
  const itensNfURL = `https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=${codigoDaNF}`
  const itensNf = await browser.newPage()
  await itensNf.goto(itensNfURL)
  return { itensNf, itensNfURL }
}

export async function obterProdutosNaoAssociados(pagina: Page) {
  const tabela = await pagina.waitForSelector('#ContentPlaceHolder1_gvDados')
  const produtosNaoAssociados = await pagina.evaluate(el => {
    const calcularCodigoDeBarras = (barraXML: string) => {
      const array = barraXML.slice(1, -1).split('')
      const soma = array.reduce((total, numero, i) => total += i % 2 === 0 ? Number(numero) * 1 : Number(numero) * 3, 0)
      const ultimoDigito = ((Math.floor(soma / 10) + 1) * 10 - soma) % 10
      const barra = array.join('') + ultimoDigito
      return barra
    }
    const array: TDadosDoProduto[] = []
    const trs = el.querySelectorAll('tr')
    trs.forEach(tr => {
      const a = tr.querySelector('a')
      if (!a || a.textContent !== 'Associar Produto') return
      const tds = tr.querySelectorAll('td')
      const barraXML = tds[5].textContent
      const barra = barraXML.length === 14 ? calcularCodigoDeBarras(barraXML) : barraXML 
      array.push({
        id: a.id,
        nome: tds[6].textContent,
        barra,
        barraXML
      })
    })
    return array 
  }, tabela)
  return produtosNaoAssociados
}

export async function associarProduto(produto: TDadosDoProduto, url: string, browser: Browser) {
  const { barra, id } = produto
  try {
    const itensNf = await browser.newPage()
    await itensNf.goto(url)
    await selecionarQuantidadeDeItensPagina(itensNf)
    await itensNf.click(`#${id}`)
    await itensNf.waitForSelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_PW-1')
    await delay()
    await itensNf.focus('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba')
    await itensNf.type('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba', barra)
    await delay()
    await itensNf.keyboard.press('Tab')
    await delay(10000)
    const janela = await itensNf.waitForSelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_PW-1')
    const resultado = await janela.evaluate(el => {       
      const barra = el.querySelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba') as HTMLInputElement
      const codigo = el.querySelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtCodprodSamba') as HTMLInputElement
      return {
        barra: barra.value || null,
        codigo: codigo.value || null
      }
    })

    if (!resultado.codigo || barra !== resultado.barra) {
      return false
    }

    const salvar = await itensNf.waitForSelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_btnSalvar')
    await salvar.evaluate(b => (b as HTMLButtonElement).click())
    await delay()
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
