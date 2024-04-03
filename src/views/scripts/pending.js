;(async () => {
  const products = await fetchData('/products/pending')
  renderData(products)
})()
