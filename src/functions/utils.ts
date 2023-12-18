import { promises as fs } from 'fs'
import { TProduto } from '../types'

export function print(text: string) {
  console.log('\n > ' + text)
}

export async function delay(value?: number) {
  await new Promise(r => setTimeout(r, value || 5000))
}

export async function gerarRelatorio(associados: TProduto[], naoAssociados: TProduto[]) {
  const timestamp = new Date().toISOString()
  await fs.writeFile(`/relatorios/relatorio-${timestamp}.json`, JSON.stringify({ associados, naoAssociados }))
}
