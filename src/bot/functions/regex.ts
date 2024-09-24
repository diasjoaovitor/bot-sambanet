export function getEstoqueURL(html: string) {
  const result = html.match(
    /(?<=href=")https:\/\/www.sambanet.net.br\/sambanet\/estoque.+(?===".+demo)/
  )
  if (!result) return null
  const [url] = result
  return url + '=='
}

export function getEntradaNfURL(html: string) {
  const result = html.match(/(?<=href=")EntradaNfRM.+(?=" title.+tabindex)/)
  if (!result) return null
  const [href] = result
  const url = 'https://www.sambanet.net.br/sambanet/estoque/Forms/' + href
  return url
}
