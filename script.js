const descricaoInput = document.getElementById('descricao');
const quantidadeInput = document.getElementById('quantidade');
const valorInput = document.getElementById('valor');
const adicionarBtn = document.getElementById('adicionar');
const listaComprasTbody = document.getElementById('listaCompras').getElementsByTagName('tbody')[0];
const totalValorSpan = document.getElementById('totalValor');
const exportarBtn = document.getElementById('exportar');
const importarBtn = document.getElementById('importar');
const resetarBtn = document.getElementById('resetar');
const relatorioBtn = document.getElementById('relatorio');
const arquivoImportarInput = document.getElementById('arquivoImportar');
const importarListaBtn = document.getElementById('importarLista');
const arquivoImportarListaInput = document.getElementById('arquivoImportarLista');
const listaConferenciaTbody = document.getElementById('listaConferencia').getElementsByTagName('tbody')[0];
const confirmarItensBtn = document.getElementById('confirmarItens');

let compras = [];
let itensParaConfirmar = [];

// Carrega os dados do localStorage ao iniciar
carregarDados();

// Lista de sugestões para o autocomplete
const listaSugestoes = [
    // Limpeza
    "Água sanitária", "Álcool", "Amaciante", "Desengordurante", "Desinfetante", "Detergente", "Esponja",
    "Flanela", "Guardanapo", "Lava-louças", "Lava-roupas líquido", "Lava-roupas em pó", "Lustra-móveis",
    "Multiuso", "Palha de aço", "Pano de chão", "Pano de prato", "Refresco", "Rodo", "Sabão em barra",
    "Sabão em pó", "Saco de lixo 15 L", "Saco de lixo 30 L", "Saco de lixo 50 L", "Saco de lixo 100 L",
    "Vassoura",

    // Temperos e Condimentos
    "Açafrão", "Alecrim", "Alho", "Alho em pó", "Azeite", "Azeite de dendê", "Caldo de carne",
    "Caldo de galinha", "Caldo de legumes", "Canela", "Cebola", "Cebola em pó", "Coentro", "Colorau",
    "Cominho", "Cravo", "Curry", "Ervas finas", "Gengibre", "Ketchup", "Louro", "Maionese",
    "Manjericão", "Mostarda", "Noz-moscada", "Orégano", "Páprica", "Pimenta-do-reino", "Sal",
    "Sal grosso", "Salsa", "Tempero baiano", "Tempero completo", "Vinagre", "Vinagre balsâmico",

    // Massas e Grãos
    "Arroz", "Arroz integral", "Aveia", "Biscoito", "Biscoito cream cracker", "Biscoito de água e sal",
    "Biscoito de maisena", "Biscoito de polvilho", "Biscoito doce", "Biscoito integral",
    "Biscoito recheado", "Cereal matinal", "Cuscuz", "Ervilha", "Farinha de mandioca", "Farinha de milho",
    "Farinha de rosca", "Farinha de trigo", "Feijão", "Feijão branco", "Feijão carioca", "Feijão preto",
    "Fubá", "Granola", "Grão-de-bico", "Lentilha", "Macarrão", "Macarrão espaguete",
    "Macarrão furadinho", "Macarrão gravatinha", "Macarrão instantâneo (Miojo)", "Macarrão parafuso",
    "Macarrão penne", "Massa de lasanha", "Massa de pastel", "Massa para bolo", "Milho de pipoca",
    "Milho verde", "Polenta", "Quinoa",

    // Legumes, Verduras e Frutas
    "Abacate", "Abacaxi", "Abobrinha", "Alface", "Alho-poró", "Banana", "Batata", "Batata-doce", "Berinjela",
    "Beterraba", "Brócolis", "Cebola", "Cebolinha", "Cenoura", "Chuchu", "Coentro", "Couve",
    "Couve-flor", "Espinafre", "Goiaba", "Laranja", "Limão", "Maçã", "Mamão", "Manga", "Maracujá",
    "Melancia", "Melão", "Morango", "Pepino", "Pera", "Pimentão", "Repolho", "Rúcula", "Salsa",
    "Tomate", "Uva",

    // Higiene Pessoal
    "Absorvente", "Algodão", "Aparelho de barbear", "Condicionador", "Cotonete", "Creme de barbear",
    "Creme dental", "Creme hidratante", "Desodorante", "Escova de cabelo", "Escova de dente", "Fio dental",
    "Lenço de papel", "Papel higiênico", "Sabonete", "Sabonete líquido", "Shampoo", "Talco",

    // Laticínios e Ovos
    "Cream cheese", "Iogurte", "Leite", "Leite condensado", "Leite de coco", "Leite em pó", "Manteiga",
    "Margarina", "Ovos", "Queijo", "Queijo coalho", "Queijo minas", "Queijo mussarela", "Queijo parmesão",
    "Queijo prato", "Queijo provolone", "Requeijão", "Ricota",

    // Carnes e Frios
    "Bacon", "Carne bovina", "Carne de porco", "Carne moída", "Frango", "Hambúrguer", "Linguiça",
    "Linguiça calabresa", "Linguiça toscana", "Mortadela", "Peixe", "Presunto", "Salame", "Salsicha",

    // Bebidas
    "Água com gás", "Água de coco", "Água mineral", "Café", "Café solúvel", "Cerveja", "Chá",
    "Refrigerante", "Suco", "Suco concentrado", "Suco de caixinha", "Suco em pó", "Vinho",

    // Outros
    "Achocolatado em pó", "Adoçante", "Açúcar", "Açúcar mascavo", "Azeitona", "Batata palha",
    "Biscoito genérico", "Bolo", "Bombom", "Chocolate", "Chocolate em barra", "Chocolate em pó",
    "Fermento", "Fermento biológico", "Fermento em pó", "Geleia", "Goma de tapioca", "Mel",
    "Óleo de coco", "Óleo de girassol", "Óleo de soja", "Pão", "Pão de forma", "Pão de queijo",
    "Pão francês", "Pipoca", "Sorvete", "Torrada", "Torta", "Yakult",
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
    quantidadeInput.focus(); // Move o foco para o campo de quantidade
});

