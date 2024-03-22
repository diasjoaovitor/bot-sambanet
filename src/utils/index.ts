import type { TProdutoDB } from '@/db'
import type { TNF } from '../bot/types'
import fs, { promises as pfs } from 'fs'
import { io, logger } from '@/config'

const arquivoNfs = 'nfs-finalizadas.txt'

async function salvarJson(arquivo: string, conteudo: TProdutoDB) {
  if (fs.existsSync(arquivo)) {
    const json = JSON.parse(await pfs.readFile(arquivo, 'utf-8'))
    await pfs.writeFile(arquivo, JSON.stringify([...json, conteudo], null, 2))
    return
  }
  await pfs.writeFile(arquivo, JSON.stringify([conteudo], null, 2))
}

export async function delay(value?: number) {
  await new Promise((resolve) => setTimeout(resolve, value || 5000))
}

export async function salvarNfsFinalizadas(nf: TNF) {
  !fs.existsSync(arquivoNfs) && (await pfs.writeFile(arquivoNfs, ''))
  await pfs.appendFile(arquivoNfs, `${nf.codigo}-${nf.numero}\n`)
}

export async function limparNfsFinalizadas() {
  await pfs.writeFile(arquivoNfs, '')
}

export async function salvarNaoCadastrados(produto: TProdutoDB) {
  await salvarJson('nao-cadastrados.json', produto)
}

export async function limparNaoCadastrados() {
  await pfs.writeFile('nao-cadastrados.json', JSON.stringify([]))
}

export async function salvarAssociadosQueNaoForamSalvosNoBanco(
  produto: TProdutoDB
) {
  await salvarJson('associados-que-nao-foram-salvos-no-banco.json', produto)
}

export async function obterNfsFinalizadas() {
  if (!fs.existsSync(arquivoNfs)) return []
  const conteudo = await pfs.readFile(arquivoNfs, 'utf-8')
  const linhas = conteudo.split(/\r?\n/)
  return linhas.map((linha) => {
    const [codigo, numero] = linha.split('-')
    return { codigo, numero }
  })
}

export function print(mensagem: string) {
  io.emit('log', mensagem)
  console.log(`\n> ${mensagem}`)
  logger.info(mensagem)
}
