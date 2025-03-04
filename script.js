// Seleção de elementos do DOM
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
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
const barraProgresso = document.getElementById('barraProgresso'); // Adicionado
const porcentagemProgresso = document.getElementById('porcentagemProgresso'); // Adicionado


// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para autocomplete
const listaSugestoes = [
    "Água sanitária", "Detergente", "Vassoura", "Saco de lixo",
    "Arroz", "Feijão", "Macarrão", "Banana", "Tomate", "Biscoito",
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
        this.input.value = before ? before + text + ", " : text;
    },
    minChars: 1
});

// Feedback visual em tempo real
vozInput.addEventListener('input', () => {
    vozFeedback.textContent = vozInput.value || '';
    vozFeedback.style.display = vozInput.value ? 'block' : 'none';
    vozFeedback.style.opacity = vozInput.value ? '1' : '0';
    vozFeedback.classList.toggle('fade-in', !!vozInput.value);
});

// Função auxiliar para converter números escritos em português para numéricos
function parseNumber(texto) {
    const numerosEscritos = {
        'um': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
        'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
    };
    texto = texto.toLowerCase().trim();
    return numerosEscritos[texto] || parseInt(texto) || 1;
}

// Função para processar e adicionar item
function processarEAdicionarItem(texto) {
    texto = texto.toLowerCase().trim();

    const regexMarcadores = /^quantidade\s+(\d+|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez)\s+descrição\s+([\w\s]+)\s+preço\s+([\d,\s]+)(?:\s*(reais|real))?$/;
    const matchMarcadores = texto.match(regexMarcadores);

    const regexNatural = /^(\d+|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez)\s*([\w\s]+(?:de\s[\w\s]+)?)(?:\s*(kg|quilos?|unidades?|biscoitos?))?\s*(?:a|por)\s*([\d,]+)(?:\s*(reais|real))?(?:\s*cada)?$/;
    const matchNatural = texto.match(regexNatural);

    if (matchMarcadores) {
        const quantidade = parseNumber(matchMarcadores[1]);
        const descricao = matchMarcadores[2].trim();
        const valorUnitario = parseFloat(matchMarcadores[3].replace(/\s/g, '').replace(',', '.')) || 0;

        if (valorUnitario <= 0) {
            // Mensagem de erro mais detalhada
            mostrarFeedbackErro('Valor unitário inválido. Insira um valor maior que zero.');
            return;
        }
         if (!descricao) {
            mostrarFeedbackErro('A descrição não pode estar vazia.');
            return;
        }


        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        atualizarLista();
        salvarDados();
        vozInput.value = '';
        mostrarFeedbackSucesso('Item adicionado!');
        animarMoedas();
        // animarItemAdicionado(novoItem);  // Removido: a animação agora é feita em atualizarLista
    } else if (matchNatural) {
        const quantidade = parseNumber(matchNatural[1]);
        let descricao = matchNatural[2].trim().replace(/(kg|quilos?|unidades?|biscoitos?)$/, '').replace(/^de\s/, '').trim();
        const valorUnitario = parseFloat(matchNatural[4].replace(/\s/g, '').replace(',', '.')) || 0;

         if (!descricao) {
            mostrarFeedbackErro('A descrição não pode estar vazia.');
            return;
        }

        if (valorUnitario <= 0) {
            mostrarFeedbackErro('Valor unitário inválido. Insira um valor maior que zero.');
            return;
        }

        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        atualizarLista();
        salvarDados();
        vozInput.value = '';
        mostrarFeedbackSucesso('Item adicionado!');
        animarMoedas();
        // animarItemAdicionado(novoItem); // Removido: a animação agora é feita em atualizarLista

    } else {
        // Mensagem de erro mais detalhada
        mostrarFeedbackErro('Ditado não reconhecido. Tente: "quantidade 2 descrição biscoitos preço 2,35" ou "dois biscoitos por 2,35 cada".');
    }
}

// Funções auxiliares para feedback (evita repetição)
function mostrarFeedbackSucesso(mensagem) {
    vozFeedback.textContent = mensagem;
    vozFeedback.classList.add('success-fade');
    vozFeedback.classList.remove('error-fade'); // Garante que a classe de erro seja removida
    setTimeout(() => vozFeedback.classList.remove('success-fade'), 2000);
}

function mostrarFeedbackErro(mensagem) {
    vozFeedback.textContent = mensagem;
    vozFeedback.classList.add('error-fade');
    vozFeedback.classList.remove('success-fade'); // Garante que a classe de sucesso seja removida
    setTimeout(() => vozFeedback.classList.remove('error-fade'), 2000);
}

// Botão de microfone para ativar ditado
ativarVoz.addEventListener('click', () => {
    vozInput.focus();
     mostrarFeedbackSucesso('Fale agora...');
});

// Botão para inserir item
inserirItem.addEventListener('click', () => {
    if (vozInput.value.trim()) {
        processarEAdicionarItem(vozInput.value);
    } else {
        mostrarFeedbackErro('Digite ou dite algo primeiro!');
    }
});

// Botão para limpar o campo
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    mostrarFeedbackSucesso('Campo limpo!'); // Usa a função auxiliar

});

