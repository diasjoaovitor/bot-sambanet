import '../config/alias-config'
import type { Browser } from 'puppeteer'
import {
  limparNaoCadastrados,
  limparNfsFinalizadas,
  obterNfsFinalizadas,
  print
} from '@/utils'
import {
  finalizar,
  obterTodasAsNotasPendentes,
  realizarAcoes,
  realizarLoginENavegarParaEstoque
} from './functions'

export async function bot({ opcao }: { opcao: string }) {
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
      print('Não há notas pendentes')
      return
    }

    print(`Quantidade de notas pendentes ${nfs.length}`)

    const finalizadas = await obterNfsFinalizadas()

    const selecionarOpcao = async () => {
      switch (opcao) {
        case 'Iniciar': {
          const nfsNaoFinalizadas = nfs.filter(
            ({ codigo, numero }) =>
              !finalizadas.find(
                ({ codigo: c, numero: n }) => c === codigo && n === numero
              )
          )
          return await realizarAcoes(nfsNaoFinalizadas, browser)
        }
        case 'Resetar': {
          await limparNfsFinalizadas()
          return await realizarAcoes(nfs, browser)
        }
        default: {
          const notas = opcao.split(' ')
          const nfsSelecionadas = nfs.filter(({ numero }) =>
            notas.includes(numero)
          )
          return await realizarAcoes(nfsSelecionadas, browser)
        }
      }
    }

    const b3 = await selecionarOpcao()
    if (!b3) throw new Error('Não foi possível finalizar!')
    browser = b3
    finalizar(browser)
  } catch (error) {
    print(error as string)
  }
}
