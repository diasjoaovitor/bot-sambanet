import { type Request, type Response } from 'express'
import { formatAssociatedProducts, getUnregisteredProducts } from '@/utils'
import { getAssociatedProducts } from '@/models'

export const home = async (_: Request, res: Response) => {
  res.render('index')
}

export const associatedProducts = async (req: Request, res: Response) => {
  try {
    const { page: p } = req.query
    const limit = 100
    const page = Number(p) || 1
    const { products, total } = await getAssociatedProducts(page, limit)
    const data = formatAssociatedProducts(products)
    const numberOfPages = Math.ceil(total / limit)
    res.render('associated', {
      page,
      total,
      data,
      numberOfPages
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

export const pending = async (_: Request, res: Response) => {
  const products = await getUnregisteredProducts()
  const data = formatAssociatedProducts(products)
  res.render('pending', { data, total: products.length })
}
