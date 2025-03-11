# Minhas Compras de Mercado

## Descrição do Projeto

"Minhas Compras de Mercado" é uma aplicação web intuitiva e eficiente, desenvolvida para simplificar a gestão das suas listas de compras de supermercado. Projetada com foco em dispositivos Android (smartphones e tablets), esta ferramenta leve permite que você adicione, organize, edite e monitore seus itens de compra de forma rápida e prática, diretamente do seu navegador.

**Gerencie suas compras com facilidade, utilizando recursos como:**

*   **Entrada de dados flexível:** Adicione itens por digitação ou utilize o **ditado por voz** com comandos em linguagem natural (ex: "quantidade 2 descrição maçã preço 3,99").
*   **Categorização inteligente:** A aplicação categoriza automaticamente seus itens (Alimentos, Limpeza, Higiene Pessoal, Outros), facilitando a organização da sua lista.
*   **Controle financeiro integrado:** Defina um orçamento e acompanhe o seu progresso com uma **barra de progresso visual** e alertas de estouro de orçamento.
*   **Persistência de dados:** Sua lista de compras e orçamento são salvos localmente no seu navegador usando `localStorage`, garantindo que você não perca suas informações.
*   **Importar Lista:** Importe listas de compras existentes a partir de arquivos **XLSX (Excel)**, utilizando um modelo para facilitar a criação da sua lista.
*   **Relatórios detalhados:** Gere **relatórios em Excel (.xlsx)** para ter uma visão clara dos seus gastos e itens comprados.
*   **Interface amigável e responsiva:** Design limpo e otimizado para **smartphones Android**, com animações suaves e feedback visual para uma experiência de usuário agradável.

"Minhas Compras de Mercado" é a solução ideal para planejar suas idas ao supermercado, controlar seus gastos e otimizar seu tempo, tudo isso em uma interface web simples e acessível.

## Funcionalidades Principais

*   **Adicionar Itens:**
    *   Por **digitação** no campo de texto com sugestões de autocomplete.
    *   Por **ditado de voz** com reconhecimento de comandos em português.
*   **Editar Itens:** Modifique a descrição, quantidade, valor unitário e categoria dos itens diretamente na lista através de um modal de edição.
*   **Excluir Itens:** Remova itens da lista individualmente com confirmação.
*   **Filtrar por Categoria:** Visualize itens específicos por categoria (Alimentos, Limpeza, Higiene Pessoal, Todas).
*   **Controle de Orçamento:**
    *   Defina um orçamento total para suas compras.
    *   Acompanhe o progresso do seu gasto em relação ao orçamento com uma barra de progresso colorida.
    *   Receba alertas visuais caso o valor total da lista exceda o orçamento definido.
*   **Importar Lista:** Importe listas de compras existentes a partir de arquivos **XLSX (Excel)**, utilizando um modelo de planilha para garantir o formato correto dos dados.
*   **Limpar Lista:** Remova todos os itens da lista de compras com confirmação.
*   **Gerar Relatório Excel:** Crie um relatório detalhado da sua lista de compras em formato **XLSX (Excel)**, incluindo descrição, quantidade, valor unitário, categoria e a data de geração do relatório.
*   **Feedback Visual e Animações:** A aplicação utiliza animações suaves (fade-in, transições) e feedback visual para melhorar a experiência do usuário.
*   **Botões de Lixeira Dinâmicos:** Os ícones de lixeira ao lado de cada item mudam de cor para indicar o status do valor do item:
    *   **Verde:** Item possui valor unitário maior que zero.
    *   **Vermelho:** Item possui valor unitário igual a zero ou não possui valor definido.

## Pré-requisitos

Para utilizar o projeto, você precisará de:

*   Um navegador web moderno compatível com HTML5, CSS3 e JavaScript (preferencialmente Chrome, Firefox, Safari ou Edge, otimizado para dispositivos Android).
*   Acesso à internet (necessário para carregar as bibliotecas externas: Awesomplete, XLSX e Font Awesome, e para funcionalidades opcionais como reconhecimento de voz, dependendo do navegador).

## Como Usar

1.  **Abrir no Navegador:** Abra o arquivo `index.html` diretamente no seu navegador web (Chrome, Firefox, etc.). Você pode fazer isso clicando com o botão direito no arquivo `index.html` e selecionando "Abrir com..." e escolhendo seu navegador.

2.  **Utilizar a Aplicação:** A página "Minhas Compras de Mercado" será carregada no seu navegador. Você pode começar a utilizar todas as funcionalidades da aplicação:

    *   Adicione itens digitando ou por voz.
    *   Defina seu orçamento.
    *   Visualize e edite sua lista de compras.
-   Exporte, importe ou limpe a lista.  *(Removido "Exportar" aqui)*
+   Importe ou limpe a lista. *(Atualizado para refletir a remoção do "Exportar")*
    *   Gere relatórios em Excel.

3.  **Persistência de Dados:** Seus dados (lista de compras e orçamento) serão salvos automaticamente no `localStorage` do seu navegador. Ao reabrir a página no mesmo navegador e dispositivo, seus dados serão restaurados.

**Divirta-se planejando suas compras de mercado de forma mais inteligente e eficiente!**
