🛒 Minhas Compras de Mercado

Sua lista de supermercado inteligente e eficiente, direto no seu navegador mobile!

![alt text](https://img.shields.io/badge/lang-pt--BR-green.svg)
<!-- Substitua 'usuario/minhas-compras-mercado' pelo seu repo real se quiser -->

![alt text](https://img.shields.io/badge/HTML-5-orange)


![alt text](https://img.shields.io/badge/CSS-3-blue)


![alt text](https://img.shields.io/badge/JavaScript-ES6+-yellow)

📝 Descrição do Projeto

"Minhas Compras de Mercado" é uma aplicação web leve, intuitiva e eficiente, projetada para simplificar a gestão das suas listas de compras de supermercado. Otimizada para uso em navegadores de dispositivos móveis (smartphones e tablets, especialmente Android), esta ferramenta permite adicionar, organizar, editar e monitorar seus itens de compra de forma rápida e prática.

Planeje suas idas ao mercado, controle seus gastos e otimize seu tempo com recursos poderosos, tudo em uma interface web limpa e acessível.

✨ Funcionalidades Principais

🛒 Adição Flexível de Itens:

Digitação: Campo de texto com sugestões de autocomplete (itens comuns pré-definidos).

🎤 Ditado por Voz: Use comandos em linguagem natural (português) para adicionar itens rapidamente (ex: "quantidade 2 descrição maçã preço 3,99").

📄 Importação de Texto: Cole uma lista de nomes de itens separados por vírgula para adicionar múltiplos produtos de uma vez (com quantidade 1 e preço 0).

📊 Importação de Planilha: Importe listas existentes a partir de arquivos XLSX (Excel), utilizando um modelo fornecido para garantir o formato correto.

🏷️ Categorização Automática: Itens são automaticamente classificados em categorias (Alimentos, Limpeza, Higiene Pessoal, Outros) para melhor organização. Filtre sua lista por categoria.

✏️ Edição Fácil: Modifique descrição, quantidade, valor unitário e categoria de qualquer item diretamente na lista através de um modal intuitivo.

💰 Controle Financeiro Integrado:

Defina seu orçamento para as compras.

Acompanhe o total gasto em relação ao orçamento com uma barra de progresso visual colorida.

Receba alertas visuais (cor da barra e painel de total) caso o valor total exceda o orçamento.

🗑️ Gerenciamento da Lista:

Exclua itens individualmente (com confirmação).

Limpe toda a lista e o orçamento com um único clique (com confirmação).

Ícones de lixeira com cores dinâmicas indicam se um item tem preço definido (Verde) ou não (Vermelho).

💾 Persistência Local: Sua lista de compras e orçamento são salvos automaticamente no localStorage do seu navegador, garantindo que seus dados não sejam perdidos ao fechar e reabrir a página no mesmo dispositivo e navegador.

📈 Relatórios Detalhados: Gere relatórios completos da sua lista de compras em formato XLSX (Excel), incluindo totais por item, categorias e total geral.

📱 Interface Amigável e Responsiva: Design limpo, moderno e otimizado para telas de smartphones, com animações suaves e feedback visual claro para uma ótima experiência de usuário.

🛠️ Tecnologias Utilizadas

Frontend: HTML5, CSS3, JavaScript (ES6+)

APIs Web:

Web Speech API (para ditado por voz, dependente do suporte do navegador)

localStorage (para persistência de dados)

Bibliotecas Externas:

SheetJS (xlsx.full.min.js): Para leitura e escrita de arquivos Excel (.xlsx).

Awesomplete: Para sugestões de autocomplete no input de itens.

Font Awesome: Para ícones.

🚀 Como Usar (Getting Started)

Clone ou Baixe: Obtenha os arquivos do projeto:

git clone https://github.com/usuario/minhas-compras-mercado.git
# Ou baixe o ZIP do repositório


(Substitua usuario/minhas-compras-mercado pelo caminho real do seu repositório)

Abra no Navegador: Navegue até a pasta onde você salvou os arquivos e abra o arquivo index.html diretamente no seu navegador web preferido (Chrome, Firefox, Edge são recomendados, especialmente em suas versões mobile Android).

Pronto! A aplicação "Minhas Compras de Mercado" carregará e você poderá começar a:

Definir seu orçamento.

Adicionar itens (digitando, ditando ou importando).

Gerenciar sua lista (editar, excluir, filtrar).

Gerar relatórios ou limpar a lista quando necessário.

📥 Importando Dados

Você pode adicionar itens à sua lista de duas formas além da digitação/voz:

Lista de Texto:

Clique em "Importar".

Escolha a opção "Lista de Itens (texto)".

Na janela que abrir, cole ou digite os nomes dos itens que deseja adicionar, separados por vírgula (ex: Arroz, Feijão, Óleo de Soja, Café).

Clique em "Adicionar Itens da Lista". Os itens serão adicionados com quantidade 1 e valor R$ 0,00, sendo categorizados automaticamente. Itens duplicados (já existentes na lista) serão ignorados.

Planilha Excel (.xlsx):

Clique em "Importar".

Escolha a opção "Arquivo Excel (.xlsx)".

Baixe o modelo (modelo_importacao.xlsx) fornecido na janela de aviso para ver o formato esperado.

Prepare sua planilha com as colunas: Descrição, Quantidade, Valor Unitário (R$), Categoria (opcional).

Clique em "Selecionar Arquivo .xlsx" e escolha sua planilha. Os itens serão adicionados à lista, ignorando duplicados.

✅ Pré-requisitos

Um navegador web moderno compatível com HTML5, CSS3 e JavaScript (Chrome, Firefox, Safari, Edge - otimizado para mobile).

Microfone habilitado e permissão concedida no navegador para usar a funcionalidade de ditado por voz.

Acesso à internet (pelo menos na primeira vez) para carregar as bibliotecas externas (Font Awesome, Awesomplete, SheetJS) e para o funcionamento da API de Ditado por Voz (geralmente requer conexão).

