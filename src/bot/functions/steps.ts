import type { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import { logger } from '@/config'
import { delay, print } from '@/utils'
import type { TNote, TProduct } from '../types'

export async function start(url: string) {
  try {
    print('Iniciando...')
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto(url)
    return { browser, page }
  } catch (error) {
    print('Não foi possível iniciar')
    logger.error(error)
  }
}

export async function login({
  browser,
  cnpj,
  page,
  password,
  user
}: {
  browser: Browser
  page: Page
  cnpj: string
  password: string
  user: string
}) {
  try {
    print(`Login [${page.url()}]`)
    await page.type('[formcontrolname=cnpj]', cnpj)
    await page.type('[formcontrolname=usuario]', user)
    await page.type('[formcontrolname=senha]', password)
    await page.click('button')
    await page.waitForNavigation()
    const dashboardURL = page.url()
    const cookies = await page.cookies()
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

export async function navigateToEstoque(browser: Browser, estoqueURL: string) {
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

export async function navigateToEntradaNf(
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

export async function getPendingNotes(page: Page) {
  try {
    print('Buscando notas pendentes...')
    await page.click(
      '#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes'
    )
    await page.waitForSelector(
      '#ContentPlaceHolder1_ASPxRoundPanelMaisFiltros_chkPendentes[checked=checked]'
    )
  } catch (error) {
    print('Não foi possível buscar notas pendentes para entrada')
    logger.error(error)
  }
}

export async function selectNumberOfItemsPerPage(page: Page) {
  try {
    print('Selecionando quantidade de registros por página...')
    await delay()
    await page.select('#ContentPlaceHolder1_ddlPageSize', '60')
    await delay()
  } catch (error) {
    print('Não foi possível selecionar a quantidade de registros por página')
    logger.error(error)
  }
}

export async function getPendingNotesOnThePage(
  page: Page,
  numberOfPage: number
) {
  try {
    print(`Obtendo notas pendentes na página ${numberOfPage}...`)
    const result = await page.evaluate(() => {
      const table = document.getElementById('ContentPlaceHolder1_gvDados')
      if (!table) return
      const nfs: TNote[] = []
      const tds = table.querySelectorAll('td')
      tds.forEach((td, index) => {
        td.title &&
          nfs.push({
            description: `${tds[index - 2].textContent} - ${td.textContent}`,
            code: tds[index - 3].textContent || '',
            number: tds[index - 2].textContent || ''
          })
      })
      let nextPageId = null
      const pages = document.querySelectorAll('.pagination')
      pages.forEach((page) => {
        if (page.textContent === 'Próximo') nextPageId = page.id
      })
      return { nfs, nextPageId }
    })
    return result
  } catch (error) {
    print('Não foi retornar as notas pendentes')
    logger.error(error)
  }
}

export async function navigateToNextPage(page: Page, nextPageId: string) {
  try {
    print('Navegando para próxima página...')
    await page.click(`#${nextPageId}`)
    await delay()
  } catch (error) {
    print('Não foi possível navegar para a próxima página')
    logger.error(error)
  }
}

export async function navigateToItensDaNF(code: string, browser: Browser) {
  const itensNfURL = `https://www.sambanet.net.br/sambanet/estoque2/Forms/EntradaNFItensRM.aspx?nf=${code}`
  try {
    const itensNf = await browser.newPage()
    await itensNf.goto(itensNfURL)
    return { itensNf, itensNfURL }
  } catch (error) {
    print(`Não foi possível navegar para ${itensNfURL}`)
    logger.error(error)
  }
}

export async function getUnassociatedProducts(page: Page) {
  try {
    const table = await page.waitForSelector('#ContentPlaceHolder1_gvDados')
    const result = await page.evaluate((el) => {
      if (!el) return
      const calcBarCode = (xmlBar: string) => {
        const array = xmlBar.slice(1, -1).split('')
        const sum = array.reduce(
          (total, number, i) =>
            (total += i % 2 === 0 ? Number(number) * 1 : Number(number) * 3),
          0
        )
        const lastDigit = ((Math.floor(sum / 10) + 1) * 10 - sum) % 10
        const bar = array.join('') + lastDigit
        return bar
      }
      const array: TProduct[] = []
      const trs = el.querySelectorAll('tr')
      trs.forEach((tr) => {
        const a = tr.querySelector('a')
        if (!a || a.textContent !== 'Associar Produto') return
        const tds = tr.querySelectorAll('td')
        const xmlBar = tds[5].textContent || ''
        const bar = xmlBar.length === 14 ? calcBarCode(xmlBar) : xmlBar
        array.push({
          id: a.id,
          name: tds[6].textContent || '',
          bar,
          xmlBar
        })
      })
      let nextPageId = null
      const pages = document.querySelectorAll('.pagination')
      pages.forEach((page) => {
        if (page.textContent === 'Próximo') nextPageId = page.id
      })
      return { products: array, nextPageId }
    }, table)
    return result
  } catch (error) {
    print('Não foi possível obter os produtos não associados')
    logger.error(error)
  }
}

export async function associateProduct(product: TProduct, itensNf: Page) {
  print('Tentando associar produto...')

  const { bar, id, name } = product

  if (bar === 'SEM GTIN') {
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
    bar
  )
  await delay()
  await itensNf.keyboard.press('Tab')
  await delay(10000)

  const window = await itensNf.waitForSelector(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_PW-1'
  )
  if (!window) return

  const result = await window.evaluate((el) => {
    const bar = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtBarraSamba'
    )
    const code = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtCodprodSamba'
    )
    const name = el.querySelector(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_txtDescricao'
    )
    return {
      bar: bar ? (bar as HTMLInputElement).value : null,
      code: code ? (code as HTMLInputElement).value : null,
      name: name ? (name as HTMLInputElement).value : null
    }
  })

  if (result.name !== name) {
    const error = 'O script não conseguiu fechar a janela anterior!'
    logger.error(error)
    throw new Error(error)
  }

  if (!result.code || bar !== result.bar) {
    print('O produto não está cadastrado!')
    await itensNf.click(
      '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_HCB-1'
    )
    await delay()
    return
  }

  const save = await itensNf.waitForSelector(
    '#ContentPlaceHolder1_AssociarProduto_ASPxPopupControlAssociarProduto_btnSalvar'
  )
  if (!save) return
  await save.evaluate((b) => {
    b && (b as HTMLButtonElement).click()
  })
  await delay()
  print('Produto associado!')
  return true
}

export function stop(browser: Browser) {
  if (!browser) throw new Error('Não foi possível finalizar!')
  print('Execução finalizada!')
  browser.close()
}
