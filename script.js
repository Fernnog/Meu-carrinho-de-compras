// =============================================================================
// =                         MINHAS COMPRAS DE MERCADO                         =
// =============================================================================
// Arquivo: script.js
// Descrição: Lógica principal da aplicação de lista de compras.
// =============================================================================

// --- Seleção de Elementos do DOM ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaComprasUL = document.querySelector('#listaCompras');
const listaComprasContainer = document.querySelector('#listaComprasContainer');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor'); // Total oculto (referência antiga, pode remover se não usar)
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const fecharModalBtn = document.querySelector('#modalEdicao .fechar-modal');
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade');
const editarValor = document.querySelector('#editarValor');
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const importarBtn = document.querySelector('#importar');
const limparListaBtn = document.querySelector('#limparLista');
const relatorioBtn = document.querySelector('#relatorio');
const barraProgresso = document.getElementById('barraProgresso');
const porcentagemProgresso = document.getElementById('porcentagemProgresso');
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');
const voiceInputContainer = document.querySelector('.voice-input'); // Container para scroll

// --- Variáveis Globais ---
let compras = []; // Array principal da lista de compras
let itemEditandoIndex = null; // Índice do item sendo editado no modal
let feedbackTimeout; // Para controlar o timeout do feedback visual

// Lista de sugestões para Autocomplete (pode ser expandida)
const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Sal", "Açúcar", "Café", "Leite", "Pão", "Manteiga", "Queijo", "Presunto",
    "Frango", "Carne Bovina", "Peixe", "Ovos", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Alface", "Maçã", "Banana", "Laranja",
    "Sabão em pó", "Detergente", "Amaciante", "Água sanitária", "Limpador Multiuso", "Desinfetante", "Esponja", "Saco de lixo",
    "Shampoo", "Condicionador", "Sabonete", "Pasta de dente", "Escova de dente", "Papel higiênico",
    "Biscoito", "Bolacha", "Refrigerante", "Suco", "Cerveja", "Vinho", "Iogurte", "Chocolate"
];
// Ordem desejada para exibição das categorias
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// Instância do Awesomplete para autocomplete
const awesompleteInstance = new Awesomplete(vozInput, { list: listaSugestoes, minChars: 1 });

// --- Funções Auxiliares ---

/**
 * Inferir a categoria de um item com base na descrição.
 * @param {string} descricao - A descrição do item.
 * @returns {string} A categoria inferida ('Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros').
 */
function inferirCategoria(descricao) {
    const descLower = descricao.toLowerCase().trim();
    // Palavras-chave para categorias (expansível)
    const alimentosKeys = ['arroz', 'feijão', 'macarrão', 'óleo', 'sal', 'açúcar', 'café', 'leite', 'pão', 'manteiga', 'queijo', 'presunto', 'frango', 'carne', 'peixe', 'ovos', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'alface', 'maçã', 'banana', 'laranja', 'iogurte', 'biscoito', 'bolacha', 'chocolate', 'refrigerante', 'suco', 'cerveja', 'vinho', 'legume', 'verdura', 'fruta', 'cereal', 'farinha', 'massa', 'pimenta', 'ovo', 'trigo', 'milho', 'atum', 'sardinha'];
    const limpezaKeys = ['sabão', 'detergente', 'amaciante', 'água sanitária', 'multiuso', 'desinfetante', 'esponja', 'saco de lixo', 'limpador', 'limpa vidro', 'lustra móveis', 'pano', 'vassoura', 'rodo', 'alvejante'];
    const higieneKeys = ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova de dente', 'papel higiênico', 'fio dental', 'absorvente', 'desodorante', 'barbeador', 'cotonete', 'lenço', 'fralda', 'protetor solar'];

    if (alimentosKeys.some(key => descLower.includes(key))) return 'Alimentos';
    if (limpezaKeys.some(key => descLower.includes(key))) return 'Limpeza';
    if (higieneKeys.some(key => descLower.includes(key))) return 'Higiene Pessoal';
    return 'Outros';
}

/**
 * Converte um texto formatado como moeda (com R$, . ou ,) para um número float.
 * @param {string} texto - O texto a ser convertido.
 * @returns {number} O valor numérico correspondente (0 se inválido).
 */
function parseNumber(texto) {
    if (!texto || typeof texto !== 'string') return 0;
    // Remove "R$", pontos de milhar, substitui vírgula por ponto
    const numeroLimpo = texto.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim();
    const numero = parseFloat(numeroLimpo);
    return isNaN(numero) ? 0 : numero;
}

