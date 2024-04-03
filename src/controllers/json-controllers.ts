import type { Request, Response } from 'express'
import { getUnregisteredProducts } from '@/utils'

export async function getUnregisteredProductsController(
  _: Request,
  res: Response
) {
  try {
    const products = await getUnregisteredProducts()
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json(error)
  }
}
