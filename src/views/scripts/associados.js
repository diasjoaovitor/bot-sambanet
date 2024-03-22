;(async () => {
  const ul = document.querySelector('ul')
  const total = document.getElementById('total')

  const render = (produtos) => {
    ul.innerHTML = ''
    total.innerHTML = `
      <strong>Total de produtos associados: </strong> ${produtos.length} 
    `
    produtos.forEach((produto) => {
      const { nf, nome, createdAt } = produto
      const [texto, link] = nf.split('[')
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.setAttribute('href', link.replace(']', ''))
      a.setAttribute('target', '_blank')
      const nfArray = texto.split('-')
      a.textContent = nfArray.slice(1, nfArray.length).join(' - ')
      li.appendChild(a)
      const p = document.createElement('p')
      const produtoArray = nome.split('-')
      p.textContent = produtoArray.slice(1, produtoArray.length).join(' - ')
      li.appendChild(p)
      const p2 = document.createElement('p')
      console.log(
        createdAt,
        new Date(createdAt).toLocaleDateString('pt-br', {
          dateStyle: 'full'
        })
      )
      p2.textContent = new Date(createdAt).toLocaleDateString('pt-br', {
        dateStyle: 'full'
      })
      li.appendChild(p2)
      ul.appendChild(li)
      const main = document.querySelector('main')
      main.scrollTop = ul.clientHeight
    })
  }

  const obterProdutosAssociados = async () => {
    ul.innerHTML = 'carregando...'
    const response = await fetch('/associados')
    const data = await response.json()
    return data
  }

  const produtos = await obterProdutosAssociados()

  render(produtos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
})()
