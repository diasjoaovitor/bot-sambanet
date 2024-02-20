import { promises as fs } from 'fs'
import { TNF } from '../types'

const arquivo = 'nfs-finalizadas.txt'

export async function delay(value?: number) {
  await new Promise(r => setTimeout(r, value || 5000))
}

export async function gerarRelatorioDeNfsFinalizadas(nf: TNF) {
  await fs.appendFile(arquivo, `${nf.codigo}-${nf.numero}\n`)
}

export async function obterNfsFinalizadas() {
  const conteudo = await fs.readFile(arquivo, 'utf-8')
  const linhas = conteudo.split(/\r?\n/)
  return linhas.map(linha => {
    const [codigo, numero] = linha.split('-')
    return { codigo, numero }
  })
}
