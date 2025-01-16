/* =========================================
    ESTILOS GERAIS
   ========================================= */

body {
    font-family: sans-serif;
    background-color: #f2f2f2;
    font-size: 1rem; /* Tamanho de fonte base */
}

/* =========================================
    CONTAINER
   ========================================= */

.container {
    max-width: 95%;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* =========================================
    TÍTULOS
   ========================================= */

h1, h2 {
    color: #006400;
    text-align: center;
    font-size: 1.8rem; /* Títulos maiores */
}

h2 {
    font-size: 1.4rem; /* Subtítulo um pouco menor */
}

/* =========================================
    IMAGEM LOGO
   ========================================= */

header img {
    height: 120px; /* Ajuste o tamanho conforme necessário */
    margin-bottom: 20px; /* Adiciona uma margem abaixo do logo */
    display: block; /* Faz o logo ocupar a linha inteira */
    margin-left: auto;
    margin-right: auto; /* Centraliza o logo */
}

/* =========================================
    GRUPOS DE ENTRADA
   ========================================= */

.input-group {
    margin-bottom: 10px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #333;
}

/* Campos de entrada e Awesomplete aumentados em 50% */
.input-group input[type="text"],
.input-group input[type="number"],
.awesomplete {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 1.875rem; /* Aumentei a fonte em 50% */
}

/* Para aumentar o tamanho da lista de sugestões do Awesomplete */
.awesomplete > ul {
    font-size: 1.875rem; /* Ajuste para o mesmo tamanho do campo de entrada */
}

/* =========================================
    BOTÕES
   ========================================= */

/* Botão "Adicionar" maior */
.button-green.aumentado {
    padding: 15px 30px; /* Aumentei o padding */
    font-size: 1.5rem; /* Aumentei a fonte em 50% */
}

.button-green {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem; /* Tamanho de fonte padrão para botões */
}

.button-gold {
    background-color: #FFD700;
    color: #333;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem; /* Tamanho de fonte padrão para botões */
}

/* Botão de exclusão de item */
.botao-excluir {
    background-color: #dc3545; /* Vermelho */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    margin-left: 10px; /* Espaço à esquerda do botão */
    padding: 5px 10px; /* Ajuste o padding conforme necessário */
}

/* =========================================
    TABELA
   ========================================= */

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #008000;
    color: white;
}

/* =========================================
    TOTAL
   ========================================= */

.total {
    margin-top: 20px;
    text-align: right;
    font-size: 18px;
    color: #006400;
}

/* =========================================
    BOTÕES (container)
   ========================================= */

.buttons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

/* =========================================
    PAINEL SUPERIOR
   ========================================= */

/* Painel superior aumentado em 50% */
#painelTotal {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    padding: 30px; /* Aumentei o padding */
    margin-bottom: 20px;
    text-align: center;
    font-size: 3em; /* Aumentei o tamanho da fonte em 50% */
    border-radius: 5px;
}

#painelTotal #totalValorPainel {
    font-weight: bold;
    color: #006400;
}

/* =========================================
    MEDIA QUERIES (Responsividade)
   ========================================= */

@media (max-width: 768px) {
    .container {
        max-width: 100%;
        padding: 10px;
    }

    .input-group {
        margin-bottom: 15px;
    }

    .button-green, .button-gold {
        padding: 8px 15px;
        font-size: 0.9rem; /* Botões um pouco menores em telas pequenas */
    }

    /* Ajustando o tamanho do painel e campos para telas menores */
    #painelTotal {
        font-size: 2.4em;
        padding: 20px;
    }

    .input-group input[type="text"],
    .input-group input[type="number"],
    .awesomplete {
        font-size: 1.5rem;
    }

    .awesomplete > ul {
        font-size: 1.5rem;
    }

    .buttons {
        flex-direction: column;
    }

    h1 {
        font-size: 1.5rem; /* Títulos menores em telas pequenas */
    }

    h2 {
        font-size: 1.2rem;
    }

    /* Ajustando o botão Adicionar*/
    .button-green.aumentado {
        padding: 12px 24px;
        font-size: 1.2rem;
    }
}
