import type { TDataDB } from '@/db'
import type { TNote } from '../bot/types'
import fs, { promises as pfs } from 'fs'
import { io, logger } from '@/config'

const notesFileName = 'nfs-finalizadas.txt'

async function salveJson(fileName: string, content: TDataDB) {
  if (fs.existsSync(fileName)) {
    const json = JSON.parse(await pfs.readFile(fileName, 'utf-8'))
    await pfs.writeFile(fileName, JSON.stringify([...json, content], null, 2))
    return
  }
  await pfs.writeFile(fileName, JSON.stringify([content], null, 2))
}

export async function delay(value?: number) {
  await new Promise((resolve) => setTimeout(resolve, value || 5000))
}

export async function saveFinishedNote(nf: TNote) {
  !fs.existsSync(notesFileName) && (await pfs.writeFile(notesFileName, ''))
  await pfs.appendFile(notesFileName, `${nf.code}-${nf.number}\n`)
}

export async function clearFinishedNotes() {
  await pfs.writeFile(notesFileName, '')
}

export async function saveUnresgisteredProduct(product: TDataDB) {
  await salveJson('nao-cadastrados.json', product)
}

export async function clearUngisteredProduct() {
  await pfs.writeFile('nao-cadastrados.json', JSON.stringify([]))
}

export async function getFinishedNotes() {
  if (!fs.existsSync(notesFileName)) return []
  const content = await pfs.readFile(notesFileName, 'utf-8')
  const lines = content.split(/\r?\n/)
  return lines.map((line) => {
    const [code, number] = line.split('-')
    return { code, number }
  })
}

export function print(message: string) {
  io.emit('log', message)
  console.log(`\n> ${message}`)
  logger.info(message)
}
