import '../config/alias-config'
import { type Browser } from 'puppeteer'
import {
  clearFinishedNotes,
  clearUnregisteredProduct,
  getFinishedNotes,
  print
} from '@/utils'
import {
  getAllPendingNotes,
  loginAndNavigateToEstoque,
  startActions,
  stop
} from './functions'

export async function bot({ option }: { option: string }) {
  let browser: Browser

  try {
    await clearUnregisteredProduct()

    const estoqueData = await loginAndNavigateToEstoque()
    if (!estoqueData) throw new Error('Estoque data is undefined')

    const { estoque, browser: b } = estoqueData
    browser = b

    const pendingNotesData = await getAllPendingNotes(estoque, browser)
    if (!pendingNotesData) throw new Error('Pending notes data is undefined')

    const { browser: b2, nfs } = pendingNotesData
    browser = b2

    if (nfs.length === 0) {
      print('Não há notas pendentes')
      return
    }

    print(`Quantidade de notas pendentes ${nfs.length}`)

    const finished = await getFinishedNotes()

    const selectOption = async () => {
      switch (option) {
        case 'start': {
          const unfinishedNotes = nfs.filter(
            ({ code, number }) =>
              !finished.find(
                ({ code: c, number: n }) => c === code && n === number
              )
          )
          return await startActions(unfinishedNotes, browser)
        }
        case 'reset': {
          await clearFinishedNotes()
          return await startActions(nfs, browser)
        }
        default: {
          const notes = option.split(' ')
          const nfsSelecionadas = nfs.filter(({ number }) =>
            notes.includes(number)
          )
          return await startActions(nfsSelecionadas, browser)
        }
      }
    }

    const b3 = await selectOption()
    if (!b3) throw new Error('Não foi possível finalizar!')
    browser = b3
    stop(browser)
  } catch (error) {
    print(error as string)
  }
}
