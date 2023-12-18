export function obterEstoqueURL(html: string) {
  const resultado = html.match(/(?<=href=")https:\/\/www.sambanet.net.br\/sambanet\/estoque.+(?=" target.+demonstrativos2)/)
  if (!resultado) return null
  const [url] = resultado
  return url
}

export function obterEntradaNfURL(html: string) {
  const resultado = html.match(/(?<=href=")EntradaNfRM.+(?=\" title.+tabindex)/)
  if (!resultado) return null
  const [ href ] = resultado
  const url = 'https://www.sambanet.net.br/sambanet/estoque/Forms/' + href
  return url
}
