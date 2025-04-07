// Seleção de elementos do DOM (Adicionados novos e ajustados existentes)
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaCompras = document.querySelector('#listaCompras');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor'); // Mantido, mas painel é mais visível
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const fecharModalBtn = document.querySelector('#modalEdicao .fechar-modal'); // Mais específico
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade');
const editarValor = document.querySelector('#editarValor');
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const importarBtn = document.querySelector('#importar'); // Botão superior agora
const limparListaBtn = document.querySelector('#limparLista'); // Botão superior agora
const relatorioBtn = document.querySelector('#relatorio'); // Botão superior agora
const barraProgresso = document.getElementById('barraProgresso');
const porcentagemProgresso = document.getElementById('porcentagemProgresso');

// Novos seletores para painel de contagem
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');

// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para autocomplete (mantida)
const listaSugestoes = [
    "Água sanitária", "Detergente", "Vassoura", "Saco de lixo", "Sabão em pó", "Amaciante", "Esponja", "Papel toalha",
    "Arroz", "Feijão", "Macarrão", "Banana", "Tomate", "Biscoito", "Leite", "Queijo", "Manteiga", "Pão", "Café",
    "Açúcar", "Óleo de cozinha", "Farinha de trigo", "Ovos", "Carne bovina", "Frango", "Peixe", "Batata", "Cebola",
    "Alho", "Maçã", "Laranja", "Uva", "Morango", "Cenoura", "Beterraba", "Brócolis", "Espinafre", "Iogurte",
    "Refrigerante", "Suco", "Cerveja", "Vinho", "Sabonete", "Shampoo", "Desodorante", "Papel higiênico",
    "Escova de dente", "Creme dental", "Fio dental", "Absorvente", "Preservativo", "Pilhas", "Lâmpadas",
    "Fósforos", "Velas"
];

// --- Funções de Inicialização e Configuração ---

// Configurar autocomplete com Awesomplete
const awesompleteInstance = new Awesomplete(vozInput, {
    list: listaSugestoes,
    filter: function(text, input) {
        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
    },
    replace: function(text) {
        const before = this.input.value.match(/^.+,\s*|/)[0];
        this.input.value = before ? before + text + ", " : text; // Mantém lógica original
    },
    minChars: 1,
    maxItems: 7, // Limitar número de sugestões visíveis
    sort: false // Manter ordem original se preferir
});

// Traduzir mensagem do Awesomplete (Placeholder)
vozInput.addEventListener('focus', () => {
    if (!vozInput.placeholder) { // Evitar sobrescrever se já tiver algo
        vozInput.placeholder = 'Digite ou use o microfone...';
    }
});
// A mensagem "Digite X caracteres" é mais difícil de traduzir diretamente na biblioteca
// Poderia ser feito manipulando o DOM após a inicialização, mas pode ser frágil.

// --- Funções de Manipulação de Dados ---

// Função para inferir categoria automaticamente (Mantida)
function inferirCategoria(descricao) {
    const categorias = {
        Alimentos: ['arroz', 'feijão', 'macarrão', 'banana', 'tomate', 'biscoito', 'leite', 'queijo', 'manteiga', 'pão', 'bolo',
            'café', 'açúcar', 'óleo', 'farinha', 'ovos', 'carne', 'frango', 'peixe', 'batata', 'cebola', 'alho', 'verdura', 'legume',
            'maçã', 'laranja', 'uva', 'morango', 'cenoura', 'beterraba', 'brócolis', 'espinafre', 'iogurte', 'danone',
            'refrigerante', 'suco', 'cerveja', 'vinho', 'água mineral', 'chocolate', 'salgadinho'],
        Limpeza: ['água sanitária', 'candida', 'qboa', 'detergente', 'ype', 'limpol', 'vassoura', 'rodo', 'pano de chão', 'saco de lixo', 'sabão em pó', 'omo', 'ariel', 'sabão líquido', 'amaciante', 'downy', 'comfort', 'esponja', 'bombril',
            'papel toalha', 'limpador multiuso', 'veja', 'desinfetante', 'alcool'],
        'Higiene Pessoal': ['sabonete', 'lux', 'dove', 'shampoo', 'condicionador', 'pantene', 'seda', 'desodorante', 'rexona', 'nivea', 'papel higiênico', 'neve', 'personal', 'escova de dente', 'colgate', 'oral-b', 'creme dental', 'pasta de dente',
            'fio dental', 'absorvente', 'sempre livre', 'intimus', 'preservativo', 'jontex', 'fralda', 'lenço umedecido'],
        Outros: ['pilhas', 'duracell', 'lâmpadas', 'fósforos', 'velas', 'ração', 'areia para gato', 'carvão', 'guardanapo']
    };
    // Normaliza a descrição para busca
    const descricaoNorm = descricao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const [categoria, palavras] of Object.entries(categorias)) {
        if (palavras.some(palavra => {
            const palavraNorm = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            // Verifica se a palavra chave está contida na descrição (como palavra inteira ou parte)
             const regex = new RegExp(`\\b${palavraNorm}\\b`, 'i'); // Busca palavra inteira
            return regex.test(descricaoNorm) || descricaoNorm.includes(palavraNorm); // Ou contém a palavra
            })) {
            return categoria;
        }
    }
    return 'Outros'; // Categoria padrão
}

