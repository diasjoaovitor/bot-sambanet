import type { TDataDB } from './types'
import { associatedCollection } from '@/config'

export const saveAssociatedProductInDB = async (product: TDataDB) => {
  await associatedCollection.insertOne(product)
}
