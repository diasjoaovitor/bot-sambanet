import { associatedCollection } from '@/config'
import { type TDataDB } from '@/db'

export const getAssociatedProducts = async (page: number) => {
  const total = await associatedCollection.countDocuments()
  const cursor = associatedCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(100 * (page - 1))
    .limit(100)
  const products: TDataDB[] = []
  for await (const product of cursor) {
    products.push(product)
  }
  return { products, total }
}