/**
 * Rola a página suavemente para a seção de entrada de itens.
 */
function scrollParaInputPrincipal() {
    if (voiceInputContainer) {
        voiceInputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Opcional: focar no input após o scroll (pode ser irritante em mobile)
        // setTimeout(() => vozInput.focus(), 350); // Delay para esperar scroll
    }
}


// --- Funções de Manipulação de Dados (Core Logic) ---

/**
 * Processa o texto de entrada (digitado ou ditado) e adiciona/atualiza um item na lista.
 * Prioriza o formato "quantidade X descrição Y preço Z".
 * @param {string} texto - O texto a ser processado.
 */
function processarEAdicionarItem(texto) {
    texto = texto.trim();
    if (!texto) return;

    ocultarFeedback();
    console.log("[processarEAdicionarItem] Processando texto:", texto); // Log para depuração

    let quantidade = 1;
    let descricao = '';
    let valorUnitario = 0;
    let match = null;

    // --- Prioridade 1: Formato "quantidade X descrição Y preço Z" ---
    match = texto.match(/^(?:quantidade|qtd)\s*([\d.,]+)\s+(?:descrição|desc)\s+(.+?)(?:\s+(?:preço|preco)\s+([\d.,]+))?$/i);
    if (match) {
        console.log("[processarEAdicionarItem] Match formato QTD DESC PRECO:", match);
        quantidade = parseInt(match[1].replace(/[.,]/g, ''), 10);
        descricao = match[2].trim();
        valorUnitario = match[3] ? parseNumber(match[3]) : 0;
    } else {
        // --- Prioridade 2: Formato "descrição Y quantidade X preço Z" ---
        match = texto.match(/^(?:descrição|desc)\s+(.+?)\s+(?:quantidade|qtd)\s*([\d.,]+)(?:\s+(?:preço|preco)\s+([\d.,]+))?$/i);
        if (match) {
            console.log("[processarEAdicionarItem] Match formato DESC QTD PRECO:", match);
            descricao = match[1].trim();
            quantidade = parseInt(match[2].replace(/[.,]/g, ''), 10);
            valorUnitario = match[3] ? parseNumber(match[3]) : 0;
        } else {
             // --- Prioridade 3: Formato "descrição Y preço Z quantidade X" ---
             match = texto.match(/^(?:descrição|desc)\s+(.+?)\s+(?:preço|preco)\s+([\d.,]+)\s+(?:quantidade|qtd)\s*([\d.,]+)?$/i);
             if (match) {
                 console.log("[processarEAdicionarItem] Match formato DESC PRECO QTD:", match);
                 descricao = match[1].trim();
                 valorUnitario = parseNumber(match[2]);
                 quantidade = match[3] ? parseInt(match[3].replace(/[.,]/g, ''), 10) : 1;
             } else {
                // --- Fallback: Tentativa genérica ---
                console.log("[processarEAdicionarItem] Nenhum formato específico encontrado, tentando fallback genérico...");
                const partes = texto.split(/\s+/);
                const numerosTexto = partes.filter(p => /[\d.,]/.test(p) && !/^\D+$/.test(p.replace(/[.,]/g, '')));
                const palavras = partes.filter(p => !/[\d.,]/.test(p) || /^\D+$/.test(p.replace(/[.,]/g, '')));
                descricao = palavras.join(' ').trim();

                if (numerosTexto.length === 1) {
                    const num = parseNumber(numerosTexto[0]);
                    if (numerosTexto[0].includes(',') || numerosTexto[0].includes('.')) valorUnitario = num;
                    else if (Number.isInteger(num) && num > 0 && num <= 15) quantidade = num;
                    else if (num > 0) valorUnitario = num;
                    if (!descricao && numerosTexto.length > 0) { descricao = numerosTexto.join(' '); quantidade = 1; valorUnitario = 0; }
                } else if (numerosTexto.length >= 2) {
                    quantidade = parseInt(numerosTexto[0].replace(/[.,]/g, ''), 10) || 1;
                    valorUnitario = parseNumber(numerosTexto[numerosTexto.length - 1]);
                    if (!descricao && partes.length > 0) { descricao = partes.join(' '); quantidade = 1; valorUnitario = 0; }
                } else {
                    if (!descricao && texto) descricao = texto;
                }
                console.log("[processarEAdicionarItem] Fallback - Qtd:", quantidade, "Desc:", descricao, "Preço:", valorUnitario);
            }
        }
    }

    // Limpeza final da descrição
    descricao = descricao.replace(/^(quantidade|qtd|descrição|desc|preço|preco)\s+/i, '').trim();
    descricao = descricao.replace(/\s+(quantidade|qtd|descrição|desc|preço|preco)$/i, '').trim();

    // Validações Finais
    quantidade = isNaN(quantidade) || quantidade <= 0 ? 1 : quantidade;
    valorUnitario = isNaN(valorUnitario) || valorUnitario < 0 ? 0 : valorUnitario;

    if (!descricao) {
        mostrarFeedbackErro('Não foi possível identificar a descrição do item.');
        console.error("[processarEAdicionarItem] Erro de Parsing: Descrição final vazia para input:", texto);
        return;
    }

    console.log("[processarEAdicionarItem] Final - Qtd:", quantidade, "Desc:", descricao, "Preço:", valorUnitario.toFixed(2));

    // --- Lógica de Adicionar ou Atualizar ---
    const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
    if (itemExistenteIndex > -1) {
        // Atualizar item existente (com confirmação)
        const itemExistente = compras[itemExistenteIndex];
        if (confirm(`"${descricao}" já está na lista. Deseja ATUALIZAR a quantidade para ${itemExistente.quantidade + quantidade} e o valor unitário para R$ ${valorUnitario > 0 ? valorUnitario.toFixed(2).replace('.', ',') : '0,00'}?`)) {
             itemExistente.quantidade += quantidade;
             // Atualiza valor se o novo for > 0 OU se o valor antigo era 0 (para poder definir um preço depois)
             if (valorUnitario > 0 || itemExistente.valorUnitario <= 0) {
                  itemExistente.valorUnitario = valorUnitario;
             }
             // Re-inferir categoria se descrição mudar significativamente? Opcional.
             // itemExistente.categoria = inferirCategoria(descricao);
             mostrarFeedbackSucesso(`Item "${descricao}" atualizado!`);
        } else {
            mostrarFeedbackInfo("Atualização cancelada.");
            vozInput.focus();
            return; // Não faz mais nada se cancelado
        }
    } else {
        // Adicionar novo item
        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        mostrarFeedbackSucesso(`Item "${descricao}" adicionado!`);
    }

    atualizarLista(); // Atualiza a exibição da lista
    salvarDados(); // Salva no localStorage
    vozInput.value = ''; // Limpa o campo de entrada
    awesompleteInstance.close(); // Fecha sugestões do Awesomplete
}

