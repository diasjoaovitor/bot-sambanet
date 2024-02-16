import { Browser } from 'puppeteer'
import { 
  finalizar,
  obterTodasAsNotasPendentes, 
  realizarAcoes, 
  realizarLoginENavegarParaEstoque
} from './functions'
import { logger } from './logger-config'

(async () => {
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
    
    const b3 = await realizarAcoes(nfs, browser)
    browser = b3
  } catch (error) {
    logger.info(error)
  } finally {
    finalizar(browser)
  }
})()
