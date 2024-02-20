import { Browser, Page } from 'puppeteer'
import dotenv from 'dotenv'
import { associarProduto, buscarNotasPendentes, iniciar, login, navegarParaEntradaNF, navegarParaEstoque, navegarParaItensDaNF, navegarParaProximaPagina, obterNotasPendentesNaPagina, obterProdutosNaoAssociados, selecionarQuantidadeDeItensPagina } from './steps'
import { obterEntradaNfURL, obterEstoqueURL } from './regex'
import { logger, print, printRelatorio } from '../logger-config'
import { TNF, TRelatorio } from '../types'
import { gerarRelatorioDeNfsFinalizadas } from './utils'

dotenv.config()

const URL = process.env.URL as string
const CNPJ = process.env.CNPJ as string
const USUARIO = process.env.USUARIO as string
const SENHA = process.env.SENHA as string

export async function realizarLoginENavegarParaEstoque() {
  let tentativas = 0
  while (tentativas < 3) {
    try {
      if (tentativas > 0) {
        const mensagem = 'Retentando...'
        logger.info(mensagem)
        print(mensagem)
      }
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
      print(error)
    }
  }
}

export async function obterTodasAsNotasPendentes(estoque: Page, browser: Browser) {
  let tentativas = 0
  while (tentativas < 3) {
    if (tentativas > 0) {
      const mensagem = 'Retentando...'
      logger.info(mensagem)
      print(mensagem)
    }
    try {
      const estoqueHTML = await estoque.content()
      const entradaNfURL = obterEntradaNfURL(estoqueHTML)
      if (!entradaNfURL) throw 'URL de Entrada NF não encontrada!'

      const entradaNF = await navegarParaEntradaNF(browser, entradaNfURL)

      await buscarNotasPendentes(entradaNF)

      await selecionarQuantidadeDeItensPagina(entradaNF)

      const { nfs: n, proximaPaginaId: id } = await obterNotasPendentesNaPagina(entradaNF)
      const nfs = [...n]

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
      print(error)
      const { browser: b, estoque: e } = await realizarLoginENavegarParaEstoque()
      browser = b
      estoque = e
    }
  }

}

export async function realizarAcoes(nfs: TNF[], browser: Browser) {
  const relatorioAssociados: TRelatorio = []
  const relatorioNaoAssociados: TRelatorio = []

  print(`Quantidade de notas pendentes ${nfs.length}`)
  let tentativas = 0
  let i = 0
  while (i < nfs.length && tentativas < 10) {
    try {
      const nf = nfs[i]
      const { descricao, codigo } = nf

      const { itensNf, itensNfURL } = await navegarParaItensDaNF(codigo, browser)
      const descricaoDaNF = `${(i + 1)}  - ${descricao} [${itensNfURL}]`
      print(descricaoDaNF)

      relatorioAssociados.push({
        nf: descricaoDaNF,
        produtos: []
      })
      relatorioNaoAssociados.push({
        nf: descricaoDaNF,
        produtos: []
      })

      await selecionarQuantidadeDeItensPagina(itensNf)

      const { produtosNaoAssociados: pna, proximaPaginaId: id } = await obterProdutosNaoAssociados(itensNf)
      let produtosNaoAssociados = [...pna]

      let proximaPaginaId = id
      let pagina = 1
      while (pagina === 1 || proximaPaginaId) {
        if (proximaPaginaId && pagina > 1) {
          await navegarParaProximaPagina(itensNf, proximaPaginaId)
          
          const { produtosNaoAssociados: pna, proximaPaginaId: id } = await obterProdutosNaoAssociados(itensNf)
          produtosNaoAssociados = [...pna]
          
          proximaPaginaId = id
          print(`Página ${pagina}`)
        }
        pagina++

        if (produtosNaoAssociados.length === 0) {
          print('Todos os produtos já foram associados!')
          await gerarRelatorioDeNfsFinalizadas(nf)
          break
        }

        print(`Quantidade de produtos não associados: ${produtosNaoAssociados.length}`)
        for (let j = 0; j < produtosNaoAssociados.length; j++) {
          const produto = produtosNaoAssociados[j]
          const { nome, barraXML } = produto
          const descricaoDoProduto = `${j + 1} - ${nome} - ${barraXML}`
          print(descricaoDoProduto)
          const r = await associarProduto(produto, itensNf)
          r ? relatorioAssociados[i].produtos.push(descricaoDoProduto) : relatorioNaoAssociados[i].produtos.push(descricaoDoProduto)
        }
        if (relatorioNaoAssociados[i].produtos.length === 0) await gerarRelatorioDeNfsFinalizadas(nf)
      }
      i++
    } catch (error) {
      tentativas++
      logger.error(error)
      print(error)
      const { browser: b } = await realizarLoginENavegarParaEstoque()
      browser = b
    }
  }

  print('Associados: ')
  printRelatorio(relatorioAssociados)

  print('Não Associados: ')
  printRelatorio(relatorioNaoAssociados)

  return browser
}