/**
 * Salva a lista de compras e o orçamento no localStorage.
 */
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    const orcamentoValor = parseNumber(orcamentoInput.value);
    if (orcamentoValor > 0) {
        localStorage.setItem('orcamento', orcamentoValor.toFixed(2));
    } else {
        localStorage.removeItem('orcamento');
    }
    console.log("[salvarDados] Dados salvos no localStorage.");
}

/**
 * Carrega a lista de compras e o orçamento do localStorage.
 */
function carregarDados() {
    compras = JSON.parse(localStorage.getItem('compras')) || [];
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (orcamentoSalvo) {
        orcamentoInput.value = parseFloat(orcamentoSalvo).toFixed(2).replace('.', ',');
    } else {
        orcamentoInput.value = ''; // Garante que campo esteja vazio se não houver orçamento salvo
    }
    console.log("[carregarDados] Dados carregados do localStorage:", { numItens: compras.length, orcamento: orcamentoSalvo });
}

// --- Funções de Atualização da Interface (UI) ---

/**
 * Mostra uma mensagem de feedback visual para o usuário.
 * @param {string} mensagem - A mensagem a ser exibida.
 * @param {string} [tipo='info'] - O tipo de feedback ('success', 'error', 'info').
 */
function mostrarFeedback(mensagem, tipo = 'info') {
    clearTimeout(feedbackTimeout);
    vozFeedback.textContent = mensagem;
    vozFeedback.className = `voz-feedback ${tipo}`;
    vozFeedback.style.opacity = '1';
    vozFeedback.style.display = 'block';

    feedbackTimeout = setTimeout(() => {
        ocultarFeedback();
    }, 4000); // Oculta após 4 segundos
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function mostrarFeedbackInfo(mensagem) { mostrarFeedback(mensagem, 'info'); }

/**
 * Oculta a mensagem de feedback visual.
 */
function ocultarFeedback() {
     clearTimeout(feedbackTimeout);
     vozFeedback.style.opacity = '0';
     setTimeout(() => {
          if (vozFeedback.style.opacity === '0') {
             vozFeedback.textContent = '';
             vozFeedback.className = 'voz-feedback';
             vozFeedback.style.display = 'none';
          }
     }, 300); // Tempo da transição CSS
}

/**
 * Atualiza a exibição da lista de compras na tela, agrupando por categoria.
 */
function atualizarLista() {
    console.log("[atualizarLista] Atualizando exibição da lista...");
    listaComprasUL.innerHTML = ''; // Limpa a lista atual
    let totalGeral = 0;
    let totalUnidades = 0;
    const h2Titulo = listaComprasContainer.querySelector('h2');

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Nenhum item na lista. Adicione algo!</li>';
        if(h2Titulo) h2Titulo.style.display = 'none';
    } else {
        if(h2Titulo) h2Titulo.style.display = 'block';

        // 1. Agrupar por categoria
        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(item);
            return acc;
        }, {});

        // 2. Ordenar categorias
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        // 3. Renderizar cada categoria e seus itens
        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            // Ordenar itens dentro da categoria (pendentes primeiro, depois alfabético)
            itensDaCategoria.sort((a, b) => {
                const aPendente = a.valorUnitario <= 0;
                const bPendente = b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1;
                if (!aPendente && bPendente) return 1;
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
            });

            // Criar grupo visual
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria;

            // Criar cabeçalho da categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            // Renderizar itens da categoria
            itensDaCategoria.forEach(item => {
                // Encontrar o índice ORIGINAL do item na lista 'compras'
                const originalIndex = compras.findIndex(originalItem => originalItem === item);
                if (originalIndex === -1) {
                     console.warn("[atualizarLista] Item renderizado não encontrado na lista original:", item);
                     return; // Pula item se não achar índice (segurança)
                }

                const li = document.createElement('li');
                li.dataset.index = originalIndex; // Armazena o índice ORIGINAL

                if (item.valorUnitario <= 0) {
                    li.classList.add('item-pendente');
                }

                let buttonClass = "excluir-item";
                if (item.valorUnitario <= 0) {
                    buttonClass += " sem-valor"; // Adiciona classe se não tiver valor
                }

                li.innerHTML = `
                    <span class="item-info">
                        <span class="item-qtd">${item.quantidade}x</span>
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-preco">${item.valorUnitario > 0 ? `R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                    </span>
                    <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                // Adiciona listener para EDITAR (clique no LI, exceto no botão excluir)
                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                        const indexParaEditar = parseInt(li.dataset.index); // Pega índice original
                        if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                            editarItem(indexParaEditar);
                        } else {
                            console.error("[atualizarLista] Índice inválido no dataset para edição:", li.dataset.index);
                            mostrarFeedbackErro("Erro ao tentar editar o item.");
                        }
                    }
                });
                categoryGroup.appendChild(li);
            });
            listaComprasUL.appendChild(categoryGroup);
        });
    }

    // Aplicar filtro de categoria (mostrar/ocultar grupos)
    aplicarFiltroCategoria();

    // Calcular totais gerais e atualizar painéis
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    // totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza total oculto, se usado
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    // Verificar orçamento e atualizar barra de progresso
    verificarOrcamento(totalGeral);
    console.log("[atualizarLista] Exibição da lista concluída.");
}

