import { 
  buscarNotasPendentes, 
  finalizar, 
  iniciar, 
  login, 
  navegarParaEntradaNF, 
  navegarParaEstoque, 
  navegarParaProximaPagina, 
  obterEntradaNfURL, 
  obterEstoqueURL, 
  obterNotasPendentes, 
  realizarAcoes, 
  selecionarQuantidadeDeItensPagina 
} from './functions'
import { logger } from './logger-config'

(async () => {
  let { browser, pagina } = await iniciar() 
  try {
    const dashboard = await login(pagina, browser)
    if (!dashboard) return

    const dashboardHTML = await dashboard.content()
    const estoqueURL = obterEstoqueURL(dashboardHTML)
    if (!estoqueURL) throw 'URL de Estoque não encontrada!'

    const estoque = await navegarParaEstoque(browser, estoqueURL)
    if (!estoque) return

    const estoqueHTML = await estoque.content()
    const entradaNfURL = obterEntradaNfURL(estoqueHTML)
    if (!entradaNfURL) throw 'URL de Entrada NF não encontrada!'

    const entradaNF = await navegarParaEntradaNF(browser, entradaNfURL)
    if (!entradaNF) return

    const rBuscarNotasPendentes = await buscarNotasPendentes(entradaNF)
    if (!rBuscarNotasPendentes) return

    const rSelecionarQuantidadeDeItensPagina = await selecionarQuantidadeDeItensPagina(entradaNF)
    if (!rSelecionarQuantidadeDeItensPagina) return

    const rObterNotasPendentes = await obterNotasPendentes(entradaNF)
    if (!rObterNotasPendentes) return

    const { nfs: n, proximaPaginaId: id } = rObterNotasPendentes
    const nfs = [ ...n ]
    let proximaPaginaId = id
    while (proximaPaginaId) {
      const rNavegarParaProximaPagina = await navegarParaProximaPagina(entradaNF, proximaPaginaId)
      if (!rNavegarParaProximaPagina) break
      const rObterNotasPendentes = await obterNotasPendentes(entradaNF)
      if (!rObterNotasPendentes) break
      const { nfs: n, proximaPaginaId: id } = rObterNotasPendentes
      nfs.push(...n)
      proximaPaginaId = id
    }
    browser = await realizarAcoes(nfs, browser)
  } catch (error) {
    logger.info(error)
  } finally {
    finalizar(browser)
  }
})()
