import { associadosCollection } from '@/config'
import type { TProdutoDB } from '@/db'
import type { Request, Response } from 'express'

export async function obterProdutosAssociados(_: Request, res: Response) {
  try {
    const cursor = associadosCollection.find()
    const produtos: TProdutoDB[] = []
    for await (const produto of cursor) {
      produtos.push(produto)
    }
    res.status(200).json(produtos)
  } catch (error) {
    res.status(500).json(error)
  }
}