/**
 * Aplica o filtro de categoria selecionado, mostrando ou ocultando grupos de itens.
 */
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    let algumItemVisivel = false;

    // Remove mensagem de filtro vazio anterior, se houver
    const msgFiltroVazioExistente = listaComprasUL.querySelector('.filtro-vazio-msg');
    if (msgFiltroVazioExistente) msgFiltroVazioExistente.remove();

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden');
            if(grupo.querySelectorAll('li').length > 0) { // Verifica se o grupo tem itens visíveis
                algumItemVisivel = true;
            }
        } else {
            grupo.classList.add('hidden');
        }
    });

     // Mostra mensagem se filtro escondeu tudo, mas a lista principal não está vazia
    const isListaOriginalVazia = compras.length === 0;
    const isListaFiltradaVazia = !algumItemVisivel;
    const isListaMostrandoMsgPadraovazia = listaComprasUL.querySelector('.lista-vazia');

    if (!isListaOriginalVazia && isListaFiltradaVazia && !isListaMostrandoMsgPadraovazia) {
         const liFiltroVazio = document.createElement('li');
         liFiltroVazio.textContent = `Nenhum item encontrado para a categoria "${categoriaSelecionada}".`;
         liFiltroVazio.classList.add('filtro-vazio-msg'); // Classe para estilo opcional
         listaComprasUL.appendChild(liFiltroVazio);
    }
    console.log(`[aplicarFiltroCategoria] Filtro aplicado para: ${categoriaSelecionada || 'Todas'}`);
}

