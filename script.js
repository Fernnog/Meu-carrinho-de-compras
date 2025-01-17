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


// Função para remover acentos de uma string
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Configuração do Awesomplete com filtro personalizado
new Awesomplete(descricaoInput, {
    list: listaSugestoes,
    filter: function(text, input) {
        // Remove os acentos do texto da sugestão e do texto digitado
        const textSemAcentos = removerAcentos(text.label);
        const inputSemAcentos = removerAcentos(input);

        // Verifica se o texto da sugestão (sem acentos) contém o texto digitado (sem acentos)
        return textSemAcentos.toLowerCase().indexOf(inputSemAcentos.toLowerCase()) !== -1;
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
