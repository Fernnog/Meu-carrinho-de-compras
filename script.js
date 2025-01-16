const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const adicionarBtn = document.getElementById('adicionar');
const listaComprasTbody = document.getElementById('listaCompras').getElementsByTagName('tbody')[0];
const totalValorSpan = document.getElementById('totalValor');
const exportarBtn = document.getElementById('exportar');
const importarBtn = document.getElementById('importar');
const resetarBtn = document.getElementById('resetar');
const relatorioBtn = document.getElementById('relatorio');
const arquivoImportarInput = document.getElementById('arquivoImportar');

let compras = [];

// Lista de sugestões para o autocomplete
const listaSugestoes = [
    "Refresco", "Guardanapo", "Saco de lixo 15 L", "Saco de lixo 30 L",
    "Sabão em pó", "Amaciante", "Água sanitária", "Sabão para lavar roupas líquido",
    "Desinfetante", "Detergente", "Sabão em barra", "Escova de dente",
    "Pasta de dente", "Sabonete", "Shampoo", "Condicionador",
    "Papel higiênico", "Azeitona", "Óleo de soja", "Ketchup", "Mostarda",
    "Maionese", "Azeite", "Pipoca", "Achocolatado em pó", "Leite em pó",
    "Batata palha", "Massa para bolo", "Macarrão espaguete",
    "Macarrão penne", "Geleia", "Mel", "Biscoito recheado",
    "Biscoito creme cracker", "Tomate", "Alface", "Cebola", "Laranja",
    "Banana", "Uva", "Limão", "Manteiga", "Margarina", "Iogurte",
    "Mortadela", "Mussarela", "Yakult", "Biscoito genérico", "Café", "Miojo"
];

// Configuração do Awesomplete para desconsiderar acentos
new Awesomplete(descricaoInput, {
    list: listaSugestoes,
    filter: function(text, input) {
        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
    },
    replace: function(text) {
        // Pega o texto antes da última vírgula (ou todo o texto se não houver vírgula)
        var before = this.input.value.match(/^.+,\s*|/)[0]; 
        // Se houver texto antes (ou seja, mais de um item sendo digitado), adiciona a vírgula
        if (before) {
            this.input.value = before + text + ", ";
        } else {
            // Caso contrário, apenas substitui o texto atual pelo item selecionado
            this.input.value = text;
        }
    }
});

// Adiciona um ouvinte de eventos 'awesomplete-selectcomplete' ao campo de descrição
descricaoInput.addEventListener('awesomplete-selectcomplete', function(event) {
    valorInput.focus(); // Move o foco para o campo de valor
});

function atualizarLista() {
    listaComprasTbody.innerHTML = '';
    let total = 0;

    compras.forEach((compra, index) => {
        let row = listaComprasTbody.insertRow();
        let descricaoCell = row.insertCell();
        let valorCell = row.insertCell();
        let acoesCell = row.insertCell(); // Nova célula para as ações

        descricaoCell.innerHTML = compra.descricao;
        valorCell.innerHTML = compra.valor.toFixed(2);

        // Cria o botão de exclusão
        let botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-excluir';
        botaoExcluir.innerHTML = '-'; // Símbolo de "menos"
        botaoExcluir.setAttribute('onclick', ''); // Adiciona o atributo onclick vazio
        botaoExcluir.addEventListener('click', () => {
            // Remove o item da lista 'compras'
            compras.splice(index, 1);
            // Atualiza a lista e o total
            atualizarLista();
        });

        acoesCell.appendChild(botaoExcluir); // Adiciona o botão à célula de ações

        total += compra.valor;
    });

    totalValorSpan.innerHTML = total.toFixed(2);
    atualizarPainelTotal();
}

function adicionarItem() {
    const descricao = descricaoInput.value;
    const valor = parseFloat(valorInput.value);

    if (descricao && !isNaN(valor)) {
        const valorFormatado = valor.toFixed(2);
        compras.push({ descricao, valor: parseFloat(valorFormatado)});
        atualizarLista();
        descricaoInput.value = '';
        valorInput.value = '';
    } else {
        alert('Por favor, preencha a descrição e o valor corretamente.');
    }
}

function exportarDados() {
    const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nomeArquivo = `${dataAtual}_Compras no mercado.json`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compras));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", nomeArquivo);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarDados() {
    arquivoImportarInput.click();
}

arquivoImportarInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            compras = JSON.parse(e.target.result);
            atualizarLista();
        } catch (error) {
            alert('Erro ao importar o arquivo.');
        }
    };

    reader.readAsText(file);
});

function resetarDados() {
    if (confirm('Deseja exportar os dados antes de resetar?')) {
        exportarDados();
    }

    if (confirm('Tem certeza que deseja resetar os lançamentos?')) {
        compras = [];
        atualizarLista();
    }
}

function gerarRelatorio() {
    if (compras.length === 0) {
        alert('Não há dados para gerar o relatório.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws_name = "RelatorioCompras";

    const ws_data = [
        ["Descrição", "Valor (R$)"],
        ...compras.map(item => [item.descricao, item.valor.toFixed(2)])
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nomeArquivo = `${dataAtual}_RelatorioCompras.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
}

function atualizarPainelTotal() {
    const totalValorPainelSpan = document.getElementById('totalValorPainel');
    let total = 0;
    compras.forEach(compra => {
        total += compra.valor;
    });
    totalValorPainelSpan.innerHTML = total.toFixed(2);
}

adicionarBtn.addEventListener('click', adicionarItem);
exportarBtn.addEventListener('click', exportarDados);
importarBtn.addEventListener('click', importarDados);
resetarBtn.addEventListener('click', resetarDados);
relatorioBtn.addEventListener('click', gerarRelatorio);

descricaoInput.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        adicionarItem();
    }
});

valorInput.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        adicionarItem();
    }
});

valorInput.addEventListener('input', function(event) {
    let valor = valorInput.value;
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/(\d{1,})(\d{2})$/, "$1.$2");
    valorInput.value = valor;
});

atualizarPainelTotal();