// Animação das moedas
function animarMoedas() {
    coins.forEach((coin, index) => {
        coin.style.opacity = 0;
        setTimeout(() => {
            coin.style.transition = 'opacity 0.5s';
            coin.style.opacity = 1;
        }, index * 200);
    });
}

// Atualizar lista de compras
function atualizarLista(filtrados = compras) {
    listaCompras.innerHTML = '';
    let total = 0;
    filtrados.forEach((item, index) => {
        const li = document.createElement('li');
        // Adiciona o botão de excluir
        li.innerHTML = `${item.quantidade}x ${item.descricao} - R$ ${item.valorUnitario.toFixed(2).replace('.', ',')} (${item.categoria}) 
            <button class="excluir-item" data-index="${index}">🗑️</button>`; // Usa o ícone de lixeira

        li.classList.add('fade-in');
        li.addEventListener('click', (event) => {
            // Verifica se o clique NÃO foi no botão de excluir
            if (!event.target.classList.contains('excluir-item')) {
                editarItem(index);
            }
        });
        listaCompras.appendChild(li);
        total += item.quantidade * item.valorUnitario;
        setTimeout(() => li.style.opacity = 1, 10); // Animação de fade-in

    });
    totalValorPainel.textContent = total.toFixed(2).replace('.', ',');
    totalValor.textContent = total.toFixed(2).replace('.', ',');
    verificarOrcamento(total);
}

// Event listener para o botão de excluir (usando delegação de eventos)
listaCompras.addEventListener('click', (event) => {
    if (event.target.classList.contains('excluir-item')) {
        const index = parseInt(event.target.dataset.index);
         if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
            compras.splice(index, 1);
            atualizarLista();
            salvarDados();
            animarMoedas(); // Anima as moedas após excluir
            mostrarFeedbackSucesso('Item excluído!');  // Feedback visual
        }
    }
});



// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    const orcamento = parseFloat(orcamentoInput.value.replace(',', '.')) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        porcentagem = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagem, 100); // Garante que não ultrapasse 100%
        barraProgresso.value = porcentagem;
        porcentagemProgresso.textContent = `${porcentagem.toFixed(1)}%`;

        // Muda a cor da barra dependendo da porcentagem
        if (porcentagem > 80) {
          barraProgresso.style.setProperty('--webkit-progress-value-background-color', 'orange', 'important');
        }
         if (porcentagem >= 100) {
           barraProgresso.style.setProperty('--webkit-progress-value-background-color', 'red', 'important');
        }
        if(porcentagem <= 80){
          barraProgresso.style.setProperty('--webkit-progress-value-background-color', '#4CAF50', 'important');
        }

    } else {
        barraProgresso.value = 0; // Zera a barra se não houver orçamento
        porcentagemProgresso.textContent = "0%";
        barraProgresso.style.setProperty('--webkit-progress-value-background-color', '#4CAF50', 'important');
    }

    if (total > orcamento && orcamento > 0) {
        // alert('Orçamento excedido! Total: R$ ' + total.toFixed(2).replace('.', ',')); // Removido o alert.
        document.querySelector('#painelTotal').style.backgroundColor = '#ffcccc';
        setTimeout(() => document.querySelector('#painelTotal').style.backgroundColor = '#f8f8f8', 2000);
    }
}


// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    localStorage.setItem('orcamento', orcamentoInput.value); // Salva o orçamento também

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
    editarValor.value = item.valorUnitario.toFixed(2).replace('.', ',');
    modalEdicao.style.display = 'block';
    modalEdicao.classList.add('slide-in');
}

// Salvar edição
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex !== null) {
        const novaDescricao = editarDescricao.value.trim();
        const novaQuantidade = parseInt(editarQuantidade.value) || 1;
        const novoValorUnitario = parseFloat(editarValor.value.replace(',', '.')) || 0;

        // Validações mais robustas
        if (!novaDescricao) {
            alert('A descrição não pode estar vazia.');
            return;
        }
        if (novaQuantidade <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }
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
        mostrarFeedbackSucesso('Item editado!');
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
     mostrarFeedbackSucesso('Dados exportados com sucesso!');
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
                mostrarFeedbackSucesso('Dados importados!');
            } catch (error) {
                mostrarFeedbackErro('Erro ao importar o arquivo JSON.');
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
         mostrarFeedbackSucesso('Lista limpa!');
    }
});

// Gerar relatório Excel
relatorioBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('Não há dados para gerar o relatório.');
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
    mostrarFeedbackSucesso('Relatório gerado!');
});

// Carregar dados ao iniciar e atualizar a barra de progresso
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarLista();
    animarMoedas();
      // Atualiza a barra de progresso ao carregar a página
    const total = parseFloat(totalValor.textContent.replace(',', '.')) || 0;
    verificarOrcamento(total);
});

// Atualiza a barra de progresso sempre que o orçamento for alterado
orcamentoInput.addEventListener('input', () => {
        const total = parseFloat(totalValor.textContent.replace(',', '.')) || 0;
        verificarOrcamento(total);
        salvarDados(); // Para salvar no local storage.
    });



// Função auxiliar para carregar dados e converter formato antigo
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

// Estilos dinâmicos para animações
vozFeedback.classList.add('fade-in');
