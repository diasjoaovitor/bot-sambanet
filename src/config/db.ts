import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import type { TData } from '@/bot/types'

dotenv.config()

const uri = process.env.MONGO_URI || ''

const client = new MongoClient(uri)

const database = client.db('baratao')

export type TDataDB = {
  createdAt: string
} & TData

export const associatedCollection = database.collection<TDataDB>('associated')

export const dbConnection = async () => {
  await client.connect()
}
