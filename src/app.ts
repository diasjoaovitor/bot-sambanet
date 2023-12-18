import { 
  associarProduto, 
  buscarNotasPendentes, 
  gerarRelatorio, 
  iniciar, 
  login, 
  navegarParaEntradaNF, 
  navegarParaEstoque, 
  navegarParaItensDaNF, 
  obterNotasPendentes, 
  obterProdutosNaoAssociados, 
  print, 
  selecionarQuantidadeDeItensPagina 
} from './functions'
import { TProduto } from './types'

const associados: TProduto[] = []
const naoAssociados: TProduto[] = []

export async function executar() {
  print('Iniciando...')
  const { pagina, browser } = await iniciar()
  print(`Login [${pagina.url()}]`)

  const { dashboard, dashboardURL } = await login(pagina, browser)
  print(`Dashboard [${dashboardURL}]`)

  const { estoque, estoqueURL } = await navegarParaEstoque(dashboard, browser)
  print(`Estoque [${estoqueURL}]`)

  const { entradaNF, entradaNfURL } = await navegarParaEntradaNF(estoque, browser)
  print(`Entrada NF [${entradaNfURL}]`)

  await buscarNotasPendentes(entradaNF)
  print('Pendentes Para Entrada')

  await selecionarQuantidadeDeItensPagina(entradaNF)

  const { nfs } = await obterNotasPendentes(entradaNF)
  const quantidadeDeNotasPendentes = nfs.length
  print(`Quantidade de notas pendentes: ${nfs.length}`)

  for (let i = 0; i < quantidadeDeNotasPendentes; i++) {
    const { descricao, codigo } = nfs[i]
    print(`${(i + 1)}  - ${descricao}`)
    const { itensNf, itensNfURL } = await navegarParaItensDaNF(codigo, browser)

    print(`Itens da Nota Fiscal [${itensNfURL}]`)
    await selecionarQuantidadeDeItensPagina(itensNf)
    const produtosNaoAssociados = await obterProdutosNaoAssociados(itensNf)
    const quantidadeDeProdutosNaoAssociados = produtosNaoAssociados.length

    if (quantidadeDeProdutosNaoAssociados === 0) {
      print('Todos os produtos já foram associados')
      continue
    }

    print(`Quantidade de produtos não associados: ${quantidadeDeProdutosNaoAssociados}`)
    for (let j = 0; j < quantidadeDeProdutosNaoAssociados; j++) {
      const produto = produtosNaoAssociados[j]
      const { nome, barraXML } = produto
      print(`${j + 1} - ${nome} - ${barraXML}`)
      const foiAssociado = await associarProduto(produto, itensNfURL, browser)
      const p = {
        nf: descricao,
        produto: `${nome} - ${barraXML}`
      }
      if (foiAssociado ) {
        print('Produto associado!')
        associados.push(p)
      } else {
        print('Não foi possível associar o produto!')
        naoAssociados.push(p)
      }
    }
  }
  await browser.close()
  await gerarRelatorio({ associados, naoAssociados })
  print('Relatório gerado!')
  print('Execução Finalizada')
}

try {
  await executar()
} catch (error) {
  await gerarRelatorio({ associados, naoAssociados })
  print('Relatório parcial gerado!')
  throw error
}
