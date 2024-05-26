import { type Request, type Response } from 'express'
import { formatAssociatedProducts, getUnregisteredProducts } from '@/utils'
import { getAssociatedProducts } from '@/models'

export const home = async (_: Request, res: Response) => {
  res.render('index')
}

export const associatedProducts = async (req: Request, res: Response) => {
  try {
    const { params } = req
    const { products, total } = await getAssociatedProducts(
      parseInt(params.page1) || 1
    )
    const data = formatAssociatedProducts(products)
    res.render('associated', {
      page: 1,
      total,
      data
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