// Função auxiliar para converter números escritos/falados para numéricos
function parseNumber(texto) {
    if (!texto) return 1; // Retorna 1 se texto for vazio ou nulo
    texto = String(texto).toLowerCase().trim()
        .replace(/ vírgula | virgula /g, '.') // Troca 'vírgula' por ponto
        .replace(/ e /g, '') // Remove ' e ' comum em centavos
        .replace(/ reais| real/g, '') // Remove 'reais' ou 'real'
        .replace(/ centavos| centavo/g, '') // Remove 'centavos'
        .replace(',', '.'); // Troca vírgula por ponto (padrão pt-BR)

    const numerosEscritos = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
        'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10, 'onze': 11, 'doze': 12
        // Poderia adicionar mais números por extenso se necessário
    };

    if (numerosEscritos[texto] !== undefined) {
        return numerosEscritos[texto];
    }

    // Tenta converter diretamente para número, removendo caracteres não numéricos exceto ponto decimal
    const numeroLimpo = texto.replace(/[^0-9.]/g, '');
    const numero = parseFloat(numeroLimpo);

    return !isNaN(numero) && numero > 0 ? numero : (texto.match(/^\d/) ? 1 : 1); // Retorna o número parseado ou 1 como padrão
}


// Função para processar e adicionar item (Mantida a lógica principal, adicionando validação de duplicados opcional)
function processarEAdicionarItem(texto) {
    texto = texto.toLowerCase().trim();

    // Regex aprimorada para marcadores (mais flexível com espaços)
    const regexMarcadores = /^\s*quantidade\s+(.+?)\s+descri[cç][aã]o\s+(.+?)\s+pre[cç]o\s+([\d,\.\s]+?)(?:\s*(?:reais|real))?\s*$/i;
    const matchMarcadores = texto.match(regexMarcadores);

    // Regex para formato natural (ajustada para mais flexibilidade)
    const regexNatural = /^\s*(\d+|[a-zA-Zçãáéíóú]+(?:\s+[a-zA-Zçãáéíóú]+)?)\s+([\w\sÀ-ÿ]+?)\s+(?:por|a)\s+([\d,\.\s]+)(?:\s*(?:reais|real))?\s*$/i;
    const matchNatural = texto.match(regexNatural);

    let quantidade = 1; // Default
    let descricao = '';
    let valorUnitario = 0; // Default

    try { // Adicionado try...catch para robustez
        if (matchMarcadores) {
            quantidade = parseNumber(matchMarcadores[1]);
            descricao = matchMarcadores[2].trim();
            valorUnitario = parseNumber(matchMarcadores[3]); // Usar parseNumber para preço também
             console.log("Marcadores:", quantidade, descricao, valorUnitario);

        } else if (matchNatural) {
            quantidade = parseNumber(matchNatural[1]);
            // Pega tudo depois da quantidade até "por" ou "a" como descrição
             descricao = matchNatural[2].trim().replace(/(?:kg|quilos?|unidades?|biscoitos?|litros?|lata|pacote)$/i, '').trim(); // Remove unidades comuns do final
            valorUnitario = parseNumber(matchNatural[3]);
            console.log("Natural:", quantidade, descricao, valorUnitario);

        } else {
            // Se não houver marcadores nem formato natural, assume que é só a descrição
            descricao = texto;
            quantidade = 1;
            valorUnitario = 0; // Assume 0 se só a descrição for dada
            console.log("Só Descrição:", quantidade, descricao, valorUnitario);
            // Opcional: mostrar aviso que preço precisa ser preenchido manualmente
            // mostrarFeedbackErro('Item adicionado sem preço. Edite para inserir o valor.');
        }

        // VALIDAÇÕES
        if (!descricao) {
            mostrarFeedbackErro('A descrição não pode estar vazia.');
            return;
        }
        // A validação de valor > 0 foi removida daqui para permitir adicionar item sem preço
        // if (valorUnitario <= 0) {
        //     mostrarFeedbackErro('Valor unitário inválido. Insira um valor maior que zero.');
        //     return;
        // }

        // Verifica se item já existe (opcional, pode ser útil)
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
        if (itemExistenteIndex > -1) {
             if (confirm(`"${descricao}" já está na lista. Deseja atualizar a quantidade e o valor?`)) {
                 // Atualiza item existente
                 compras[itemExistenteIndex].quantidade += quantidade;
                 if (valorUnitario > 0) { // Atualiza valor só se um novo foi fornecido
                      compras[itemExistenteIndex].valorUnitario = valorUnitario;
                 }
                 // Mantém a categoria original ou re-infere se desejar
                 // compras[itemExistenteIndex].categoria = inferirCategoria(descricao);
             } else {
                 mostrarFeedbackErro("Adição cancelada.");
                 return; // Não adiciona se o usuário cancelar
             }
        } else {
             // Adiciona novo item
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
        }


        atualizarLista();
        salvarDados();
        vozInput.value = ''; // Limpa input após adicionar
        ocultarFeedback(); // Limpa feedback
        mostrarFeedbackSucesso('Item adicionado/atualizado!');

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro('Ocorreu um erro ao processar o item.');
    }
}

