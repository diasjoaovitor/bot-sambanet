import { Browser, Page } from 'puppeteer'
import dotenv from 'dotenv'
import { associarProduto, buscarNotasPendentes, iniciar, login, navegarParaEntradaNF, navegarParaEstoque, navegarParaItensDaNF, navegarParaProximaPagina, obterNotasPendentesNaPagina, obterProdutosNaoAssociados, selecionarQuantidadeDeItensPagina } from './steps'
import { obterEntradaNfURL, obterEstoqueURL } from './regex'
import { logger } from '../logger-config'
import { TNF } from '../types'

dotenv.config()

const URL = process.env.URL as string
const CNPJ = process.env.CNPJ as string
const USUARIO = process.env.USUARIO as string
const SENHA = process.env.SENHA as string

export async function realizarLoginENavegarParaEstoque() {
  let tentativas = 0
  while (tentativas < 3) {
    try {
      if (tentativas > 0) logger.info('Retentando...')
      const { browser, pagina } = await iniciar(URL) 

      const dashboard = await login({ pagina, browser, cnpj: CNPJ, usuario: USUARIO, senha: SENHA })
      if (!dashboard) return

      const dashboardHTML = await dashboard.content()
      const estoqueURL = obterEstoqueURL(dashboardHTML)
      if (!estoqueURL) throw 'URL de Estoque não encontrada!'

      const estoque = await navegarParaEstoque(browser, estoqueURL)
      return { estoque, browser }
    } catch (error) {
      tentativas++
      logger.error(error)
    }
  }
}

export async function obterTodasAsNotasPendentes(estoque: Page, browser: Browser) {
  let tentativas = 0
  while (tentativas < 3) {
    if (tentativas > 0) logger.info('Retentando...')
    try {
      const estoqueHTML = await estoque.content()
      const entradaNfURL = obterEntradaNfURL(estoqueHTML)
      if (!entradaNfURL) throw 'URL de Entrada NF não encontrada!'

      const entradaNF = await navegarParaEntradaNF(browser, entradaNfURL)

      await buscarNotasPendentes(entradaNF)

      await selecionarQuantidadeDeItensPagina(entradaNF)

      const { nfs: n, proximaPaginaId: id } = await obterNotasPendentesNaPagina(entradaNF)
      const nfs = [ ...n ]

      let proximaPaginaId = id
      while (proximaPaginaId) {
        await navegarParaProximaPagina(entradaNF, proximaPaginaId)
        const { nfs: n, proximaPaginaId: id } = await obterNotasPendentesNaPagina(entradaNF)
        nfs.push(...n)
        proximaPaginaId = id
      }
      return { nfs, browser }
    } catch (error) {
      tentativas++
      logger.error(error)
      const { browser: b, estoque: e } = await realizarLoginENavegarParaEstoque()
      browser = b
      estoque = e
    }
  }
  
}

export async function realizarAcoes(nfs: TNF[], browser: Browser) {
  logger.info(`Quantidade de notas pendentes ${nfs.length}`)
  let tentativas = 0
  let i = 0
  while (i < nfs.length && tentativas < 10) {
    try {
      const { descricao, codigo } = nfs[i]

      const { itensNf, itensNfURL } = await navegarParaItensDaNF(codigo, browser)
      logger.info(`${(i + 1)}  - ${descricao} - Itens da Nota Fiscal [${itensNfURL}]`)

      await selecionarQuantidadeDeItensPagina(itensNf)

      const { produtosNaoAssociados: pna, proximaPaginaId: id } = await obterProdutosNaoAssociados(itensNf)
      let produtosNaoAssociados = [...pna]

      let proximaPaginaId = id
      let pagina = 1
      while (pagina === 1 || proximaPaginaId) {
        if (pagina > 1) {
          await navegarParaProximaPagina(itensNf, proximaPaginaId)
          
          const { produtosNaoAssociados: pna, proximaPaginaId: id } = await obterProdutosNaoAssociados(itensNf)
          produtosNaoAssociados = [...pna]
          
          proximaPaginaId = id
          logger.info(`Página ${pagina}`)
          pagina++
        }

        if (produtosNaoAssociados.length === 0) {
          logger.info('Todos os produtos já foram associados!')
          break
        }

        logger.info(`Quantidade de produtos não associados: ${produtosNaoAssociados.length}`)
        for (let j = 0; j < produtosNaoAssociados.length; j++) {
          const produto = produtosNaoAssociados[j]
          const { nome, barraXML } = produto
          logger.info(`${j + 1} - ${nome} - ${barraXML}`)
          await associarProduto(produto, itensNfURL, browser)
        }
        break
      } 
      i++
    } catch (error) {
      tentativas++
      logger.error(error)
      const { browser: b } = await realizarLoginENavegarParaEstoque()
      browser = b
    }
   }
   return browser
 }
 