import type { Request, Response } from 'express'
import path from 'path'

export const render = async (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'views/index.html'))
}
