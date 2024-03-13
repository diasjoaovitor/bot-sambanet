import '../config/alias-config'
import type { Browser } from 'puppeteer'
import { logger } from '@/config'
import { limparNaoCadastrados, obterNfsFinalizadas, print } from '@/utils'
import {
  finalizar,
  obterTodasAsNotasPendentes,
  realizarAcoes,
  realizarLoginENavegarParaEstoque
} from './functions'

export async function bot() {
  const notas = process.argv.slice(2, process.argv.length)

  let browser: Browser

  try {
    await limparNaoCadastrados()

    const r = await realizarLoginENavegarParaEstoque()
    if (!r) return

    const { estoque, browser: b } = r
    browser = b

    const rPendentes = await obterTodasAsNotasPendentes(estoque, browser)
    if (!rPendentes) return

    const { browser: b2, nfs } = rPendentes
    browser = b2

    if (nfs.length === 0) {
      logger.info('Não há notas pendentes')
      return
    }

    print(`Quantidade de notas pendentes ${nfs.length}`)

    const finalizadas = await obterNfsFinalizadas()
    const nfsSelecionadas =
      notas[0] !== 'all'
        ? nfs.filter(
            ({ codigo, numero }) =>
              !finalizadas.find(
                ({ codigo: c, numero: n }) => c === codigo && n === numero
              )
          )
        : nfs
    const b3 =
      notas.length === 0 || notas[0] === 'all'
        ? await realizarAcoes(nfsSelecionadas, browser)
        : await realizarAcoes(
            nfs.filter(({ numero }) => notas.includes(numero)),
            browser
          )

    if (!b3) throw new Error('Não foi possível finalalizar!')
    browser = b3
    finalizar(browser)
  } catch (error) {
    logger.info(error)
    throw new Error('Não foi possível finalalizar!')
  }
}
