const descricaoInput = document.getElementById('descricao');
const quantidadeInput = document.getElementById('quantidade');
const valorInput = document.getElementById('valor');
const adicionarBtn = document.getElementById('adicionar');
const listaComprasTbody = document.getElementById('listaCompras').getElementsByTagName('tbody')[0];
const totalValorSpan = document.getElementById('totalValor');
const exportarBtn = document.getElementById('exportar');
const importarBtn = document.getElementById('importar');
const limparListaBtn = document.getElementById('limparLista');
const relatorioBtn = document.getElementById('relatorio');
const arquivoImportarInput = document.getElementById('arquivoImportar');
const importarListaBtn = document.getElementById('importarLista');
const arquivoImportarListaInput = document.getElementById('arquivoImportarLista');
const listaConferenciaTbody = document.getElementById('listaConferencia').getElementsByTagName('tbody')[0];
const confirmarItensBtn = document.getElementById('confirmarItens');

let compras = [];
let itensParaConfirmar = [];

// Variáveis globais para o modal
const modalEdicao = document.getElementById('modalEdicao');
const fecharModalBtn = document.getElementsByClassName('fechar-modal')[0];
const editarDescricaoInput = document.getElementById('editarDescricao');
const editarQuantidadeInput = document.getElementById('editarQuantidade');
const editarValorInput = document.getElementById('editarValor');
const salvarEdicaoBtn = document.getElementById('salvarEdicao');
let itemEditandoIndex = null; // Variável para armazenar o índice do item sendo editado

// Carrega os dados do localStorage ao iniciar
carregarDados();

