import type { Browser, Page } from 'puppeteer'
import type { TNF, TRelatorio } from '../types'
import dotenv from 'dotenv'
import { salvarProdutoAssociado, type TProdutoDB } from '@/db'
import { logger } from '@/config'
import {
  associarProduto,
  buscarNotasPendentes,
  iniciar,
  login,
  navegarParaEntradaNF,
  navegarParaEstoque,
  navegarParaItensDaNF,
  navegarParaProximaPagina,
  obterNotasPendentesNaPagina,
  obterProdutosNaoAssociados,
  selecionarQuantidadeDeItensPagina
} from './steps'
import { obterEntradaNfURL, obterEstoqueURL } from './regex'
import {
  print,
  salvarAssociadosQueNaoForamSalvosNoBanco,
  salvarNfsFinalizadas
} from '@/utils'

dotenv.config()

const URL = process.env.URL
const CNPJ = process.env.CNPJ
const USUARIO = process.env.USUARIO
const SENHA = process.env.SENHA

export async function realizarLoginENavegarParaEstoque() {
  let tentativas = 0
  while (tentativas < 3) {
    try {
      if (tentativas > 0) {
        const mensagem = 'Retentando...'
        logger.info(mensagem)
        print(mensagem)
      }
      if (!URL || !CNPJ || !USUARIO || !SENHA) {
        throw new Error('Insira as credenciais de acesso no arquivo .env')
      }
      const rIniciar = await iniciar(URL)
      if (!rIniciar) return

      const { browser, pagina } = rIniciar

      const dashboard = await login({
        pagina,
        browser,
        cnpj: CNPJ,
        usuario: USUARIO,
        senha: SENHA
      })
      if (!dashboard) return

      const dashboardHTML = await dashboard.content()
      const estoqueURL = obterEstoqueURL(dashboardHTML)
      if (!estoqueURL) throw new Error('URL de Estoque não encontrada!')

      const estoque = await navegarParaEstoque(browser, estoqueURL)
      if (!estoque) return

      return { estoque, browser }
    } catch (error) {
      tentativas++
      logger.error(error)
      print(error as string)
    }
  }
}

export async function obterTodasAsNotasPendentes(
  estoque: Page,
  browser: Browser
) {
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
      if (!entradaNfURL) throw new Error('URL de Entrada NF não encontrada!')

      const entradaNF = await navegarParaEntradaNF(browser, entradaNfURL)
      if (!entradaNF) return

      await buscarNotasPendentes(entradaNF)

      await selecionarQuantidadeDeItensPagina(entradaNF)

      let pagina = 1
      const rPendentes = await obterNotasPendentesNaPagina(entradaNF, pagina)
      if (!rPendentes) return

      const { nfs: n, proximaPaginaId: id } = rPendentes

      const nfs = [...n]

      let proximaPaginaId = id
      while (proximaPaginaId) {
        pagina++
        await navegarParaProximaPagina(entradaNF, proximaPaginaId)
        const rPendentes = await obterNotasPendentesNaPagina(entradaNF, pagina)
        if (!rPendentes) return

        const { nfs: n, proximaPaginaId: id } = rPendentes

        nfs.push(...n)
        proximaPaginaId = id
      }
      return { nfs, browser }
    } catch (error) {
      tentativas++
      logger.error(error)
      print(error as string)
      browser.close()
      const r = await realizarLoginENavegarParaEstoque()
      if (!r) throw new Error('Não foi possível atualizar o browser')
      const { browser: b, estoque: e } = r
      browser = b
      estoque = e
    }
  }
}

export async function realizarAcoes(nfs: TNF[], browser: Browser) {
  print(
    `Realizando ações em ${nfs.length} not${nfs.length > 1 ? 'as' : 'a'}...`
  )

  const relatorioNaoAssociados: TRelatorio[] = []

  let tentativas = 0
  let i = 0
  while (i < nfs.length && tentativas < 10) {
    try {
      const nf = nfs[i]
      const { descricao, codigo } = nf

      const rItensDsNF = await navegarParaItensDaNF(codigo, browser)
      if (!rItensDsNF) return

      const { itensNf, itensNfURL } = rItensDsNF
      const descricaoDaNF = `${i + 1}  - ${descricao} [${itensNfURL}]`
      print(descricaoDaNF)

      relatorioNaoAssociados.push({
        nf: descricaoDaNF,
        produtos: []
      })

      await selecionarQuantidadeDeItensPagina(itensNf)

      const rNaoAssociados = await obterProdutosNaoAssociados(itensNf)
      if (!rNaoAssociados) return

      const { produtosNaoAssociados: pna, proximaPaginaId: id } = rNaoAssociados
      let produtosNaoAssociados = [...pna]

      let proximaPaginaId = id
      let pagina = 1
      let primeiraVarredura = true

      while (primeiraVarredura || proximaPaginaId) {
        if (proximaPaginaId && !primeiraVarredura) {
          await navegarParaProximaPagina(itensNf, proximaPaginaId)

          const rNaoAssociados = await obterProdutosNaoAssociados(itensNf)
          if (!rNaoAssociados) return

          const { produtosNaoAssociados: pna, proximaPaginaId: id } =
            rNaoAssociados
          produtosNaoAssociados = [...pna]
          proximaPaginaId = id
          pagina++
          print(`Página ${pagina}`)
        }
        primeiraVarredura = false

        if (produtosNaoAssociados.length === 0) {
          print('Todos os produtos já foram associados!')
          if (proximaPaginaId) continue
          else break
        }

        print(
          `Quantidade de produtos não associados: ${produtosNaoAssociados.length}`
        )
        for (let j = 0; j < produtosNaoAssociados.length; j++) {
          const produto = produtosNaoAssociados[j]
          const { nome, barraXML, barra } = produto
          const b = barraXML === barra ? barraXML : `${barraXML} - ${barra}`
          const descricaoDoProduto = `${j + 1} - ${nome} - ${b}`
          print(descricaoDoProduto)
          const r = await associarProduto(produto, itensNf)
          const p: TProdutoDB = {
            nf: descricaoDaNF,
            nome: descricaoDoProduto,
            createdAt: new Date().toISOString()
          }
          if (r) {
            try {
              await salvarProdutoAssociado(p)
            } catch (error) {
              logger.error(error)
              print(error as string)
              await salvarAssociadosQueNaoForamSalvosNoBanco(p)
            }
          } else {
            await salvarAssociadosQueNaoForamSalvosNoBanco(p)
            relatorioNaoAssociados[i].produtos.push(descricaoDoProduto)
          }
        }
      }
      if (relatorioNaoAssociados[i].produtos.length === 0)
        await salvarNfsFinalizadas(nf)
      i++
    } catch (error) {
      tentativas++
      logger.error(error)
      print(error as string)
      browser.close()
      const r = await realizarLoginENavegarParaEstoque()
      if (!r) throw new Error('Não foi possível atualizar o browser')
      const { browser: b } = r
      browser = b
    }
  }
  return browser
}
