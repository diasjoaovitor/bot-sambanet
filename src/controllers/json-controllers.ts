import { getUnregisteredProducts } from '@/utils'
import type { Request, Response } from 'express'

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