/**
 * Verifica o total em relação ao orçamento e atualiza a barra de progresso.
 * @param {number} total - O valor total atual da lista de compras.
 */
function verificarOrcamento(total) {
    const orcamentoValor = parseNumber(orcamentoInput.value);
    let porcentagem = 0;

    if (orcamentoValor > 0) {
        porcentagem = Math.min((total / orcamentoValor) * 100, 100); // Limita a 100%
    } else {
        porcentagem = 0; // Sem orçamento, progresso zero
    }

    barraProgresso.value = porcentagem;
    porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`;

    // Feedback visual de estouro
    if (total > orcamentoValor && orcamentoValor > 0) {
        barraProgresso.classList.add('estourado');
        painelTotal.style.backgroundColor = '#f8d7da';
        painelTotal.style.borderColor = '#f5c6cb';
        painelTotal.style.color = '#721c24';
    } else {
        barraProgresso.classList.remove('estourado');
        // Restaura estilo normal do painel total
        painelTotal.style.backgroundColor = '#e9f5e9';
        painelTotal.style.borderColor = '#c8e6c9';
        painelTotal.style.color = '#006400';
    }
    // console.log(`[verificarOrcamento] Total: ${total}, Orçamento: ${orcamentoValor}, Porcentagem: ${porcentagem}`);
}

// --- Funções de Edição e Modal ---

/**
 * Abre o modal de edição para o item no índice especificado.
 * @param {number} index - O índice do item na lista 'compras' a ser editado.
 */
function editarItem(index) {
    if (index < 0 || index >= compras.length) {
        mostrarFeedbackErro("Índice de item inválido para edição.");
        return;
    }
    itemEditandoIndex = index;
    const item = compras[index];
    console.log("[editarItem] Editando item:", item, "no índice:", index);

    // Preenche o modal
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : ''; // Vazio se 0

    // Mostra o modal
    modalEdicao.style.display = 'block';

    // --- SCROLL --- Leva o modal para a vista após um pequeno delay
    setTimeout(() => {
         modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
         editarDescricao.focus(); // Foca no primeiro campo
    }, 50);
}

/**
 * Fecha o modal de edição e limpa seus campos.
 */
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null;
    editarDescricao.value = '';
    editarQuantidade.value = '';
    editarValor.value = '';
    console.log("[fecharModalEdicao] Modal de edição fechado.");
}

// --- Funções de Reconhecimento de Voz --- (Implementação básica)

/**
 * Tenta ativar o reconhecimento de voz para preencher um campo de input.
 * @param {string} inputId - O ID do campo de input a ser preenchido.
 */
function ativarVozParaInput(inputId) {
    const inputAlvo = document.getElementById(inputId);
    if (!inputAlvo) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        mostrarFeedbackErro('Reconhecimento de voz não suportado neste navegador.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false; // Não queremos resultados parciais
    recognition.maxAlternatives = 1; // Apenas a melhor alternativa

    const micButton = inputId === 'vozInput' ? ativarVoz : document.querySelector(`.modal-mic-btn[data-target="${inputId}"]`);
    let originalMicIcon = null;
    if (micButton) {
        originalMicIcon = micButton.innerHTML; // Salva ícone original
        micButton.innerHTML = '<i class="fas fa-microphone-alt fa-beat"></i>'; // Ícone de 'ouvindo'
        micButton.disabled = true; // Desabilita durante reconhecimento
    }

    mostrarFeedbackInfo('Ouvindo...');

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("[ativarVozParaInput] Resultado voz:", transcript);
        inputAlvo.value = transcript;
        ocultarFeedback();
        // Se for o input principal, tenta processar automaticamente
        if (inputId === 'vozInput') {
            processarEAdicionarItem(transcript);
        } else {
            inputAlvo.focus(); // Foca no campo editado no modal
        }
    };

    recognition.onspeechend = () => {
        recognition.stop();
    };

    recognition.onerror = (event) => {
        console.error("[ativarVozParaInput] Erro reconhecimento voz:", event.error);
        let errorMsg = 'Erro no reconhecimento de voz.';
        if (event.error === 'no-speech') errorMsg = 'Nenhuma fala detectada.';
        else if (event.error === 'audio-capture') errorMsg = 'Erro ao capturar áudio.';
        else if (event.error === 'not-allowed') errorMsg = 'Permissão para microfone negada.';
        mostrarFeedbackErro(errorMsg);
    };

    recognition.onend = () => {
        console.log("[ativarVozParaInput] Reconhecimento finalizado.");
        ocultarFeedback(); // Garante que o "Ouvindo..." suma
        if (micButton) {
            micButton.innerHTML = originalMicIcon; // Restaura ícone
            micButton.disabled = false; // Reabilita botão
        }
    };
}

/**
 * Função wrapper para ativar a voz especificamente para um campo do modal.
 * @param {string} campoId - O ID do campo do modal (editarDescricao, editarQuantidade, editarValor).
 */
function editarCampoComVoz(campoId) {
    ativarVozParaInput(campoId);
}


// --- Funções de Importação/Exportação/Limpeza ---

/**
 * Processa um arquivo XLSX e importa os dados para a lista de compras.
 * @param {File} file - O arquivo XLSX selecionado pelo usuário.
 */
function importarDadosXLSX(file) {
    if (!file) return;
    console.log("[importarDadosXLSX] Importando arquivo:", file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Lê como array de arrays

            if (jsonData.length < 2) { // Precisa ter cabeçalho + pelo menos 1 linha de dados
                mostrarFeedbackErro("Arquivo vazio ou sem dados após o cabeçalho.");
                return;
            }

            let itensAdicionados = 0;
            let itensAtualizados = 0;

            // Processa linhas a partir da segunda (índice 1), pulando o cabeçalho
            jsonData.slice(1).forEach((row, rowIndex) => {
                 if (!row || row.length === 0 || !row[0]) { // Pula linhas vazias ou sem descrição
                     console.log(`[importarDadosXLSX] Linha ${rowIndex + 2} ignorada (vazia ou sem descrição).`);
                     return;
                 }

                 const descricao = String(row[0]).trim();
                 const quantidade = parseInt(row[1], 10) || 1; // Default 1 se inválido
                 const valorUnitario = parseNumber(String(row[2] || '0')); // Default 0 se vazio/inválido
                 let categoria = String(row[3] || '').trim();

                 if (!categoria) {
                     categoria = inferirCategoria(descricao); // Inferir se não fornecida
                 }

                  // Verifica se já existe
                 const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());

                 if (itemExistenteIndex > -1) {
                     // Atualiza item existente (substitui valores)
                     compras[itemExistenteIndex].quantidade = quantidade;
                     compras[itemExistenteIndex].valorUnitario = valorUnitario;
                     if (categoria) compras[itemExistenteIndex].categoria = categoria; // Atualiza categoria se fornecida
                     itensAtualizados++;
                     console.log(`[importarDadosXLSX] Item atualizado: ${descricao}`);
                 } else {
                     // Adiciona novo item
                     compras.push({ descricao, quantidade, valorUnitario, categoria });
                     itensAdicionados++;
                     console.log(`[importarDadosXLSX] Item adicionado: ${descricao}`);
                 }
            });

            atualizarLista();
            salvarDados();
            mostrarFeedbackSucesso(`Importação concluída: ${itensAdicionados} adicionados, ${itensAtualizados} atualizados.`);

        } catch (error) {
            console.error("[importarDadosXLSX] Erro ao processar arquivo:", error);
            mostrarFeedbackErro('Erro ao ler o arquivo XLSX. Verifique o formato e o conteúdo.');
        }
    };

    reader.onerror = (error) => {
        console.error("[importarDadosXLSX] Erro ao ler o arquivo:", error);
        mostrarFeedbackErro('Não foi possível ler o arquivo selecionado.');
    };

    reader.readAsArrayBuffer(file); // Lê o arquivo como ArrayBuffer
}

/**
 * Gera e baixa um relatório da lista de compras em formato XLSX.
 */
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackInfo("A lista está vazia, nenhum relatório para gerar.");
        return;
    }
    console.log("[gerarRelatorioExcel] Gerando relatório...");

    try {
        // Prepara os dados para o Excel
        const dataParaExportar = [
            // Cabeçalho
            ["Descrição", "Quantidade", "Valor Unitário (R$)", "Valor Total (R$)", "Categoria"]
        ];

        let totalRelatorio = 0;

        // Adiciona cada item formatado
        compras.forEach(item => {
            const valorTotalItem = item.quantidade * item.valorUnitario;
            dataParaExportar.push([
                item.descricao,
                item.quantidade,
                item.valorUnitario.toFixed(2).replace('.', ','), // Formato brasileiro
                valorTotalItem.toFixed(2).replace('.', ','),    // Formato brasileiro
                item.categoria || 'Outros'
            ]);
            totalRelatorio += valorTotalItem;
        });

        // Adiciona linha de totais
        dataParaExportar.push([]); // Linha em branco
        dataParaExportar.push(["TOTAL GERAL:", "", "", totalRelatorio.toFixed(2).replace('.', ','), ""]);

        // Cria a planilha
        const worksheet = XLSX.utils.aoa_to_sheet(dataParaExportar);

        // Ajusta largura das colunas (opcional, mas melhora visualização)
        worksheet['!cols'] = [
            { wch: 30 }, // Descrição
            { wch: 10 }, // Quantidade
            { wch: 18 }, // Valor Unitário
            { wch: 18 }, // Valor Total
            { wch: 15 }  // Categoria
        ];

        // Cria o workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

        // Gera o arquivo e dispara o download
        const hoje = new Date();
        const nomeArquivo = `MinhasCompras_${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}.xlsx`;
        XLSX.writeFile(workbook, nomeArquivo);

        mostrarFeedbackSucesso("Relatório Excel gerado com sucesso!");
        console.log("[gerarRelatorioExcel] Relatório gerado:", nomeArquivo);

    } catch (error) {
        console.error("[gerarRelatorioExcel] Erro ao gerar relatório:", error);
        mostrarFeedbackErro("Ocorreu um erro ao gerar o relatório Excel.");
    }
}

// --- Event Listeners ---

// Input Principal e Botões Associados
vozInput.addEventListener('input', () => { awesompleteInstance.evaluate(); }); // Sugestões ao digitar
vozInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processarEAdicionarItem(vozInput.value); });
ativarVoz.addEventListener('click', () => { ativarVozParaInput('vozInput'); });
inserirItem.addEventListener('click', () => { processarEAdicionarItem(vozInput.value); });
limparInput.addEventListener('click', () => { vozInput.value = ''; ocultarFeedback(); vozInput.focus(); awesompleteInstance.close(); });

// Lista de Compras (Delegação de Eventos para Excluir)
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        const index = parseInt(li.dataset.index); // Pega o índice ORIGINAL do dataset

         if (!isNaN(index) && index >= 0 && index < compras.length) {
             if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                 const itemRemovido = compras.splice(index, 1)[0]; // Remove da lista 'compras'
                 console.log("[Excluir Item] Item removido:", itemRemovido, "no índice:", index);

                 // Animação de remoção no LI
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, padding 0.3s ease-out, margin 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(50px)';
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.border = 'none'; // Garante remoção de bordas

                 // Após animação, atualiza a lista e salva
                 setTimeout(() => {
                      atualizarLista(); // Re-renderiza a UL com base na lista 'compras' atualizada
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemRemovido.descricao}" excluído!`);
                 }, 400); // Tempo da animação
             }
         } else {
             console.error("[Excluir Item] Índice inválido ou item não encontrado para exclusão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item. Recarregando lista.");
             atualizarLista(); // Força atualização em caso de erro de índice
         }
    }
    // Clique para editar já está no LI dentro de atualizarLista()
});