// Salvar dados no localStorage (Mantida)
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    // Formata orçamento com vírgula antes de salvar para consistência
    let orcamentoFormatado = orcamentoInput.value.replace('.', ',');
    localStorage.setItem('orcamento', orcamentoFormatado);
}

// Função auxiliar para carregar dados (Ajustada para formatar orçamento na carga)
function carregarDados() {
    const orcamentoSalvo = localStorage.getItem('orcamento');
    // Garante que o valor carregado use vírgula como separador decimal
    if (orcamentoSalvo) {
        orcamentoInput.value = orcamentoSalvo.replace('.', ',');
    }

    const comprasSalvas = JSON.parse(localStorage.getItem('compras')) || [];
    // Correção de formato antigo (se necessário) e garantia de tipos corretos
    compras = comprasSalvas.map(item => ({
        descricao: String(item.descricao || 'Sem descrição'),
        quantidade: Number(item.quantidade) || 1,
        valorUnitario: Number(item.valorUnitario) || Number(item.valor / item.quantidade) || 0, // Tenta valor antigo ou default 0
        categoria: String(item.categoria || inferirCategoria(item.descricao || ''))
    }));
    // Não salva dados aqui, apenas carrega. Salvar acontece após ações.
}

// --- Funções de Atualização da Interface (UI) ---

