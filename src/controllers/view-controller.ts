import type { Request, Response } from 'express'
import path from 'path'

export const home = async (_: Request, res: Response) => {
  res.render(path.join(__dirname, '..', 'views/index'))
}

export const associatedProducts = async (_: Request, res: Response) => {
  res.render(path.join(__dirname, '..', 'views/associated-products'))
}

export const pending = async (_: Request, res: Response) => {
  res.render(path.join(__dirname, '..', 'views/pending'))
}
