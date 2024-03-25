import type { TDataDB } from '@/db/types'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGO_URI || ''

const client = new MongoClient(uri)

const database = client.db('baratao')

export const associatedCollection = database.collection<TDataDB>('associated')

export const dbConnection = async () => {
  await client.connect()
}