// Filtro por Categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    // Formatação enquanto digita (opcional, pode ser só no blur)
    // let valor = orcamentoInput.value.replace(/\D/g, '');
    // ... (lógica de formatação com vírgula/ponto) ...
    // orcamentoInput.value = valorFormatado;

    // Atualiza barra e salva
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    verificarOrcamento(totalAtual);
    salvarDados();
});
orcamentoInput.addEventListener('blur', () => { // Formatação final ao perder foco
     const valor = parseNumber(orcamentoInput.value);
     orcamentoInput.value = valor > 0 ? valor.toFixed(2).replace('.', ',') : '';
     // Salvar novamente no blur garante que o valor formatado seja salvo
     salvarDados();
});

// Botões de Ação Superiores (com Scroll)
importarBtn.addEventListener('click', () => {
    const modalInfo = document.getElementById('modalImportInfo');
    const fecharInfoModal = modalInfo.querySelector('.fechar-modal');
    const continuarBtn = document.getElementById('continuarImport');
    // Cria input file dinamicamente para não poluir HTML
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = ".xlsx";
    inputFile.style.display = 'none'; // Esconde o input

    // Função para fechar modal e remover listeners
    function fecharE limparModalInfo() {
        modalInfo.style.display = 'none';
        continuarBtn.removeEventListener('click', handleContinuarImport);
        fecharInfoModal.removeEventListener('click', fecharE limparModalInfo);
        document.body.removeChild(inputFile); // Remove input file do DOM
    }

    // Função chamada ao clicar em "Continuar" no modal
    function handleContinuarImport() {
        fecharE limparModalInfo();
        inputFile.click(); // Abre a janela de seleção de arquivo
        // Não rola aqui ainda, espera o usuário selecionar o arquivo
    }

    // Listener para quando um arquivo for selecionado
    inputFile.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            importarDadosXLSX(file);
            // Rola para o input APÓS selecionar o arquivo e iniciar importação
            scrollParaInputPrincipal();
        } else {
             console.log("[Importar] Nenhuma arquivo selecionado.");
        }
    };

    // Adiciona o input ao body temporariamente
    document.body.appendChild(inputFile);
    // Mostra o modal de informações
    modalInfo.style.display = 'block';
    // Adiciona listeners aos botões do modal
    continuarBtn.addEventListener('click', handleContinuarImport);
    fecharInfoModal.addEventListener('click', fecharE limparModalInfo);
});

