import type { Browser, Page } from 'puppeteer'
import dotenv from 'dotenv'
import type { TNote, TReport } from '../types'
import { type TDataDB, saveAssociatedProductInDB } from '@/db'
import { logger } from '@/config'
import { print, saveFinishedNote, saveUnregisteredProduct } from '@/utils'
import {
  associateProduct,
  getPendingNotes,
  getPendingNotesOnThePage,
  getUnassociatedProducts,
  login,
  navigateToEntradaNf,
  navigateToEstoque,
  navigateToItensDaNF,
  navigateToNextPage,
  selectNumberOfItemsPerPage,
  start
} from './steps'
import { getEntradaNfURL, getEstoqueURL } from './regex'

dotenv.config()

const url = process.env.URL
const cnpj = process.env.CNPJ
const user = process.env.USER
const password = process.env.PASSWORD

export async function loginAndNavigateToEstoque() {
  let attempts = 0
  while (attempts < 3) {
    try {
      if (attempts > 0) {
        const message = 'Retentando...'
        logger.info(message)
        print(message)
      }
      if (!URL || !cnpj || !user || !password) {
        throw new Error('Insira as credenciais de acesso no arquivo .env')
      }
      const startData = await start(url || '')
      if (!startData) throw new Error('Start data is undefined')

      const { browser, page } = startData

      const dashboard = await login({
        page,
        browser,
        cnpj,
        user,
        password
      })
      if (!dashboard) throw new Error('Dashboard page is undefined')

      const dashboardHTML = await dashboard.content()
      const estoqueURL = getEstoqueURL(dashboardHTML)
      if (!estoqueURL) throw new Error('URL de Estoque não encontrada!')

      const estoque = await navigateToEstoque(browser, estoqueURL)
      if (!estoque) throw new Error('Estoque page is undefined')

      return { estoque, browser }
    } catch (error) {
      attempts++
      logger.error(error)
      print(error as string)
    }
  }
}

export async function getAllPendingNotes(estoque: Page, browser: Browser) {
  let attempts = 0
  while (attempts < 3) {
    if (attempts > 0) {
      const message = 'Retentando...'
      logger.info(message)
      print(message)
    }
    try {
      const estoqueHTML = await estoque.content()
      const entradaNfURL = getEntradaNfURL(estoqueHTML)
      if (!entradaNfURL) throw new Error('URL de Entrada NF não encontrada!')

      const entradaNF = await navigateToEntradaNf(browser, entradaNfURL)
      if (!entradaNF) throw new Error('Entrada NF page is undefined')

      await getPendingNotes(entradaNF)

      await selectNumberOfItemsPerPage(entradaNF)

      let page = 1
      const pendingData = await getPendingNotesOnThePage(entradaNF, page)
      if (!pendingData) throw new Error('Pending notes data is undefined')

      const { nfs: n, nextPageId: id } = pendingData

      const nfs = [...n]

      let nextPageId = id
      while (nextPageId) {
        page++
        await navigateToNextPage(entradaNF, nextPageId)
        const pendingData = await getPendingNotesOnThePage(entradaNF, page)
        if (!pendingData) throw new Error('Pending notes data is undefined')

        const { nfs: n, nextPageId: id } = pendingData

        nfs.push(...n)
        nextPageId = id
      }
      return { nfs, browser }
    } catch (error) {
      attempts++
      logger.error(error)
      print(error as string)
      browser.close()
      const r = await loginAndNavigateToEstoque()
      if (!r) throw new Error('Não foi possível atualizar o browser')
      const { browser: b, estoque: e } = r
      browser = b
      estoque = e
    }
  }
}

export async function startActions(nfs: TNote[], browser: Browser) {
  print(
    `Realizando ações em ${nfs.length} not${nfs.length > 1 ? 'as' : 'a'}...`
  )

  const unassociatedReport: TReport[] = []

  let attempts = 0
  let i = 0
  while (i < nfs.length && attempts < 10) {
    try {
      const nf = nfs[i]
      const { description, code } = nf

      const itensNfData = await navigateToItensDaNF(code, browser)
      if (!itensNfData) throw new Error('Itens NF data is undefined')

      const { itensNf, itensNfURL } = itensNfData
      const descriptionDaNF = `${i + 1}  - ${description} [${itensNfURL}]`
      print(descriptionDaNF)

      unassociatedReport.push({
        nf: descriptionDaNF,
        products: []
      })

      await selectNumberOfItemsPerPage(itensNf)

      const unassociatedData = await getUnassociatedProducts(itensNf)
      if (!unassociatedData) throw new Error('Unassociated data is undefined')

      const { products: unassociated, nextPageId: id } = unassociatedData
      let products = [...unassociated]

      let nextPageId = id
      let page = 1
      let firstScan = true

      while (firstScan || nextPageId) {
        if (nextPageId && !firstScan) {
          await navigateToNextPage(itensNf, nextPageId)

          const unassociatedData = await getUnassociatedProducts(itensNf)
          if (!unassociatedData)
            throw new Error('Unassociated data is undefined')

          const { products: unassociated, nextPageId: id } = unassociatedData
          products = [...unassociated]
          nextPageId = id
          page++
          print(`Página ${page}`)
        }
        firstScan = false

        if (products.length === 0) {
          print('Todos os produtos já foram associados!')
          if (nextPageId) continue
          else break
        }

        print(`Quantidade de produtos não associados: ${products.length}`)
        for (let j = 0; j < products.length; j++) {
          const product = products[j]
          const { name, xmlBar, bar } = product
          const b = xmlBar === bar ? xmlBar : `${xmlBar} - ${bar}`
          const productDescription = `${j + 1} - ${name} - ${b}`
          print(productDescription)
          const r = await associateProduct(product, itensNf)
          const p: TDataDB = {
            note: descriptionDaNF,
            product: productDescription,
            createdAt: new Date().toISOString()
          }
          if (r) {
            try {
              await saveAssociatedProductInDB(p)
            } catch (error) {
              logger.error(error)
              print(error as string)
            }
          } else {
            await saveUnregisteredProduct(p)
            unassociatedReport[i].products.push(productDescription)
          }
        }
      }
      if (unassociatedReport[i].products.length === 0)
        await saveFinishedNote(nf)
      i++
    } catch (error) {
      attempts++
      logger.error(error)
      print(error as string)
      browser.close()
      const r = await loginAndNavigateToEstoque()
      if (!r) throw new Error('Não foi possível atualizar o browser')
      const { browser: b } = r
      browser = b
    }
  }
  return browser
}