// Feedback visual (Funções auxiliares mantidas, adicionado ocultar)
function mostrarFeedback(mensagem, tipo = 'info') {
    vozFeedback.textContent = mensagem;
    vozFeedback.classList.remove('success-fade', 'error-fade'); // Limpa classes anteriores
    if (tipo === 'success') {
        vozFeedback.classList.add('success-fade');
    } else if (tipo === 'error') {
        vozFeedback.classList.add('error-fade');
    }
    // Para tipo 'info', não adiciona classe extra, usa estilo padrão
    vozFeedback.style.display = 'block';
    vozFeedback.style.opacity = '1';
    vozFeedback.classList.add('fade-in'); // Garante animação de entrada

    // Limpa feedback após um tempo
    setTimeout(ocultarFeedback, 3000); // Oculta após 3 segundos
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() {
    vozFeedback.style.opacity = '0';
    // Espera a transição de opacidade terminar antes de ocultar
    setTimeout(() => {
        if (vozFeedback.style.opacity === '0') { // Verifica se ainda está oculto
             vozFeedback.style.display = 'none';
             vozFeedback.classList.remove('fade-in', 'success-fade', 'error-fade');
        }
    }, 300); // Tempo da transição de opacidade
}


// Atualizar lista de compras (COM DESTAQUE e CONTAGEM)
function atualizarLista(filtrados = compras) {
    listaCompras.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;
    const nomesUnicos = new Set();

    const categoriaSelecionada = categoriaFiltro.value;
    const listaParaExibir = categoriaSelecionada
        ? compras.filter(item => item.categoria === categoriaSelecionada)
        : compras;

    // Ordenar: Itens com valor 0 primeiro, depois alfabeticamente
     listaParaExibir.sort((a, b) => {
         const aPendente = a.valorUnitario <= 0 ? -1 : 1;
         const bPendente = b.valorUnitario <= 0 ? -1 : 1;
         if (aPendente !== bPendente) {
             return aPendente - bPendente; // Itens pendentes (-1) vêm antes
         }
         // Se ambos pendentes ou ambos não pendentes, ordena por descrição
         return a.descricao.localeCompare(b.descricao);
     });


    listaParaExibir.forEach((item) => {
        // Encontra o índice original na lista 'compras' para edição/exclusão
        const originalIndex = compras.findIndex(originalItem => originalItem === item);

        const li = document.createElement('li');
        li.dataset.index = originalIndex; // Usar índice original

        // Adiciona classe para item pendente (valor 0)
        if (item.valorUnitario <= 0) {
            li.classList.add('item-pendente');
        }

        // Adiciona botão de excluir com classe condicional para cor do ícone
        let buttonClass = "excluir-item";
        if (item.valorUnitario <= 0) {
            buttonClass += " sem-valor";
        }

        li.innerHTML = `
            <span class="item-info"> <!-- Agrupa informações do item -->
                <span class="item-qtd">${item.quantidade}x</span>
                <span class="item-desc">${item.descricao}</span>
                <span class="item-preco">${item.valorUnitario > 0 ? `- R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                <span class="item-cat">(${item.categoria})</span>
            </span>
            <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                 <i class="fas fa-trash-alt"></i> <!-- Ícone Font Awesome -->
            </button>
        `;

        // Adiciona fade-in
        li.style.opacity = 0; // Começa invisível para animação
        listaCompras.appendChild(li);
        // Força reflow para garantir que a opacidade 0 seja aplicada antes da transição
        void li.offsetWidth;
        li.style.opacity = 1;
        li.classList.add('fade-in'); // Adiciona classe para referência se necessário

        // Calcula totais (considerando todos os itens, não apenas filtrados)
        // totalGeral += item.quantidade * item.valorUnitario;
        // totalUnidades += item.quantidade;
        // nomesUnicos.add(item.descricao.toLowerCase().trim());

        // Adiciona evento de clique para edição (exceto no botão de excluir)
        li.addEventListener('click', (event) => {
            // Verifica se o clique foi no próprio LI ou em um span dentro dele, mas NÃO no botão
             if (!event.target.closest('.excluir-item')) {
                 editarItem(originalIndex);
             }
        });
    });

     // Calcula totais GERAIS (fora do loop para incluir todos os itens)
     totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
     totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
     const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;


    // Atualiza painéis de total e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza o oculto também
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral); // Atualiza a barra de progresso
}


// Verificar orçamento e atualizar barra de progresso (COM GRADIENTE e CORES DE ALERTA OPCIONAIS)
function verificarOrcamento(total) {
    const orcamentoStr = orcamentoInput.value.replace(',', '.'); // Usa vírgula como separador
    const orcamento = parseFloat(orcamentoStr) || 0;
    let porcentagem = 0;
    let estadoProgresso = 'normal'; // Estados: normal, warning, danger

    // Limpa formatação de alerta do painel total
     document.querySelector('#painelTotal').style.backgroundColor = ''; // Volta ao padrão do CSS


    if (orcamento > 0) {
        porcentagem = (total / orcamento) * 100;
        // Não limita a porcentagem a 100% no cálculo, mas limita o valor da barra
        const valorBarra = Math.min(porcentagem, 100);
        barraProgresso.value = valorBarra;
        porcentagemProgresso.textContent = `${porcentagem.toFixed(1)}%`;

        // Define o estado para estilização condicional (opcional, se quiser cores sólidas em vez de gradiente)
        if (porcentagem >= 100) {
            estadoProgresso = 'danger';
            // Alerta visual no painel total
             document.querySelector('#painelTotal').style.backgroundColor = '#f8d7da'; // Vermelho claro
        } else if (porcentagem > 80) {
            estadoProgresso = 'warning';
             document.querySelector('#painelTotal').style.backgroundColor = '#fff3cd'; // Amarelo claro
        } else {
             estadoProgresso = 'normal';
        }

        // Adiciona atributo de dados para CSS (se for usar cores sólidas condicionais)
        // barraProgresso.setAttribute('data-progress-state', estadoProgresso);

    } else {
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = "0%";
        // barraProgresso.setAttribute('data-progress-state', 'normal');
    }

    // O gradiente é aplicado via CSS por padrão. As classes/atributos acima
    // só seriam necessárias se você quisesse *substituir* o gradiente
    // por cores sólidas (laranja, vermelho) em certos limites.
    // A implementação atual mantém o gradiente verde-dourado sempre.
}


// --- Funções de Edição e Modal ---

// Abrir modal de edição
function editarItem(index) {
    // Verifica se o índice é válido
     if (index < 0 || index >= compras.length) {
         console.error("Índice de item inválido para edição:", index);
         mostrarFeedbackErro("Não foi possível encontrar o item para editar.");
         return;
     }

    itemEditandoIndex = index;
    const item = compras[index];
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata o valor com vírgula para exibição no input tipo 'text'
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';
    editarValor.placeholder = '0,00'; // Garante placeholder

    modalEdicao.style.display = 'block';
    // Adiciona pequena espera para garantir que display:block foi aplicado antes da animação
    setTimeout(() => modalEdicao.classList.add('slide-in'), 10);

    // Adiciona listeners aos botões de microfone do modal dinamicamente
    const micBtns = modalEdicao.querySelectorAll('.modal-mic-btn');
    micBtns.forEach(btn => {
        // Remove listener antigo para evitar duplicação se o modal for reaberto
        btn.onclick = null;
        btn.onclick = () => editarCampoComVoz(btn.dataset.target); // Usa data-target para saber qual campo
    });
}

// Fechar modal
function fecharModalEdicao() {
    modalEdicao.classList.remove('slide-in');
    // Espera a animação de saída terminar antes de ocultar
    setTimeout(() => {
         modalEdicao.style.display = 'none';
         itemEditandoIndex = null; // Limpa índice ao fechar
    }, 300); // Tempo da animação CSS (slideIn)
}

// Formatar valor em tempo real no input de edição de valor (Mantido)
editarValor.addEventListener('input', function() {
    let valor = this.value;
    // Permite apenas números e uma vírgula
    valor = valor.replace(/[^0-9,]/g, '');
    // Remove vírgulas extras, mantendo apenas a primeira encontrada
    const partes = valor.split(',');
    if (partes.length > 1) {
        valor = partes[0] + ',' + partes.slice(1).join('');
    }
    // Limita a duas casas decimais após a vírgula
    if (valor.includes(',')) {
        const decimalPart = valor.split(',')[1];
        if (decimalPart && decimalPart.length > 2) {
            valor = valor.substring(0, valor.indexOf(',') + 3);
        }
    }
    this.value = valor;
});


// Salvar edição (Validações Aprimoradas)
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex === null || itemEditandoIndex >= compras.length) {
        mostrarFeedbackErro("Erro: Nenhum item selecionado para salvar.");
        return; // Sai se não houver item válido sendo editado
    }

    const novaDescricao = editarDescricao.value.trim();
    const novaQuantidade = parseInt(editarQuantidade.value) || 0; // Default 0 para validação
    // Converte valor para número, tratando vírgula e possíveis erros
    const novoValorUnitarioStr = editarValor.value.replace(',', '.');
    const novoValorUnitario = parseFloat(novoValorUnitarioStr) || 0; // Default 0 se inválido

    // Validações
    if (!novaDescricao) {
        alert('A descrição não pode estar vazia.');
        editarDescricao.focus();
        return;
    }
    if (novaQuantidade <= 0) {
        alert('A quantidade deve ser um número maior que zero.');
        editarQuantidade.focus();
        return;
    }
    // Permite salvar com valor 0, mas pode adicionar um aviso se quiser
    if (novoValorUnitario < 0) { // Não permite valor negativo
         alert('O valor unitário não pode ser negativo.');
         editarValor.focus();
         return;
     }

    const novaCategoria = inferirCategoria(novaDescricao);

    // Atualiza o item na lista 'compras'
    compras[itemEditandoIndex] = {
        descricao: novaDescricao,
        quantidade: novaQuantidade,
        valorUnitario: novoValorUnitario,
        categoria: novaCategoria
    };

    fecharModalEdicao();
    atualizarLista(); // Atualiza a lista principal
    salvarDados();
    mostrarFeedbackSucesso('Item editado com sucesso!');
});

// --- Funções de Reconhecimento de Voz ---

// Função genérica para ativar reconhecimento de voz em um input
function ativarVozParaInput(inputId) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;

    inputElement.focus(); // Foca no campo

    // Verifica suporte da API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        mostrarFeedbackErro('Reconhecimento de voz não é suportado neste navegador.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false; // Para após a primeira fala
    recognition.interimResults = false; // Apenas resultados finais

    let feedbackTimeout; // Para limpar timeouts anteriores

    recognition.onstart = () => {
        clearTimeout(feedbackTimeout); // Limpa timeout anterior
        mostrarFeedback('Fale agora...', 'info');
        // Adiciona um indicador visual, como mudar a cor do botão de microfone (opcional)
        const micButton = inputElement.closest('.input-group, .voice-input-wrapper').querySelector('.mic-btn');
        if (micButton) micButton.style.backgroundColor = 'red'; // Indica gravação
    };

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;

        // Se for o input principal, tenta processar como comando completo
        if (inputId === 'vozInput') {
            inputElement.value = result; // Preenche o campo com o texto falado
            processarEAdicionarItem(result); // Tenta adicionar o item
        } else {
             // Para outros inputs (modal), apenas preenche o campo
             // Se for campo numérico, tenta limpar
             if (inputId === 'editarValor' || inputId === 'editarQuantidade') {
                 const numeroLimpo = parseNumber(result); // Usa a função parseNumber para limpar
                 // Se for valor, formata com vírgula
                 if (inputId === 'editarValor') {
                     inputElement.value = numeroLimpo > 0 ? numeroLimpo.toFixed(2).replace('.', ',') : '';
                 } else {
                     inputElement.value = numeroLimpo; // Para quantidade, usa o número direto
                 }
                 mostrarFeedbackSucesso(`${inputId.replace('editar', '')} alterado para: ${inputElement.value || numeroLimpo}`);
             } else {
                 // Para descrição, usa o texto como está
                 inputElement.value = result;
                 mostrarFeedbackSucesso(`${inputId.replace('editar', '')} alterado para: ${result}`);
             }
             // Dispara evento input para formatação em tempo real (se houver)
              inputElement.dispatchEvent(new Event('input'));
        }

    };

    recognition.onerror = (event) => {
        clearTimeout(feedbackTimeout);
        let errorMsg = 'Erro no reconhecimento de voz.';
        if (event.error === 'no-speech') {
            errorMsg = 'Nenhuma fala detectada. Tente novamente.';
        } else if (event.error === 'audio-capture') {
            errorMsg = 'Erro na captura de áudio. Verifique o microfone.';
        } else if (event.error === 'not-allowed') {
            errorMsg = 'Permissão para usar o microfone negada.';
        }
        mostrarFeedbackErro(errorMsg);
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
        // Volta a cor do botão ao normal
        const micButton = inputElement.closest('.input-group, .voice-input-wrapper, .input-with-mic').querySelector('.mic-btn');
         if (micButton) micButton.style.backgroundColor = ''; // Volta ao padrão

        // Limpa feedback após um tempo, a menos que um novo feedback já tenha sido mostrado
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            if (!vozFeedback.classList.contains('success-fade') && !vozFeedback.classList.contains('error-fade')) {
                 ocultarFeedback();
            }
        }, 1500); // Tempo para limpar o "Fale agora..." se nada mais acontecer
    };

    try {
        recognition.start();
    } catch (e) {
        mostrarFeedbackErro('Não foi possível iniciar o reconhecimento de voz.');
        console.error('Error starting speech recognition:', e);
    }
}

// Função específica para editar campo com voz no modal (agora chama a genérica)
function editarCampoComVoz(campoId) {
    ativarVozParaInput(campoId);
}

// --- Funções de Importação/Exportação/Limpeza ---

// Importar dados de XLSX (com validação e feedback melhorados)
function importarDadosXLSX(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                throw new Error("Planilha vazia ou sem nome.");
            }
            const worksheet = workbook.Sheets[sheetName];
            const excelData = XLSX.utils.sheet_to_json(worksheet, {
                 header: ["Descrição", "Quantidade", "Valor Unitário (R$)", "Categoria"], // Define cabeçalhos esperados
                 range: 1 // Ignora a primeira linha (cabeçalho do modelo)
             });

            if (!excelData || excelData.length === 0) {
                 throw new Error("Nenhum dado encontrado na planilha (verifique se os dados começam na segunda linha).");
             }

            // Mapear e validar os dados da planilha
            const novosItens = excelData.map((row, rowIndex) => {
                const descricao = String(row['Descrição'] || '').trim();
                // Usa parseNumber para quantidade e valor para maior robustez
                const quantidade = parseNumber(row['Quantidade'] || 1); // Default 1
                const valorUnitario = parseNumber(row['Valor Unitário (R$)'] || 0); // Default 0
                const categoria = String(row['Categoria'] || '').trim() || inferirCategoria(descricao); // Usa categoria ou infere

                // Validação básica por linha
                if (!descricao) {
                    console.warn(`Linha ${rowIndex + 2}: Descrição vazia ignorada.`);
                    return null; // Ignora linha sem descrição
                }
                if (quantidade <= 0) {
                     console.warn(`Linha ${rowIndex + 2} (${descricao}): Quantidade inválida (${row['Quantidade']}), usando 1.`);
                    // quantidade = 1; // Já tratado no parseNumber
                 }
                 if (valorUnitario < 0) {
                      console.warn(`Linha ${rowIndex + 2} (${descricao}): Valor unitário negativo (${row['Valor Unitário (R$)']}), usando 0.`);
                     // valorUnitario = 0; // Já tratado no parseNumber
                  }


                return { descricao, quantidade, valorUnitario, categoria };
            }).filter(item => item !== null); // Remove itens nulos (ignorados)

            if (novosItens.length === 0) {
                throw new Error("Nenhum item válido encontrado para importar.");
            }

            // Decide se substitui ou adiciona à lista existente
             if (compras.length > 0 && !confirm("A lista atual não está vazia. Deseja substituir os itens existentes pelos importados?")) {
                 // Adiciona à lista existente (mesclando se necessário)
                 novosItens.forEach(novoItem => {
                     const existenteIndex = compras.findIndex(compra => compra.descricao.toLowerCase() === novoItem.descricao.toLowerCase());
                     if (existenteIndex > -1) {
                         compras[existenteIndex].quantidade += novoItem.quantidade;
                         if (novoItem.valorUnitario > 0) { // Atualiza valor se fornecido
                             compras[existenteIndex].valorUnitario = novoItem.valorUnitario;
                         }
                     } else {
                         compras.push(novoItem);
                     }
                 });
                 mostrarFeedbackSucesso(`${novosItens.length} itens adicionados/atualizados na lista!`);
             } else {
                 // Substitui a lista
                 compras = novosItens;
                 mostrarFeedbackSucesso(`${novosItens.length} itens importados com sucesso!`);
             }

            atualizarLista();
            salvarDados();

        } catch (error) {
            console.error("Erro ao importar XLSX:", error);
            mostrarFeedbackErro(`Erro ao importar: ${error.message}`);
        } finally {
            // Limpa o input de arquivo para permitir importar o mesmo arquivo novamente
            const fileInput = document.getElementById('hiddenFileInput');
             if (fileInput) fileInput.value = '';
        }
    };
    reader.onerror = () => {
        mostrarFeedbackErro('Erro ao ler o arquivo selecionado.');
    };
    reader.readAsBinaryString(file);
}


// Gerar relatório Excel (Mantida a lógica, nome de arquivo ajustado)
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro('Lista vazia. Adicione itens antes de gerar o relatório.');
        return;
    }
    try { // Adicionado try...catch
        const wb = XLSX.utils.book_new();
        const wsName = "ListaDeCompras";

        // Preparar dados com cabeçalhos claros e total
        const wsData = [
            ["Descrição", "Quantidade", "Valor Unitário (R$)", "Valor Total (R$)", "Categoria"], // Cabeçalhos
            ...compras.map(item => [
                item.descricao,
                item.quantidade,
                item.valorUnitario.toFixed(2).replace('.', ','), // Formato moeda BR
                (item.quantidade * item.valorUnitario).toFixed(2).replace('.', ','), // Calcula total do item
                item.categoria
            ]),
             [], // Linha em branco
             ["", "", "TOTAL GERAL:", totalValorPainel.textContent, ""] // Adiciona total geral
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Definir largura das colunas (opcional, mas melhora visualização)
        ws['!cols'] = [
            { wch: 30 }, // Descrição
            { wch: 10 }, // Quantidade
            { wch: 18 }, // Valor Unitário
            { wch: 18 }, // Valor Total
            { wch: 15 }  // Categoria
        ];


        XLSX.utils.book_append_sheet(wb, ws, wsName);

        const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const nomeArquivo = `Compras_${dataAtual}.xlsx`;

        // Gera e baixa o arquivo
        XLSX.writeFile(wb, nomeArquivo);

        mostrarFeedbackSucesso('Relatório Excel gerado!');

    } catch (error) {
        console.error("Erro ao gerar relatório Excel:", error);
        mostrarFeedbackErro("Ocorreu um erro ao gerar o relatório.");
    }
}


// --- Event Listeners ---

// Input principal (digitação e autocomplete)
vozInput.addEventListener('input', () => {
    // Feedback visual enquanto digita (opcional)
    // vozFeedback.textContent = vozInput.value || '';
    // vozFeedback.style.display = vozInput.value ? 'block' : 'none';
    // vozFeedback.style.opacity = vozInput.value ? '1' : '0';
    // vozFeedback.classList.toggle('fade-in', !!vozInput.value);
});
vozInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (vozInput.value.trim()) {
            processarEAdicionarItem(vozInput.value);
             awesompleteInstance.close(); // Fecha sugestões após Enter
        } else {
            mostrarFeedbackErro('Digite ou dite algo primeiro!');
        }
    }
});

// Botão de microfone (input principal)
ativarVoz.addEventListener('click', () => {
    ativarVozParaInput('vozInput');
});

// Botão para inserir item (input principal)
inserirItem.addEventListener('click', () => {
    if (vozInput.value.trim()) {
        processarEAdicionarItem(vozInput.value);
    } else {
        mostrarFeedbackErro('Digite ou dite algo primeiro!');
        vozInput.focus();
    }
});

// Botão para limpar o campo de input principal
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    ocultarFeedback();
    vozInput.focus();
    awesompleteInstance.close(); // Fecha sugestões ao limpar
});

// Delegação de eventos para botões de excluir na lista
listaCompras.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        const index = parseInt(li.dataset.index);
         if (!isNaN(index) && index >= 0 && index < compras.length) {
             if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                 const itemRemovido = compras.splice(index, 1)[0]; // Remove e pega o item
                 // Animação de remoção (opcional)
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-20px)';
                 setTimeout(() => {
                      atualizarLista(); // Atualiza a lista DEPOIS da animação
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemRemovido.descricao}" excluído!`);
                 }, 300); // Tempo da animação
             }
         } else {
             console.error("Índice inválido ou item não encontrado para exclusão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item.");
              // Força atualização da lista para corrigir possíveis inconsistências de índice
              atualizarLista();
         }
    }
});


