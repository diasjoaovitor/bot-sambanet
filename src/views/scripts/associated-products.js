;(async () => {
  const products = await fetchData('/products/associated')
  renderData(products)
})()
