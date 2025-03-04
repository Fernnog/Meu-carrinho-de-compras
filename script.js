// Seleção de elementos do DOM
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const vozFeedback = document.querySelector('.voz-feedback');
const listaCompras = document.querySelector('#listaCompras');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor');
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const fecharModalBtn = document.querySelector('.fechar-modal');
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade');
const editarValor = document.querySelector('#editarValor');
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const exportarBtn = document.querySelector('#exportar');
const importarBtn = document.querySelector('#importar');
const limparListaBtn = document.querySelector('#limparLista');
const relatorioBtn = document.querySelector('#relatorio');
const coins = document.querySelectorAll('.coin');

// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para autocomplete (expandidas)
const listaSugestoes = [
    // Limpeza
    "Água sanitária", "Detergente", "Vassoura", "Saco de lixo",
    // Alimentos
    "Arroz", "Feijão", "Macarrão", "Banana", "Tomate", "Biscoito",
    // Higiene Pessoal
    "Sabonete", "Shampoo", "Desodorante", "Papel higiênico"
];

// Função para inferir categoria automaticamente
function inferirCategoria(descricao) {
    const categorias = {
        Alimentos: ['arroz', 'feijão', 'macarrão', 'banana', 'tomate', 'biscoito'],
        Limpeza: ['água sanitária', 'detergente', 'vassoura', 'saco de lixo'],
        'Higiene Pessoal': ['sabonete', 'shampoo', 'desodorante', 'papel higiênico']
    };
    descricao = descricao.toLowerCase();
    for (const [categoria, palavras] of Object.entries(categorias)) {
        if (palavras.some(palavra => descricao.includes(palavra))) {
            return categoria;
        }
    }
    return 'Outros';
}

// Configurar autocomplete com Awesomplete
new Awesomplete(vozInput, {
    list: listaSugestoes,
    filter: function(text, input) {
        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
    },
    replace: function(text) {
        const before = this.input.value.match(/^.+,\s*|/)[0];
        if (before) {
            this.input.value = before + text + ", ";
        } else {
            this.input.value = text;
        }
    },
    minChars: 1
});

// Feedback visual no input de voz
vozInput.addEventListener('input', () => {
    vozFeedback.textContent = vozInput.value;
    if (vozInput.value) {
        vozFeedback.classList.add('fade-in');
        vozFeedback.style.display = 'block';
        setTimeout(() => {
            vozFeedback.style.opacity = '1';
        }, 10);
    } else {
        vozFeedback.style.opacity = '0';
        setTimeout(() => {
            vozFeedback.style.display = 'none';
            vozFeedback.classList.remove('fade-in');
        }, 300);
    }
});

// Função auxiliar para converter números escritos em português para numéricos
function parseNumber(texto) {
    const numerosEscritos = {
        'um': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
        'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
    };
    texto = texto.toLowerCase().trim();
    return numerosEscritos[texto] || parseInt(texto) || 1; // Default para 1 se não reconhecido
}

// Processar texto ditado e adicionar item
vozInput.addEventListener('change', () => {
    const texto = vozInput.value.toLowerCase().trim();

    // Regex para comando com marcadores: "quantidade 2 descrição biscoitos preço 2,35"
    const regexMarcadores = /^quantidade\s+(\d+|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez)\s+descrição\s+([\w\s]+)\s+preço\s+([\d,\s]+)(?:\s*(reais|real))?$/;
    const matchMarcadores = texto.match(regexMarcadores);

    // Regex para comando natural: "dois biscoitos por 2,35 cada"
    const regexNatural = /^(\d+|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez)\s*([\w\s]+(?:de\s[\w\s]+)?)(?:\s*(kg|quilos?|unidades?|biscoitos?))?\s*(?:a|por)\s*([\d,]+)(?:\s*(reais|real))?(?:\s*cada)?$/;
    const matchNatural = texto.match(regexNatural);

    if (matchMarcadores) {
        const quantidadeStr = matchMarcadores[1];
        const quantidade = parseNumber(quantidadeStr);
        const descricao = matchMarcadores[2].trim();
        const unitPriceStr = matchMarcadores[3].replace(/\s/g, '').replace(',', '.');
        const valorUnitario = parseFloat(unitPriceStr) || 0;

        if (valorUnitario <= 0) {
            alert('Valor unitário inválido. Insira um valor maior que zero.');
            return;
        }

        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        atualizarLista();
        salvarDados();
        vozInput.value = '';
        vozFeedback.textContent = '';
        animarMoedas();
        animarItemAdicionado(novoItem);
        vozFeedback.classList.add('success-fade');
        setTimeout(() => vozFeedback.classList.remove('success-fade'), 1000);
    } else if (matchNatural) {
        const quantidadeStr = matchNatural[1];
        const quantidade = parseNumber(quantidadeStr);
        let descricao = matchNatural[2].trim();
        descricao = descricao.replace(/(kg|quilos?|unidades?|biscoitos?)$/, '').trim();
        descricao = descricao.replace(/^de\s/, '').trim();
        const unitPriceStr = matchNatural[4].replace(/\s/g, '').replace(',', '.');
        const valorUnitario = parseFloat(unitPriceStr) || 0;

        if (valorUnitario <= 0) {
            alert('Valor unitário inválido. Insira um valor maior que zero.');
            return;
        }

        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        atualizarLista();
        salvarDados();
        vozInput.value = '';
        vozFeedback.textContent = '';
        animarMoedas();
        animarItemAdicionado(novoItem);
        vozFeedback.classList.add('success-fade');
        setTimeout(() => vozFeedback.classList.remove('success-fade'), 1000);
    } else {
        alert('Ditado não reconhecido. Tente: "quantidade 2 descrição biscoitos preço 2,35" ou "dois biscoitos por 2,35 cada".');
        vozFeedback.classList.add('error-fade');
        setTimeout(() => vozFeedback.classList.remove('error-fade'), 1000);
    }
});

