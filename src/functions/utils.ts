import fs, { promises as pfs } from 'fs'
import { TNF } from '../types'

const arquivo = 'nfs-finalizadas.txt'

export async function delay(value?: number) {
  await new Promise(r => setTimeout(r, value || 5000))
}

export async function gerarRelatorioDeNfsFinalizadas(nf: TNF) {
  !fs.existsSync(arquivo) && await pfs.writeFile(arquivo, '')
  await pfs.appendFile(arquivo, `${nf.codigo}-${nf.numero}\n`)
}

export async function obterNfsFinalizadas() {
  if (!fs.existsSync(arquivo) ) return []
  const conteudo = await pfs.readFile(arquivo, 'utf-8')
  const linhas = conteudo.split(/\r?\n/)
  return linhas.map(linha => {
    const [codigo, numero] = linha.split('-')
    return { codigo, numero }
  })
}
