# Samb@net

Script desenvolvido para automatizar a associação de produtos durante o lançamento de Notas Fiscais utilizando o software [Samb@net](https://getway.com.br/universo-sambanet/)

## Descrição dos Eventos

1. Realizar Login

![Login](./.github/images/login-page.png)

2. Navegar para Estoque

![Dashboard](./.github/images/dashboard-page.png)

3. Navegar para Entrada NF

![Estoque](./.github/images/estoque-page.png)

4. Buscar Notas Pendentes, Selecionar 60 Registros por Página e Navegar para Itens da NF

![Entrada NF](./.github/images/entrada-nf-page.png)

O script irá navegar para a próxima página até concluir a busca de todas as notas pendentes, após esse processo que será feita a navegação para `Itens da NF` 

![Entrada NF Próxima Página](./.github/images/entrada-nf-next-page.png)

5. Selecionar 60 Registros por Página e Associar Produtos 

![Produto a ser associado](./.github/images/produto-a-associar.png)

6. Colar o Código de Barras no Campo **Barra** da Seção **Produto no Samb@net**, Aguardar o Carregamento e Salvar

![Janela do produto a ser associado](./.github/images/produto-a-associar-janela.png)

![Janela do roduto associado](./.github/images/produto-associado.png)

![Produto associado](./.github/images/produto-associado-verde.png)

No caso acima, também foi calculado o código de barras da unidade do produto (7898920795037), a partir do código de barras da embalagem (17898920795034). Essa explicação pode ser conferida no link: https://diasjoaovitor.github.io/utils/

Da mesma forma que ocorre em `Entrada NF`, o script irá navegar para próxima página até finalizar todos os produto da nota 

## Como Executar

Instalação das dependências externas

```
sudo apt-get install python3-pip
pip install playwright
python3 -m playwright install
python3 -m playwright install-deps
```

Instalação das dependências internas

```
cd sambanet-associate
npm i
```

Execução

O comando abaixo quando rodado pela primeira vez, irá percorrer notas as notas pendentes

```
npm start
```

O script salva as notas que estão com todos os produtos associados num arquivo

```
4642-11751
4641-4704
4640-35
4639-36
```

Ao rodar o comando `npm start` pela segunda vez, o script irá ignorar todas as notas finalizadas

Caso deseje percorrer todas as notas novamente, há duas opções, excluir o arquivo `nfs-finalizadas.txt` ou executar o comando com o parâmetro:

```
npm start all
```

Caso deseje executar o script em notas especificas, basta passar os números das notas como parâmetro, como no exemplo abaixo:

![Preview](./.github/images/preview.gif)

## Logs

São gerados três arquivos de logs

**app.log**: Mostra todas as ações do script

```log
{"level":"info","message":"Iniciando...","timestamp":"2024-02-27T20:56:20.330Z"}
{"level":"info","message":"Login [https://sambanet.getway.com.br/auth/login]","timestamp":"2024-02-27T20:56:22.022Z"}
{"level":"info","message":"Dashboard [https://sambanet.getway.com.br/inicio/dashboard]","timestamp":"2024-02-27T20:56:23.869Z"}
{"level":"info","message":"Estoque [https://www.sambanet.net.br/sambanet/estoque/Login.aspx?CodLogin=FFqfqDSbaVi8uoWp5ZJ7xReQ==]","timestamp":"2024-02-27T20:56:23.884Z"}
{"level":"info","message":"Entrada NF [https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNfRM.aspx?key=1730979564]","timestamp":"2024-02-27T20:56:26.200Z"}
{"level":"info","message":"Buscando notas pendentes...","timestamp":"2024-02-27T20:56:27.413Z"}
{"level":"info","message":"Selecionando quantidade de registros por página...","timestamp":"2024-02-27T20:56:27.868Z"}
{"level":"info","message":"Obtendo notas pendentes na página 1...","timestamp":"2024-02-27T20:56:37.896Z"}
{"level":"info","message":"Quantidade de notas pendentes 57","timestamp":"2024-02-27T20:56:37.906Z"}
{"level":"info","message":"Realizando ações em 3 notas...","timestamp":"2024-02-27T20:56:37.909Z"}
{"level":"info","message":"1  - 11751 - FABRICA DE DOCES ALIANCA EIRELI [https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=4642]","timestamp":"2024-02-27T20:56:39.968Z"}
{"level":"info","message":"Selecionando quantidade de registros por página...","timestamp":"2024-02-27T20:56:39.969Z"}
{"level":"info","message":"Todos os produtos já foram associados!","timestamp":"2024-02-27T20:56:50.048Z"}
{"level":"info","message":"2  - 539314 - TEIU INDUSTRIA E COMERCIO LTDA [https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=4626]","timestamp":"2024-02-27T20:56:51.214Z"}
{"level":"info","message":"Selecionando quantidade de registros por página...","timestamp":"2024-02-27T20:56:51.215Z"}
{"level":"info","message":"Quantidade de produtos não associados: 1","timestamp":"2024-02-27T20:57:01.301Z"}
{"level":"info","message":"1 - GEL PINHO ATILA MULTIUSO LIMPEZA PESADA 12X1 KG - 17896394807338 - 7896394807331","timestamp":"2024-02-27T20:57:01.302Z"}
{"level":"info","message":"Tentando associar produto...","timestamp":"2024-02-27T20:57:01.303Z"}
{"level":"info","message":"O produto não está cadastrado!","timestamp":"2024-02-27T20:57:21.729Z"}
{"level":"info","message":"3  - 111958 - VIDA COMERCIO E INDU DE ALIM LTDA [https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=4374]","timestamp":"2024-02-27T20:57:28.199Z"}
{"level":"info","message":"Selecionando quantidade de registros por página...","timestamp":"2024-02-27T20:57:28.200Z"}
{"level":"info","message":"Quantidade de produtos não associados: 1","timestamp":"2024-02-27T20:57:38.275Z"}
{"level":"info","message":"1 - ACUCAR REFINADO 10X1 VIDA - 17898920795034 - 7898920795037","timestamp":"2024-02-27T20:57:38.276Z"}
{"level":"info","message":"Tentando associar produto...","timestamp":"2024-02-27T20:57:38.276Z"}
{"level":"info","message":"Produto associado!","timestamp":"2024-02-27T20:58:03.827Z"}
{"level":"info","message":"Associados: ","timestamp":"2024-02-27T20:58:03.830Z"}
{"level":"info","message":"Não Associados: ","timestamp":"2024-02-27T20:58:03.831Z"}
{"level":"info","message":"Execução finalizada!","timestamp":"2024-02-27T20:58:03.831Z"}
```

**associados.log**: Mostra todos os produtos associados

```log
{"level":"info","message":{"barra":"7898920795037","barraXML":"17898920795034","id":"ContentPlaceHolder1_gvDados_lnkAssociar_0","nome":"ACUCAR REFINADO 10X1 VIDA","url":"https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=4374"},"timestamp":"2024-02-27T20:58:03.828Z"}
```

**nao-cadastrados.log**: Mostra todos os produtos que não puderam ser associados

```log
{"level":"info","message":{"barra":"7896394807331","barraXML":"17896394807338","id":"ContentPlaceHolder1_gvDados_lnkAssociar_1","nome":"GEL PINHO ATILA MULTIUSO LIMPEZA PESADA 12X1 KG","url":"https://www.sambanet.net.br/sambanet/estoque/Forms/EntradaNFItensRM.aspx?nf=4626"},"timestamp":"2024-02-27T20:57:21.729Z"}
```
