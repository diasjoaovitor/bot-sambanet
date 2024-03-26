;(async () => {
  const ul = document.querySelector('ul')
  const total = document.getElementById('total')

  const formatData = (data) => {
    const notes = Array.from(new Set(data.map(({ note }) => note)))
    const d = []
    notes.forEach((note) => {
      d.push({
        note,
        products: products.filter(({ note: n }) => n === note)
      })
    })
    return d
  }

  const render = (data) => {
    ul.innerHTML = ''
    total.innerHTML = `
      <strong>Total de produtos associados: </strong> ${data.length} 
    `
    const d = formatData(data)
    d.forEach(({ note, products }) => {
      const [text, link] = note.split('[')
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.setAttribute('href', link.replace(']', ''))
      a.setAttribute('target', '_blank')
      const array = text.split('-')
      a.textContent = array.slice(1, array.length).join(' - ')
      li.appendChild(a)

      const subList = document.createElement('ul')
      products.forEach((product) => {
        const { product: name, createdAt } = product

        const subListItem = document.createElement('li')
        const productArray = name.split('-')
        subListItem.textContent = productArray
          .slice(1, productArray.length)
          .join(' - ')
        subList.appendChild(subListItem)
        const p = document.createElement('p')
        p.textContent = new Date(createdAt).toLocaleDateString('pt-br', {
          dateStyle: 'full'
        })
        subListItem.appendChild(p)
        li.appendChild(subList)
        ul.appendChild(li)
        const main = document.querySelector('main')
        main.scrollTop = ul.clientHeight
      })
    })
  }

  const getAssociatedProducts = async () => {
    ul.innerHTML = 'carregando...'
    const response = await fetch('/associados')
    const data = await response.json()
    return data
  }

  const products = await getAssociatedProducts()

  render(products.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
})()