// Filtro por categoria
categoriaFiltro.addEventListener('change', () => {
    atualizarLista(); // A função já lê o valor do filtro
});

// Orçamento Input (atualiza barra e salva)
orcamentoInput.addEventListener('input', () => {
    // Formatação em tempo real (opcional, mas útil)
    let valor = orcamentoInput.value;
    valor = valor.replace(/[^0-9,]/g, '');
    const partes = valor.split(',');
    if (partes.length > 1) {
        valor = partes[0] + ',' + partes.slice(1).join('');
        if (valor.split(',')[1].length > 2) {
             valor = valor.substring(0, valor.indexOf(',') + 3);
         }
    }
     orcamentoInput.value = valor; // Atualiza o campo com valor formatado


    // Recalcula o total para garantir que a barra use o valor correto
    const total = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    verificarOrcamento(total);
    salvarDados(); // Salva o orçamento formatado a cada alteração
});

// Botões de ação superiores
importarBtn.addEventListener('click', () => {
    // Mostra o modal de aviso de importação
    const modalImportInfo = document.getElementById('modalImportInfo');
    modalImportInfo.style.display = 'block';

    // Botão Continuar dentro do modal de importação
    const continuarImport = document.getElementById('continuarImport');
    continuarImport.onclick = () => {
        modalImportInfo.style.display = 'none'; // Fecha o modal de info

        // Cria um input de arquivo oculto dinamicamente
         let fileInput = document.getElementById('hiddenFileInput');
         if (!fileInput) {
             fileInput = document.createElement('input');
             fileInput.type = 'file';
             fileInput.accept = '.xlsx';
             fileInput.style.display = 'none'; // Mantém oculto
             fileInput.id = 'hiddenFileInput';
             document.body.appendChild(fileInput); // Adiciona ao corpo

             fileInput.onchange = (e) => {
                 const file = e.target.files[0];
                 if (file) {
                     importarDadosXLSX(file);
                 } else {
                     mostrarFeedbackErro("Nenhum arquivo selecionado.");
                 }
             };
         }
         fileInput.click(); // Abre a janela de seleção de arquivo
    };

    // Fecha o modal de info ao clicar no "×"
    const fecharModalImport = modalImportInfo.querySelector('.fechar-modal');
    fecharModalImport.onclick = () => {
        modalImportInfo.style.display = 'none';
    };
});

limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
         mostrarFeedbackErro('A lista já está vazia.');
         return;
     }
    if (confirm('Tem certeza que deseja limpar TODOS os itens da lista? Esta ação não pode ser desfeita.')) {
        compras = [];
        atualizarLista();
        salvarDados();
        mostrarFeedbackSucesso('Lista de compras limpa!');
        orcamentoInput.value = ''; // Opcional: Limpar orçamento também
        localStorage.removeItem('orcamento'); // Remove do localStorage
         verificarOrcamento(0); // Reseta a barra
    }
});

relatorioBtn.addEventListener('click', gerarRelatorioExcel);


// Modal de Edição (Fechar)
fecharModalBtn.addEventListener('click', fecharModalEdicao);
window.addEventListener('click', (event) => {
    if (event.target === modalEdicao) {
        fecharModalEdicao();
    }
});
// Fechar modal com tecla Esc
window.addEventListener('keydown', (event) => {
     if (event.key === 'Escape' && modalEdicao.style.display === 'block') {
         fecharModalEdicao();
     }
 });


// --- Inicialização ---

// Carregar dados ao iniciar e atualizar a UI
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega dados do localStorage
    atualizarLista(); // Exibe a lista e calcula totais/contagens
    // A barra de progresso é atualizada dentro de atualizarLista() via verificarOrcamento()
});
