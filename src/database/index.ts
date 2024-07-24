import { type TDataDB, associatedCollection } from '@/config'

export const saveAssociatedProductInDB = async (product: TDataDB) => {
  await associatedCollection.insertOne(product)
}

export const getAssociatedProducts = async (page: number, limit: number) => {
  const total = await associatedCollection.countDocuments()
  const cursor = associatedCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(100 * (page - 1))
    .limit(limit)
  const products: TDataDB[] = []
  for await (const product of cursor) {
    products.push(product)
  }
  return { products, total }
}