ativarVoz.addEventListener('click', () => {
    vozInput.focus(); // Ativa o Gboard para ditado em dispositivos Android
});

// Animação das moedas ao adicionar item
function animarMoedas() {
    coins.forEach((coin, index) => {
        coin.style.opacity = 0;
        setTimeout(() => {
            coin.style.transition = 'opacity 0.5s';
            coin.style.opacity = 1;
        }, index * 200);
    });
}

// Animação para item adicionado na lista
function animarItemAdicionado(item) {
    const li = document.createElement('li');
    li.textContent = `${item.quantidade}x ${item.descricao} - R$ ${item.valorUnitario.toFixed(2).replace('.', ',')} (${item.categoria})`;
    li.classList.add('fade-in');
    li.addEventListener('click', () => editarItem(compras.length - 1));
    listaCompras.appendChild(li);
    setTimeout(() => li.classList.remove('fade-in'), 500);
}

// Atualizar lista de compras com filtro por categoria
function atualizarLista(filtrados = compras) {
    listaCompras.innerHTML = '';
    let total = 0;
    filtrados.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.quantidade}x ${item.descricao} - R$ ${item.valorUnitario.toFixed(2).replace('.', ',')} (${item.categoria})`;
        li.classList.add('fade-in');
        li.addEventListener('click', () => editarItem(index));
        listaCompras.appendChild(li);
        total += item.quantidade * item.valorUnitario;
    });
    totalValorPainel.textContent = total.toFixed(2).replace('.', ',');
    totalValor.textContent = total.toFixed(2).replace('.', ',');
    verificarOrcamento(total);
}

// Verificar e alertar sobre orçamento
function verificarOrcamento(total) {
    const orcamento = parseFloat(orcamentoInput.value.replace(',', '.')) || 0;
    if (total > orcamento && orcamento > 0) {
        alert('Orçamento excedido! Total ultrapassou R$ ' + orcamento.toFixed(2).replace('.', ','));
        document.querySelector('#painelTotal').style.backgroundColor = '#ffcccc';
        setTimeout(() => document.querySelector('#painelTotal').style.backgroundColor = '#f8f8f8', 2000);
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
}

// Filtrar por categoria
categoriaFiltro.addEventListener('change', () => {
    const categoria = categoriaFiltro.value;
    const filtrados = categoria ? compras.filter(item => item.categoria === categoria) : compras;
    atualizarLista(filtrados);
});

// Editar item no modal
function editarItem(index) {
    itemEditandoIndex = index;
    const item = compras[index];
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario.toFixed(2).replace('.', ',');
    modalEdicao.style.display = 'block';
    modalEdicao.classList.add('slide-in');
}

// Salvar edição
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex !== null) {
        const novaDescricao = editarDescricao.value;
        const novaQuantidade = parseInt(editarQuantidade.value) || 1;
        const novoValorUnitario = parseFloat(editarValor.value.replace(',', '.')) || 0;
        if (novoValorUnitario <= 0) {
            alert('Valor unitário inválido. Insira um valor maior que zero.');
            return;
        }
        const novaCategoria = inferirCategoria(novaDescricao);
        compras[itemEditandoIndex] = { descricao: novaDescricao, quantidade: novaQuantidade, valorUnitario: novoValorUnitario, categoria: novaCategoria };
        modalEdicao.style.display = 'none';
        modalEdicao.classList.remove('slide-in');
        atualizarLista();
        salvarDados();
        animarMoedas();
        vozFeedback.classList.add('success-fade');
        setTimeout(() => vozFeedback.classList.remove('success-fade'), 1000);
    }
});

// Fechar modal
fecharModalBtn.addEventListener('click', () => {
    modalEdicao.style.display = 'none';
    modalEdicao.classList.remove('slide-in');
});

window.addEventListener('click', (event) => {
    if (event.target === modalEdicao) {
        modalEdicao.style.display = 'none';
        modalEdicao.classList.remove('slide-in');
    }
});

// Formatar valor em tempo real
editarValor.addEventListener('input', function() {
    let valor = this.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{1,})(\d{2})$/, "$1,$2");
    this.value = valor;
});

// Exportar dados para JSON
exportarBtn.addEventListener('click', () => {
    const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nomeArquivo = `${dataAtual}_Compras_no_mercado.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compras));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", nomeArquivo);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    animarMoedas();
    vozFeedback.textContent = 'Dados exportados com sucesso!';
    vozFeedback.classList.add('success-fade');
    setTimeout(() => vozFeedback.classList.remove('success-fade') && (vozFeedback.textContent = ''), 2000);
});