relatorioBtn.addEventListener('click', () => {
    gerarRelatorioExcel();
    scrollParaInputPrincipal(); // Rola após gerar
});

limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackInfo('A lista já está vazia.');
        scrollParaInputPrincipal();
        return;
    }
    if (confirm('Tem certeza que deseja limpar TODA a lista de compras e o orçamento? Esta ação não pode ser desfeita.')) {
        console.log("[Limpar Lista] Limpando lista e orçamento...");
        compras = [];
        orcamentoInput.value = '';
        salvarDados(); // Salva estado vazio
        atualizarLista(); // Renderiza lista vazia
        verificarOrcamento(0); // Reseta barra
        mostrarFeedbackSucesso('Lista de compras e orçamento limpos!');
        scrollParaInputPrincipal(); // Rola após limpar
    }
});

// Modal de Edição
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex === null || itemEditandoIndex >= compras.length) {
        mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
        return;
    }
    const novaDescricao = editarDescricao.value.trim();
    const novaQuantidade = parseInt(editarQuantidade.value, 10);
    const novoValorUnitario = parseNumber(editarValor.value);

    // Validações
    if (!novaDescricao) {
        mostrarFeedbackErro('A descrição não pode ficar vazia.'); editarDescricao.focus(); return;
    }
    if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
        mostrarFeedbackErro('A quantidade deve ser um número maior que zero.'); editarQuantidade.focus(); return;
    }

    const novaCategoria = inferirCategoria(novaDescricao);

    // Atualiza o item na lista 'compras'
    compras[itemEditandoIndex] = { descricao: novaDescricao, quantidade: novaQuantidade, valorUnitario: novoValorUnitario, categoria: novaCategoria };
    console.log("[Salvar Edição] Item atualizado:", compras[itemEditandoIndex]);

    fecharModalEdicao();
    atualizarLista();
    salvarDados();
    mostrarFeedbackSucesso('Item editado com sucesso!');
});

