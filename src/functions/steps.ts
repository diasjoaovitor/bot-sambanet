import puppeteer, { Browser, Page } from 'puppeteer'
import { logger } from '../logger-config'
import { TDadosDoProduto, TNF } from '../types'
import { delay } from '.'

export async function iniciar(url: string) {
  try {
    logger.info('Iniciando...')
    const browser = await puppeteer.launch({ headless: 'new' })
    const pagina = await browser.newPage()
    await pagina.goto(url)
    return { browser, pagina }
  } catch (error) {
    logger.info('Não foi possível iniciar')
    logger.error(error)
  }
}

export async function login({ browser, cnpj, pagina, senha, usuario }: { browser: Browser, pagina: Page, cnpj: string, senha: string, usuario: string}) {
  try {
    logger.info(`Login [${pagina.url()}]`)
    await pagina.type('[formcontrolname=cnpj]', cnpj)
    await pagina.type('[formcontrolname=usuario]', usuario)
    await pagina.type('[formcontrolname=senha]', senha)
    await pagina.click('button')
    await pagina.waitForNavigation()
    const dashboardURL = pagina.url()
    const cookies = await pagina.cookies()
    const dashboard = await browser.newPage()
    await dashboard.setCookie(...cookies)
    await dashboard.goto(dashboardURL)
    logger.info(`Dashboard [${dashboardURL}]`)
    return dashboard
  } catch (error) {
    logger.info('Não foi possível realizar o login')
    logger.error(error)
  }
}

export async function navegarParaEstoque(browser: Browser, estoqueURL: string) {
  try {
    logger.info(`Estoque [${estoqueURL}]`)
    const estoque = await browser.newPage()
    await estoque.goto(estoqueURL)
    return estoque
  } catch (error) {
    logger.info('Não foi possível navegar para Estoque')
    logger.error(error)
  }
}

export async function navegarParaEntradaNF(browser: Browser, entradaNfURL: string) {
  try {
    logger.info(`Entrada NF [${entradaNfURL}]`)
    const entradaNF = await browser.newPage()
    await entradaNF.goto(entradaNfURL)
    return entradaNF
  } catch (error) {
    logger.info('Não foi possível navegar para Entrada NF')
    logger.error(error)
  }
}

export async function buscarNotasPendentes(pagina: Page) {
  try {
    logger.info('Buscando notas pendentes...')
    await pagina.click('#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes')
    await pagina.waitForSelector('#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes[checked=checked]')
  } catch (error) {
    logger.info('Não foi possível buscar notas pendentes para entrada')
    logger.error(error)
  }
}

export async function selecionarQuantidadeDeItensPagina(pagina: Page) {
  try {
    logger.info('Selecionando Quantidade de registros por página...')
    await delay()
    await pagina.select('#ContentPlaceHolder1_ddlPageSize', '60')
    await delay()
  } catch (error) {
    logger.info('Não foi possível selecionar a quantidade de registros por página')
    logger.error(error)
  }
}

export async function obterNotasPendentesNaPagina(pagina: Page) {
  try {
    logger.info('Obtendo notas pendentes na página...')
    return await pagina.evaluate(() => {
      const tabela = document.getElementById('ContentPlaceHolder1_gvDados')
      const nfs: TNF[] = []
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
  } catch (error) {
    logger.info('Não foi retornar as notas pendentes')
    logger.error(error)
  }
}

export async function navegarParaProximaPagina(pagina: Page, proximaPaginaId: string) {
  try {
    logger.info('Navegando para próxima página...')
    await pagina.click(`#${proximaPaginaId}`)
    await delay()
  } catch (error) {
    logger.info('Não foi possível navegar para a próxima página')
    logger.error(error)
  }
}

export async function navegarParaItensDaNF(codigoDaNF: string, browser: Browser) {
  const itensNfURL = `https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=${codigoDaNF}`
  try {
    const itensNf = await browser.newPage()
    await itensNf.goto(itensNfURL)
    logger.info(`Itens NF [${itensNf.url()}]`)
    return { itensNf, itensNfURL }
  } catch (error) {
    logger.info(`Não foi possível navegar para ${itensNfURL}`)
    logger.error(error)
  }
}

export async function obterProdutosNaoAssociados(pagina: Page) {
  try {
    const tabela = await pagina.waitForSelector('#ContentPlaceHolder1_gvDados')
    return await pagina.evaluate(el => {
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
      let proximaPaginaId = null
      const paginas = document.querySelectorAll('.pagination')
      paginas.forEach(pagina => {
        if (pagina.textContent === 'Próximo') proximaPaginaId = pagina.id
      })
      return { produtosNaoAssociados: array, proximaPaginaId } 
    }, tabela)
  } catch (error) {
    logger.info('Não foi possível obter os produtos não associados')
    logger.error(error)
  }
}

export async function associarProduto(produto: TDadosDoProduto, url: string, browser: Browser) {
  try {
    const { barra, id } = produto
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
      logger.info('O produto não está cadastrado!')
      return
    }

    const salvar = await itensNf.waitForSelector('#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_btnSalvar')
    await salvar.evaluate(b => (b as HTMLButtonElement).click())
    await delay()
    logger.info('Produto associado!')
  } catch (error) {
    logger.info('Algo deu errado! Não foi possível associar o produto')
    logger.error(error)
  }
}

export function finalizar(browser: Browser) {
  browser.close()
  logger.info('Execução finalizada!')
}
