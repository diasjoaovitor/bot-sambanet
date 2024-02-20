export type TProduto = {
  nf: string
  nome: string
}

export type TDadosDoProduto = {
  id: string
  nome: string
  barra: string
  barraXML: string
}

export type TNF = {
  descricao: string
  codigo: string
  numero: string
}

export type TRelatorio = {
  nf: string,
  produtos: string[]
}[]