// Importar dados de JSON
importarBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                compras = JSON.parse(e.target.result);
                atualizarLista();
                salvarDados();
                animarMoedas();
                vozFeedback.textContent = 'Dados importados com sucesso!';
                vozFeedback.classList.add('success-fade');
                setTimeout(() => vozFeedback.classList.remove('success-fade') && (vozFeedback.textContent = ''), 2000);
            } catch (error) {
                alert('Erro ao importar o arquivo JSON.');
                vozFeedback.textContent = 'Erro ao importar!';
                vozFeedback.classList.add('error-fade');
                setTimeout(() => vozFeedback.classList.remove('error-fade') && (vozFeedback.textContent = ''), 2000);
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

// Limpar lista
limparListaBtn.addEventListener('click', () => {
    if (confirm('Deseja exportar os dados antes de limpar?')) {
        exportarBtn.click();
    }
    if (confirm('Tem certeza que deseja limpar a lista?')) {
        compras = [];
        atualizarLista();
        salvarDados();
        animarMoedas();
        vozFeedback.textContent = 'Lista limpa com sucesso!';
        vozFeedback.classList.add('success-fade');
        setTimeout(() => vozFeedback.classList.remove('success-fade') && (vozFeedback.textContent = ''), 2000);
    }
});

// Gerar relatório Excel
relatorioBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        alert('Não há dados para gerar o relatório.');
        vozFeedback.textContent = 'Nenhum dado para relatório!';
        vozFeedback.classList.add('error-fade');
        setTimeout(() => vozFeedback.classList.remove('error-fade') && (vozFeedback.textContent = ''), 2000);
        return;
    }
    const wb = XLSX.utils.book_new();
    const wsName = "RelatorioCompras";
    const wsData = [
        ["Descrição", "Quantidade", "Valor Unitário (R$)", "Categoria"],
        ...compras.map(item => [item.descricao, item.quantidade, item.valorUnitario.toFixed(2), item.categoria])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, wsName);
    const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nomeArquivo = `${dataAtual}_RelatorioCompras.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    animarMoedas();
    vozFeedback.textContent = 'Relatório gerado com sucesso!';
    vozFeedback.classList.add('success-fade');
    setTimeout(() => vozFeedback.classList.remove('success-fade') && (vozFeedback.textContent = ''), 2000);
});

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarLista();
    animarMoedas();
});

// Função auxiliar para carregar dados salvos e converter formato antigo
function carregarDados() {
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (orcamentoSalvo) orcamentoInput.value = orcamentoSalvo.replace('.', ',');
    compras = JSON.parse(localStorage.getItem('compras')) || [];
    compras.forEach(item => {
        if (item.valor && !item.valorUnitario) {
            item.valorUnitario = item.valor / item.quantidade;
            delete item.valor;
        }
    });
    salvarDados();
}

// Estilos dinâmicos para animações (necessitam de CSS correspondente)
vozFeedback.classList.add('fade-in'); // Para animações de entrada/saída
