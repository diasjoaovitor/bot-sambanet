import type { TNF, TRelatorio } from '../types'
import fs, { promises as pfs } from 'fs'
import { logger } from '@/config'

const arquivo = 'nfs-finalizadas.txt'

export async function delay(value?: number) {
  await new Promise((resolve) => setTimeout(resolve, value || 5000))
}

export async function salvarDeNfsFinalizadas(nf: TNF) {
  !fs.existsSync(arquivo) && (await pfs.writeFile(arquivo, ''))
  await pfs.appendFile(arquivo, `${nf.codigo}-${nf.numero}\n`)
}

export async function obterNfsFinalizadas() {
  if (!fs.existsSync(arquivo)) return []
  const conteudo = await pfs.readFile(arquivo, 'utf-8')
  const linhas = conteudo.split(/\r?\n/)
  return linhas.map((linha) => {
    const [codigo, numero] = linha.split('-')
    return { codigo, numero }
  })
}

export function print(mensagem: string) {
  console.log(`\n> ${mensagem}`)
  logger.info(mensagem)
}

export function printRelatorio(relatorio: TRelatorio[]) {
  relatorio
    .filter(({ produtos }) => produtos.length > 0)
    .forEach(({ nf, produtos }) => {
      console.log(`\n  > ${nf}`)
      produtos.forEach((produto) => {
        console.log(`\n    > ${produto}`)
      })
    })
}