// Lista de sugestões para o autocomplete
const listaSugestoes = [
    // ... (sua lista de sugestões - mantida igual) ...
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
    filter: function (text, input) {
        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
    },
    replace: function (text) {
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
descricaoInput.addEventListener('awesomplete-selectcomplete', function (event) {
    quantidadeInput.focus(); // Move o foco para o campo de quantidade
});

quantidadeInput.addEventListener('keyup', function (event) {
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
        botaoExcluir.addEventListener('click', () => {
            compras.splice(index, 1);
            atualizarLista();
            salvarDados();
        });

        // Cria o botão "Mais" para editar o item
        let botaoEditar = document.createElement('button');
        botaoEditar.className = 'botao-editar';
        botaoEditar.innerHTML = 'Mais'; // Ou um ícone de edição, se preferir
        botaoEditar.addEventListener('click', () => {
            abrirModalEdicao(index);
        });

        acoesCell.appendChild(botaoExcluir);
        acoesCell.appendChild(botaoEditar); // Adiciona o botão "Mais" depois do botão "Excluir"

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
        compras.push({ descricao, quantidade, valor: parseFloat(valorFormatado) });
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

arquivoImportarInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
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

function limparDados() {
    if (confirm('Deseja exportar os dados antes de limpar?')) {
        exportarDados();
    }

    if (confirm('Tem certeza que deseja limpar os lançamentos?')) {
        compras = [];
        atualizarLista();
        salvarDados(); // Salva os dados após limpar
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
limparListaBtn.addEventListener('click', limparDados);
relatorioBtn.addEventListener('click', gerarRelatorio);

descricaoInput.addEventListener('keyup', function (event) {
    if (event.key === "Enter") {
        adicionarItem();
    }
});

// Formatação APRIMORADA do valor (incluindo tratamento para ditado)
function formatarValor(valorInput) {
    let valor = valorInput.value;

    // 1. Remover tudo que não for dígito, vírgula ou ponto
    valor = valor.replace(/[^0-9.,]/g, '');

    // 2. Substituir vírgulas por pontos
    valor = valor.replace(/,/g, '.');

    // 3. Remover múltiplos pontos (deixar apenas o último)
    let pontos = valor.split('.');
    if (pontos.length > 2) {
        valor = pontos.slice(0, -1).join('') + '.' + pontos.slice(-1)[0];
    }
     // 4. Dividir em parte inteira e decimal
    let [parteInteira, parteDecimal] = valor.split('.');

     // 5. Garantir que parteDecimal tenha no máximo 2 dígitos,
    // e não deixa apagar os centavos se tiver valor na parte inteira
    if (parteDecimal !== undefined){
        parteDecimal = parteDecimal.slice(0, 2);
    }

     // 6.  Junta tudo
    if(parteDecimal !== undefined){
      valor = parteInteira + "." + parteDecimal;
    } else {
      valor = parteInteira
    }

    valorInput.value = valor;


    // Atualiza o valor do item no array 'compras'
    if (valorInput.id === 'valor') {
        // Se o input for o principal, atualiza diretamente no array 'compras' após adicionar o item
        // Não faz nada aqui, pois o valor só é atualizado ao adicionar.
    } else if (valorInput.id === 'editarValor') { //Para o modal
        if(itemEditandoIndex !== null && itemEditandoIndex !== undefined){
          compras[itemEditandoIndex].valor = parseFloat(valor) || 0;
        }

    }
}

function importarDadosLista() {
    arquivoImportarListaInput.click();
}

arquivoImportarListaInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
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

            // Mostra a tabela, o botão e o título após a importação
            document.getElementById('listaConferencia').style.display = 'table';
            document.getElementById('confirmarItens').style.display = 'block';
            document.getElementById('tituloConferencia').style.display = 'block'; // Mostrar o título
        } catch (error) {
            console.error("Erro ao importar o arquivo:", error);
            alert('Erro ao importar o arquivo.');
        }
    };

    reader.onerror = function (ex) {
        console.error("Erro ao ler o arquivo:", ex);
        alert('Erro ao ler o arquivo.');
    };

    reader.readAsBinaryString(file);
});

function atualizarListaConferencia() {
    listaConferenciaTbody.innerHTML = '';

    itensParaConfirmar.forEach((item, index) => {
        let row = listaConferenciaTbody.insertRow();

        // Cria a célula "Confirmar" primeiro
        let confirmarCell = row.insertCell();
        let confirmarCheckbox = document.createElement('input');
        confirmarCheckbox.type = 'checkbox';
        confirmarCheckbox.checked = item.confirmado;
        confirmarCheckbox.onchange = () => {
            item.confirmado = confirmarCheckbox.checked;
        };
        confirmarCell.appendChild(confirmarCheckbox);

        // Depois cria as outras células (Descrição, Quantidade, Valor)
        let descricaoCell = row.insertCell();
        let quantidadeCell = row.insertCell();
        let valorCell = row.insertCell();

        descricaoCell.innerHTML = item.descricao;
        quantidadeCell.innerHTML = item.quantidade;

        let valorInput = document.createElement('input');
        valorInput.type = 'text';
        valorInput.value = item.valor > 0 ? item.valor.toFixed(2) : '';
        valorInput.placeholder = '0.00';
        valorInput.className = 'valor-conferencia';
        valorInput.inputmode = "decimal"; // Importante para dispositivos móveis!

        valorInput.addEventListener('focus', function () {
            if (this.value === '0.00' || this.value === '') {
                this.value = '';
            }
        });

        valorInput.addEventListener('input', function () {
            formatarValor(this);
            item.valor = parseFloat(this.value) || 0; // Atualiza o valor do item
        });

        valorCell.appendChild(valorInput);
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

    // Oculta a tabela, o botão e o título após a confirmação
    document.getElementById('listaConferencia').style.display = 'none';
    document.getElementById('confirmarItens').style.display = 'none';
    document.getElementById('tituloConferencia').style.display = 'none';
}

importarListaBtn.addEventListener('click', importarDadosLista);
confirmarItensBtn.addEventListener('click', confirmarItens);

function abrirModalEdicao(index) {
    itemEditandoIndex = index;
    const item = compras[index];

    editarDescricaoInput.value = item.descricao;
    editarQuantidadeInput.value = item.quantidade;
    editarValorInput.value = item.valor.toFixed(2);

    modalEdicao.style.display = 'block';
}

function fecharModal() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Reseta o índice quando fecha o modal
}

function salvarEdicao() {
    const novaDescricao = editarDescricaoInput.value;
    const novaQuantidade = parseInt(editarQuantidadeInput.value);
    const novoValor = parseFloat(editarValorInput.value);

     if (novaDescricao && !isNaN(novaQuantidade) && !isNaN(novoValor)) {
        compras[itemEditandoIndex] = {
            descricao: novaDescricao,
            quantidade: novaQuantidade,
            valor: novoValor
        };
        atualizarLista();
        fecharModal();
        salvarDados();

    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

// Event listeners para o modal
fecharModalBtn.addEventListener('click', fecharModal);
salvarEdicaoBtn.addEventListener('click', salvarEdicao);

// Fechar o modal quando o usuário clicar fora dele
window.addEventListener('click', (event) => {
    if (event.target === modalEdicao) {
        fecharModal();
    }
});

atualizarPainelTotal();