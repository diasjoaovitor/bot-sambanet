export interface TData {
  note: string
  product: string
}

export interface TProduct {
  id: string
  name: string
  bar: string
  xmlBar: string
}

export interface TNote {
  description: string
  code: string
  number: string
}

export interface TReport {
  nf: string
  products: string[]
}
