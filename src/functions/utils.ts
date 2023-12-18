import fs, { promises as pfs } from 'fs'
import { TProduto } from '../types'

export function print(text: string) {
  console.log('\n > ' + text)
}

export async function delay(value?: number) {
  await new Promise(r => setTimeout(r, value || 5000))
}

export async function gerarRelatorio(dados: {associados: TProduto[], naoAssociados: TProduto[]}) {
  const dir = 'relatorios'
  !fs.existsSync(dir) && await pfs.mkdir(dir)
  const timestamp = new Date().toISOString()
  await pfs.writeFile(`${dir}/relatorio-${timestamp}.json`, JSON.stringify(dados, null, 2))
}