quantidadeInput.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        valorInput.focus();
    }
});

function atualizarLista() {
    listaComprasTbody.innerHTML = '';
    let total = 0;

    compras.forEach((compra, index) => {
        let row = listaComprasTbody.insertRow();
        let descricaoCell = row.insertCell();
        let quantidadeCell = row.insertCell();
        let valorCell = row.insertCell();
        let acoesCell = row.insertCell();

        descricaoCell.innerHTML = compra.descricao;
        quantidadeCell.innerHTML = compra.quantidade;
        valorCell.innerHTML = compra.valor.toFixed(2);

        // Cria o botão de exclusão
        let botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-excluir';
        botaoExcluir.innerHTML = '-';
        botaoExcluir.setAttribute('onclick', '');
        botaoExcluir.addEventListener('click', () => {
            compras.splice(index, 1);
            atualizarLista();
        });

        acoesCell.appendChild(botaoExcluir);

        total += compra.valor * compra.quantidade;
    });

    totalValorSpan.innerHTML = total.toFixed(2);
    atualizarPainelTotal();
    salvarDados(); 
}

function adicionarItem() {
    const descricao = descricaoInput.value;
    const quantidade = parseInt(quantidadeInput.value);
    const valor = parseFloat(valorInput.value);

    if (descricao && !isNaN(valor) && !isNaN(quantidade)) {
        const valorFormatado = valor.toFixed(2);
        compras.push({ descricao, quantidade, valor: parseFloat(valorFormatado)});
        atualizarLista();
        descricaoInput.value = '';
        quantidadeInput.value = '1'; // Reset para o valor padrão
        valorInput.value = '';
    } else {
        alert('Por favor, preencha a descrição, quantidade e o valor corretamente.');
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
            salvarDados(); // Salva os dados após importar
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
        salvarDados(); // Salva os dados após resetar
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
        ["Descrição", "Quantidade", "Valor (R$)"],
        ...compras.map(item => [item.descricao, item.quantidade, item.valor.toFixed(2)])
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
        total += compra.valor * compra.quantidade;
    });
    totalValorPainelSpan.innerHTML = total.toFixed(2);
}

// Salva os dados no localStorage
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
}

// Carrega os dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('compras');
    if (dadosSalvos) {
        compras = JSON.parse(dadosSalvos);
        atualizarLista();
    }
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

function importarDadosLista() {
    arquivoImportarListaInput.click();
}

arquivoImportarListaInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0]; // Pega o nome da primeira aba
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Processa os dados a partir da linha 2 (índice 1), ignorando a linha de cabeçalho
            itensParaConfirmar = jsonData.slice(1).map(row => ({
                descricao: row[0], // Coluna A
                quantidade: row[1], // Coluna B
                valor: 0,
                confirmado: false
            })).filter(item => item.descricao !== undefined && item.quantidade !== undefined); // Filtra linhas inválidas

            atualizarListaConferencia();
        } catch (error) {
            console.error("Erro ao importar o arquivo:", error);
            alert('Erro ao importar o arquivo.');
        }
    };

    reader.onerror = function(ex) {
        console.error("Erro ao ler o arquivo:", ex);
        alert('Erro ao ler o arquivo.');
    };

    reader.readAsBinaryString(file);
});

function atualizarListaConferencia() {
    listaConferenciaTbody.innerHTML = '';

    itensParaConfirmar.forEach((item, index) => {
        let row = listaConferenciaTbody.insertRow();
        let descricaoCell = row.insertCell();
        let quantidadeCell = row.insertCell();
        let valorCell = row.insertCell();
        let confirmarCell = row.insertCell();

        descricaoCell.innerHTML = item.descricao;
        quantidadeCell.innerHTML = item.quantidade;

        let valorInput = document.createElement('input');
        valorInput.type = 'text';
        valorInput.value = item.valor.toFixed(2);
        valorInput.className = 'valor-conferencia';
        valorInput.oninput = function() {
            let valor = this.value;
            valor = valor.replace(/\D/g, '');
            valor = valor.replace(/(\d{1,})(\d{2})$/, "$1.$2");
            this.value = valor;
            item.valor = parseFloat(valor);
        };
        valorCell.appendChild(valorInput);

        let confirmarCheckbox = document.createElement('input');
        confirmarCheckbox.type = 'checkbox';
        confirmarCheckbox.checked = item.confirmado;
        confirmarCheckbox.onchange = () => {
            item.confirmado = confirmarCheckbox.checked;
        };
        confirmarCell.appendChild(confirmarCheckbox);
    });
}

function confirmarItens() {
    itensParaConfirmar.forEach(item => {
        if (item.confirmado && item.valor > 0) {
            compras.push({
                descricao: item.descricao,
                quantidade: item.quantidade,
                valor: item.valor
            });
        }
    });

    itensParaConfirmar = itensParaConfirmar.filter(item => !item.confirmado);
    atualizarListaConferencia();
    atualizarLista();
    salvarDados();
}

importarListaBtn.addEventListener('click', importarDadosLista);
confirmarItensBtn.addEventListener('click', confirmarItens);

atualizarPainelTotal();
