import { associatedCollection } from '@/config'
import type { TDataDB } from '@/db'
import type { Request, Response } from 'express'

export async function getAssociatedProducts(_: Request, res: Response) {
  try {
    const cursor = associatedCollection.find()
    const products: TDataDB[] = []
    for await (const product of cursor) {
      products.push(product)
    }
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json(error)
  }
}
