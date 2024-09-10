import dayjs from 'dayjs'
import path from 'path'
import fs, { promises as pfs } from 'fs'
import { type TDataDB, io, logger } from '@/config'
import { type TNote } from '@/bot/types'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

const basePath = path.resolve(__dirname, '..', '..', 'data')
const notesFileName = path.join(basePath, 'nfs-finalizadas.txt')
const unregisteredFileName = path.join(basePath, 'nao-cadastrados.json')

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

export async function saveUnregisteredProduct(product: TDataDB) {
  await salveJson(unregisteredFileName, product)
}

export async function clearUnregisteredProduct() {
  await pfs.writeFile(unregisteredFileName, JSON.stringify([]))
}

export async function getUnregisteredProducts() {
  if (!fs.existsSync(unregisteredFileName)) return []
  return JSON.parse(
    await pfs.readFile(unregisteredFileName, 'utf-8')
  ) as TDataDB[]
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

export const formatAssociatedProducts = (data: TDataDB[]) => {
  const notes = Array.from(new Set(data.map(({ note }) => note)))
  const d: Array<{
    note: {
      description: string
      href: string
    }
    products: Array<{
      description: string
      createdAt: string
    }>
  }> = []
  notes.forEach((note) => {
    const [text, link] = note.split('[')
    const href = link.replace(']', '')
    const array = text.split('-')
    const description = array.slice(1, array.length).join(' - ')
    const products = data
      .filter(({ note: n }) => n === note)
      .map(({ product, createdAt }) => {
        const array = product.split('-')
        const description = array.slice(1, array.length).join(' - ')
        return {
          description,
          createdAt: dayjs(createdAt)
            .format('DD-MMMM-YYYY, HH:mm:ss')
            .split('-')
            .join(' de ')
        }
      })
    d.push({
      note: { href, description },
      products
    })
  })
  return d
}
