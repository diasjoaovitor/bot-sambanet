import type { Browser, Page } from 'puppeteer'
import type { TDadosDoProduto, TNF } from '../types'
import puppeteer from 'puppeteer'
import { logger } from '@/config'
import { delay, print } from '../utils'

export async function iniciar(url: string) {
  try {
    print('Iniciando...')
    const browser = await puppeteer.launch({ headless: 'shell' })
    const pagina = await browser.newPage()
    await pagina.goto(url)
    return { browser, pagina }
  } catch (error) {
    print('Não foi possível iniciar')
    logger.error(error)
  }
}

export async function login({
  browser,
  cnpj,
  pagina,
  senha,
  usuario
}: {
  browser: Browser
  pagina: Page
  cnpj: string
  senha: string
  usuario: string
}) {
  try {
    print(`Login [${pagina.url()}]`)
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
    print(`Dashboard [${dashboardURL}]`)
    return dashboard
  } catch (error) {
    print('Não foi possível realizar o login')
    logger.error(error)
  }
}

export async function navegarParaEstoque(browser: Browser, estoqueURL: string) {
  try {
    print(`Estoque [${estoqueURL}]`)
    const estoque = await browser.newPage()
    await estoque.goto(estoqueURL)
    return estoque
  } catch (error) {
    print('Não foi possível navegar para Estoque')
    logger.error(error)
  }
}

export async function navegarParaEntradaNF(
  browser: Browser,
  entradaNfURL: string
) {
  try {
    print(`Entrada NF [${entradaNfURL}]`)
    const entradaNF = await browser.newPage()
    await entradaNF.goto(entradaNfURL)
    return entradaNF
  } catch (error) {
    print('Não foi possível navegar para Entrada NF')
    logger.error(error)
  }
}

export async function buscarNotasPendentes(pagina: Page) {
  try {
    print('Buscando notas pendentes...')
    await pagina.click(
      '#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes'
    )
    await pagina.waitForSelector(
      '#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes[checked=checked]'
    )
  } catch (error) {
    print('Não foi possível buscar notas pendentes para entrada')
    logger.error(error)
  }
}

export async function selecionarQuantidadeDeItensPagina(pagina: Page) {
  try {
    print('Selecionando quantidade de registros por página...')
    await delay()
    await pagina.select('#ContentPlaceHolder1_ddlPageSize', '60')
    await delay()
  } catch (error) {
    print('Não foi possível selecionar a quantidade de registros por página')
    logger.error(error)
  }
}

export async function obterNotasPendentesNaPagina(
  pagina: Page,
  numeroDaPagina: number
) {
  try {
    print(`Obtendo notas pendentes na página ${numeroDaPagina}...`)
    const resultado = await pagina.evaluate(() => {
      const tabela = document.getElementById('ContentPlaceHolder1_gvDados')
      if (!tabela) return
      const nfs: TNF[] = []
      const tds = tabela.querySelectorAll('td')
      tds.forEach((td, index) => {
        td.title &&
          nfs.push({
            descricao: `${tds[index - 2].textContent} - ${td.textContent}`,
            codigo: tds[index - 3].textContent || '',
            numero: tds[index - 2].textContent || ''
          })
      })
      let proximaPaginaId = null
      const paginas = document.querySelectorAll('.pagination')
      paginas.forEach((pagina) => {
        if (pagina.textContent === 'Próximo') proximaPaginaId = pagina.id
      })
      return { nfs, proximaPaginaId }
    })
    return resultado
  } catch (error) {
    print('Não foi retornar as notas pendentes')
    logger.error(error)
  }
}

export async function navegarParaProximaPagina(
  pagina: Page,
  proximaPaginaId: string
) {
  try {
    print('Navegando para próxima página...')
    await pagina.click(`#${proximaPaginaId}`)
    await delay()
  } catch (error) {
    print('Não foi possível navegar para a próxima página')
    logger.error(error)
  }
}