fecharModalBtn.addEventListener('click', fecharModalEdicao);

// Fechar Modais clicando fora ou com ESC
window.addEventListener('click', (event) => {
    const modalInfo = document.getElementById('modalImportInfo');
    if (event.target == modalEdicao) fecharModalEdicao();
    if (modalInfo && event.target == modalInfo) modalInfo.style.display = 'none';
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modalInfo = document.getElementById('modalImportInfo');
        if (modalEdicao.style.display === 'block') fecharModalEdicao();
        if (modalInfo && modalInfo.style.display === 'block') modalInfo.style.display = 'none';
    }
});

// Formatação do campo de valor no modal de edição
editarValor.addEventListener('input', function() {
     let valor = this.value.replace(/\D/g, ''); // Remove não dígitos
     if (valor.length === 0) { this.value = ''; return; } // Limpa se vazio
     valor = parseInt(valor, 10).toString(); // Remove zeros à esquerda

     if (valor.length <= 2) { // 0,XX
         valor = '0,' + ('00' + valor).slice(-2);
     } else { // X,XX ou XX,XX etc.
         valor = valor.slice(0, -2) + ',' + valor.slice(-2);
     }
      // Adicionar ponto de milhar (opcional, pode poluir)
     // if (valor.length > 6) { // Ex: 1.234,56
     //    let [inteiro, decimal] = valor.split(',');
     //    inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
     //    valor = inteiro + ',' + decimal;
     // }
     this.value = valor;
});

// Listeners para os microfones do modal
document.querySelectorAll('.modal-mic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetInputId = btn.dataset.target;
        if (targetInputId) {
            editarCampoComVoz(targetInputId);
        }
    });
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("=======================================");
    console.log(" Minhas Compras - Aplicação Iniciada ");
    console.log("=======================================");
    carregarDados(); // Carrega dados salvos
    atualizarLista(); // Renderiza a lista inicial
});