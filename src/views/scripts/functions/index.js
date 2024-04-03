/* eslint-disable @typescript-eslint/no-unused-vars */

const ul = document.querySelector('ul')
const total = document.getElementById('total')

const fetchData = async (path) => {
  ul.innerHTML = 'carregando...'
  const response = await fetch(path)
  const data = await response.json()
  return data
}

const sortData = (data) =>
  data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

const formatData = (data) => {
  const notes = Array.from(new Set(data.map(({ note }) => note)))
  const d = []
  notes.forEach((note) => {
    d.push({
      note,
      products: data.filter(({ note: n }) => n === note)
    })
  })
  return d
}

const renderData = (data) => {
  ul.innerHTML = ''
  total.innerHTML = `
    <strong>Total de produtos associados: </strong> ${data.length}
  `
  const d = formatData(sortData(data))
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