export async function navegarParaItensDaNF(
  codigoDaNF: string,
  browser: Browser
) {
  const itensNfURL = `https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=${codigoDaNF}`
  try {
    const itensNf = await browser.newPage()
    await itensNf.goto(itensNfURL)
    return { itensNf, itensNfURL }
  } catch (error) {
    print(`Não foi possível navegar para ${itensNfURL}`)
    logger.error(error)
  }
}

export async function obterProdutosNaoAssociados(pagina: Page) {
  try {
    const tabela = await pagina.waitForSelector('#ContentPlaceHolder1_gvDados')
    const resultado = await pagina.evaluate((el) => {
      if (!el) return
      const calcularCodigoDeBarras = (barraXML: string) => {
        const array = barraXML.slice(1, -1).split('')
        const soma = array.reduce(
          (total, numero, i) =>
            (total += i % 2 === 0 ? Number(numero) * 1 : Number(numero) * 3),
          0
        )
        const ultimoDigito = ((Math.floor(soma / 10) + 1) * 10 - soma) % 10
        const barra = array.join('') + ultimoDigito
        return barra
      }
      const array: TDadosDoProduto[] = []
      const trs = el.querySelectorAll('tr')
      trs.forEach((tr) => {
        const a = tr.querySelector('a')
        if (!a || a.textContent !== 'Associar Produto') return
        const tds = tr.querySelectorAll('td')
        const barraXML = tds[5].textContent || ''
        const barra =
          barraXML.length === 14 ? calcularCodigoDeBarras(barraXML) : barraXML
        array.push({
          id: a.id,
          nome: tds[6].textContent || '',
          barra,
          barraXML
        })
      })
      let proximaPaginaId = null
      const paginas = document.querySelectorAll('.pagination')
      paginas.forEach((pagina) => {
        if (pagina.textContent === 'Próximo') proximaPaginaId = pagina.id
      })
      return { produtosNaoAssociados: array, proximaPaginaId }
    }, tabela)
    return resultado
  } catch (error) {
    print('Não foi possível obter os produtos não associados')
    logger.error(error)
  }
}

export async function associarProduto(produto: TDadosDoProduto, itensNf: Page) {
  print('Tentando associar produto...')

  const { barra, id, nome } = produto

  if (barra === 'SEM GTIN') {
    print('O produto não está cadastrado!')
    return
  }

  await itensNf.click(`#${id}`)
  await itensNf.waitForSelector(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_PW-1'
  )
  await delay()
  await itensNf.focus(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba'
  )
  await itensNf.type(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba',
    barra
  )
  await delay()
  await itensNf.keyboard.press('Tab')
  await delay(10000)

  const janela = await itensNf.waitForSelector(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_PW-1'
  )
  if (!janela) return

  const resultado = await janela.evaluate((el) => {
    const barra = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba'
    )
    const codigo = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtCodprodSamba'
    )
    const nome = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtDescricao'
    )
    return {
      barra: barra ? (barra as HTMLInputElement).value : null,
      codigo: codigo ? (codigo as HTMLInputElement).value : null,
      nome: nome ? (nome as HTMLInputElement).value : null
    }
  })

  if (resultado.nome !== nome) {
    const error = 'O script não conseguiu fechar a janela anterior!'
    logger.error(error)
    throw new Error(error)
  }

  if (!resultado.codigo || barra !== resultado.barra) {
    print('O produto não está cadastrado!')
    await itensNf.click(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_HCB-1'
    )
    await delay()
    return
  }

  const salvar = await itensNf.waitForSelector(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_btnSalvar'
  )
  if (!salvar) return
  await salvar.evaluate((b) => {
    b && (b as HTMLButtonElement).click()
  })
  await delay()
  print('Produto associado!')
  return true
}

export function finalizar(browser: Browser) {
  if (!browser) throw new Error('Não foi possível finalizar!')
  print('Execução finalizada!')
  browser.close()
}
