// Arrays para armazenar os itens e categorias
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itensParaConfirmar = []; // Para futura expansão (importação de listas)

// Elementos do DOM
const vozInput = document.getElementById('vozInput');
const ativarVoz = document.getElementById('ativarVoz');
const vozFeedback = document.querySelector('.voz-feedback');
const listaCompras = document.getElementById('listaCompras');
const totalValorSpan = document.getElementById('totalValor');
const totalValorPainelSpan = document.getElementById('totalValorPainel');
const orcamentoInput = document.getElementById('orcamento');
const categoriaFiltro = document.getElementById('categoriaFiltro');
const modalEdicao = document.getElementById('modalEdicao');
const fecharModalBtn = document.querySelector('.fechar-modal');
const editarDescricao = document.getElementById('editarDescricao');
const editarQuantidade = document.getElementById('editarQuantidade');
const editarValor = document.getElementById('editarValor');
const salvarEdicaoBtn = document.getElementById('salvarEdicao');
const exportarBtn = document.getElementById('exportar');
const importarBtn = document.getElementById('importar');
const limparListaBtn = document.getElementById('limparLista');
const relatorioBtn = document.getElementById('relatorio');

let itemEditandoIndex = null;

// Lista de sugestões para categorias (expandida)
const categorias = {
    Alimentos: ['arroz', 'feijão', 'macarrão', 'banana', 'tomate', 'leite', 'ovo'],
    Limpeza: ['água sanitária', 'detergente', 'vassoura', 'saco de lixo'],
    'Higiene Pessoal': ['sabonete', 'shampoo', 'desodorante', 'papel higiênico']
};

// Carregar dados salvos no localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('compras');
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (dadosSalvos) compras = JSON.parse(dadosSalvos);
    if (orcamentoSalvo) orcamentoInput.value = orcamentoSalvo;
    atualizarLista();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    localStorage.setItem('orcamento', orcamentoInput.value);
}

// Inferir categoria automaticamente com base na descrição
function inferirCategoria(descricao) {
    descricao = descricao.toLowerCase();
    for (const [categoria, palavras] of Object.entries(categorias)) {
        if (palavras.some(palavra => descricao.includes(palavra))) {
            return categoria;
        }
    }
    return 'Outros'; // Categoria padrão para itens não categorizados
}

// Processar texto ditado (Gboard)
vozInput.addEventListener('input', () => {
    vozFeedback.textContent = vozInput.value;
    vozFeedback.style.display = vozInput.value ? 'block' : 'none';
});

vozInput.addEventListener('change', () => {
    const texto = vozInput.value.toLowerCase();
    const regex = /(\d+)\s*(quilos?|unidades?)?\s*de\s*([\w\s]+)\s*por\s*([\d,]+)\s*(reais)?/;
    const match = texto.match(regex);
    if (match) {
        const quantidade = parseInt(match[1]);
        const descricao = match[3].trim();
        const valor = parseFloat(match[4].replace(',', '.'));
        compras.push({ descricao, quantidade, valor, categoria: inferirCategoria(descricao) });
        salvarDados();
        atualizarLista();
        vozInput.value = '';
        vozFeedback.textContent = '';
    } else {
        alert('Ditado não reconhecido. Tente novamente, por exemplo: "2 quilos de arroz por 5 reais".');
    }
});

ativarVoz.addEventListener('click', () => {
    vozInput.focus(); // Ativa o Gboard para ditado em dispositivos Android
});

// Atualizar lista de compras
function atualizarLista(filtrados = compras) {
    listaCompras.innerHTML = '';
    let total = 0;

    filtrados.forEach((item, index) => {
        const li = document.createElement('li');
        const valorTotalItem = item.quantidade * item.valor;
        li.innerHTML = `
            ${item.quantidade}x ${item.descricao} - R$ ${valorTotalItem.toFixed(2).replace('.', ',')} 
            (${item.categoria})
            <button class="botao-editar" onclick="editarItem(${index})">Editar</button>
            <button class="botao-excluir" onclick="excluirItem(${index})">-</button>
        `;
        listaCompras.appendChild(li);
        total += valorTotalItem;
    });

    totalValorSpan.textContent = total.toFixed(2).replace('.', ',');
    totalValorPainelSpan.textContent = total.toFixed(2).replace('.', ',');
    verificarOrcamento(total);
    salvarDados();
}

// Verificar orçamento
function verificarOrcamento(total) {
    const orcamento = parseFloat(orcamentoInput.value.replace(',', '.')) || 0;
    if (total > orcamento && orcamento > 0) {
        alert('Orçamento excedido! Total ultrapassou R$ ' + orcamento.toFixed(2).replace('.', ','));
    }
}

// Filtrar por categoria
categoriaFiltro.addEventListener('change', () => {
    const categoria = categoriaFiltro.value;
    const filtrados = categoria ? compras.filter(item => item.categoria === categoria) : compras;
    atualizarLista(filtrados);
});

// Editar item
function editarItem(index) {
    itemEditandoIndex = index;
    const item = compras[index];
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valor.toFixed(2).replace('.', ',');
    modalEdicao.style.display = 'block';
}

// Salvar edição
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex !== null) {
        const novaDescricao = editarDescricao.value;
        const novaQuantidade = parseInt(editarQuantidade.value) || 1;
        const novoValor = parseFloat(editarValor.value.replace(',', '.')) || 0;

        if (novaDescricao && !isNaN(novaQuantidade) && !isNaN(novoValor)) {
            compras[itemEditandoIndex] = {
                descricao: novaDescricao,
                quantidade: novaQuantidade,
                valor: novoValor,
                categoria: inferirCategoria(novaDescricao)
            };
            modalEdicao.style.display = 'none';
            atualizarLista();
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
        itemEditandoIndex = null;
    }
});

// Excluir item
function excluirItem(index) {
    if (confirm('Deseja excluir este item?')) {
        compras.splice(index, 1);
        atualizarLista();
    }
}

// Fechar modal
fecharModalBtn.addEventListener('click', () => {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null;
});

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
    if (event.target === modalEdicao) {
        modalEdicao.style.display = 'none';
        itemEditandoIndex = null;
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
            } catch (error) {
                alert('Erro ao importar o arquivo JSON.');
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
    }
});

// Gerar relatório Excel
relatorioBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        alert('Não há dados para gerar o relatório.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const wsName = "RelatorioCompras";
    const wsData = [
        ["Descrição", "Quantidade", "Valor (R$)", "Categoria"],
        ...compras.map(item => [item.descricao, item.quantidade, item.valor.toFixed(2), item.categoria])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, wsName);

    const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nomeArquivo = `${dataAtual}_RelatorioCompras.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
});

// Inicializar ao carregar a página
carregarDados();
