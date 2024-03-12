import type { TProdutoDB } from './types'
import { associadosCollection } from '@/config'

export const salvarProdutoAssociado = async (produto: TProdutoDB) => {
  await associadosCollection.insertOne(produto)
}
