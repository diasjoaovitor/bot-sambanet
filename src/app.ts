import { Browser } from 'puppeteer'
import { 
  finalizar,
  obterNfsFinalizadas,
  obterTodasAsNotasPendentes, 
  realizarAcoes, 
  realizarLoginENavegarParaEstoque
} from './functions'
import { logger } from './logger-config'

(async () => {
  const notas = process.argv.slice(2, process.argv.length)

  let browser: Browser

  try {
    const { estoque, browser: b }  = await realizarLoginENavegarParaEstoque()
    browser = b

    const { browser: b2, nfs } = await obterTodasAsNotasPendentes(estoque, browser)
    browser = b2

    if (nfs.length === 0) {
      logger.info('Não há notas pendentes')
      return
    } 
    const finalizadas = await obterNfsFinalizadas()
    const nfsSelecionadas = notas[0] !== 'all' ? nfs.filter(({ codigo, numero }) => !finalizadas.find(({ codigo: c, numero: n}) => c === codigo && n === numero)) : nfs
    const b3 = notas.length === 0 || notas[0] === 'all'
      ? await realizarAcoes(nfsSelecionadas, browser)
      : await realizarAcoes(nfs.filter(({ numero }) => notas.includes(numero)), browser)

    browser = b3
  } catch (error) {
    logger.info(error)
  } finally {
    finalizar(browser)
  }
})()
