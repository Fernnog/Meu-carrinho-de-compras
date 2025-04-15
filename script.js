// script.js - Minhas Compras de Mercado (Versão com Separação Pendentes/Confirmados e Navegador Flutuante)

// --- Seleção de elementos do DOM ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback'); // Feedback principal
const listaPendentesContainer = document.querySelector('#listaPendentesContainer');
const listaPendentesUL = document.querySelector('#listaPendentes');
const listaComprasContainer = document.querySelector('#listaComprasContainer');
const listaComprasUL = document.querySelector('#listaCompras');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor'); // Total oculto (pode remover se não usar)
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade'); // Campo manual
const editarValor = document.querySelector('#editarValor'); // Campo manual
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const importarBtn = document.querySelector('#importar');
const limparListaBtn = document.querySelector('#limparLista');
const relatorioBtn = document.querySelector('#relatorio');
const barraProgresso = document.getElementById('barraProgresso');
const porcentagemProgresso = document.getElementById('porcentagemProgresso');
const progressBarContainer = document.querySelector('.progress-bar-container');
const painelTotal = document.querySelector('#painelTotal');
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');
const editarVozInput = document.getElementById('editarVozInput');
const editarVozMicBtn = document.getElementById('editarVozMicBtn');
const processarEdicaoVoz = document.getElementById('processarEdicaoVoz');
const limparEdicaoVoz = document.getElementById('limparEdicaoVoz');
const editarVozFeedback = document.getElementById('editarVozFeedback'); // Feedback no modal
const modalImportInfo = document.getElementById('modalImportInfo');
const continuarImportBtn = document.getElementById('continuarImport');
const modalImportChoice = document.getElementById('modalImportChoice');
const modalTextImport = document.getElementById('modalTextImport');
const importChoiceXlsxBtn = document.getElementById('importChoiceXlsx');
const importChoiceTextBtn = document.getElementById('importChoiceText');
const textImportArea = document.getElementById('textImportArea');
const processTextImportBtn = document.getElementById('processTextImport');
const painelUltimoItem = document.getElementById('painelUltimoItem');
const ultimoItemInfo = document.getElementById('ultimoItemInfo');
const floatingNavigator = document.getElementById('floating-navigator'); // NOVO SELETOR para navegador flutuante

// --- Variáveis Globais ---
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Açúcar", "Café", "Sal", "Farinha de Trigo", "Leite", "Ovos",
    "Pão de Forma", "Manteiga", "Queijo", "Presunto", "Frango", "Carne Moída", "Linguiça", "Peixe",
    "Alface", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Maçã", "Banana", "Laranja", "Limão",
    "Sabão em Pó", "Amaciante", "Detergente", "Água Sanitária", "Limpador Multiuso", "Esponja de Aço",
    "Papel Higiênico", "Sabonete", "Shampoo", "Condicionador", "Creme Dental", "Escova de Dentes",
    "Desodorante", "Biscoito", "Refrigerante", "Suco", "Água Mineral", "Iogurte", "Chocolate"
];
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// --- Funções de Inicialização e Configuração ---
const awesompleteInstance = new Awesomplete(vozInput, {
    list: listaSugestoes,
    minChars: 1,
    maxItems: 7,
    autoFirst: true
});
vozInput.addEventListener('focus', () => {
    // setTimeout(() => awesompleteInstance.evaluate(), 1);
});

// --- Funções de Manipulação de Dados ---

function inferirCategoria(descricao) {
    const descLower = descricao.toLowerCase();
    const alimentosKeys = ['arroz', 'feijão', 'macarrão', 'óleo', 'acucar', 'açúcar', 'cafe', 'café', 'sal', 'farinha', 'leite', 'ovos', 'pão', 'manteiga', 'queijo', 'presunto', 'frango', 'carne', 'linguiça', 'peixe', 'alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'maçã', 'banana', 'laranja', 'limão', 'biscoito', 'refrigerante', 'suco', 'água', 'iogurte', 'chocolate', 'cerveja', 'vinho', 'legume', 'verdura', 'fruta', 'cereal', 'peito', 'sobrecoxa', 'patinho', 'acem', 'picanha', 'tilapia', 'sardinha', 'atum', 'mussarela', 'prato', 'mortadela', 'salame', 'soja'];
    const limpezaKeys = ['sabão', 'amaciante', 'detergente', 'sanitária', 'multiuso', 'limpador', 'esponja', 'desinfetante', 'lustra', 'alcool', 'álcool', 'pano', 'vassoura', 'rodo', 'balde', 'inseticida', 'guardanapo', 'papel toalha'];
    const higieneKeys = ['papel higiênico', 'sabonete', 'shampoo', 'condicionador', 'creme dental', 'pasta de dente', 'escova de dente', 'desodorante', 'fio dental', 'absorvente', 'cotonete', 'barbeador', 'gilete', 'fralda'];

    if (alimentosKeys.some(key => descLower.includes(key))) return 'Alimentos';
    if (limpezaKeys.some(key => descLower.includes(key))) return 'Limpeza';
    if (higieneKeys.some(key => descLower.includes(key))) return 'Higiene Pessoal';
    return 'Outros';
}

function parseNumber(texto) {
    if (!texto || typeof texto !== 'string') return 0;
    const numeroLimpo = texto.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
    const valor = parseFloat(numeroLimpo);
    return isNaN(valor) ? 0 : valor;
}

function processarEAdicionarItem(textoOriginal) {
    if (!textoOriginal || textoOriginal.trim() === '') {
        mostrarFeedbackErro('Digite ou dite alguma informação do item.');
        return;
    }

    const texto = textoOriginal.trim();
    let quantidade = 1;
    let valorUnitario = 0;
    let descricao = '';

    const marcadores = {
        quantidade: ['quantidade', 'quant', 'qtd', 'qt'],
        descricao: ['descrição', 'descricao', 'desc', 'nome'],
        preco: ['preço', 'preco', 'valor', 'val']
    };

    const todosMarcadoresRegex = new RegExp(`\\b(${
        [...marcadores.quantidade, ...marcadores.descricao, ...marcadores.preco].join('|')
    })\\b\\s*`, 'gi');

    const partes = texto.split(todosMarcadoresRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null;
    let descricaoColetada = [];

    const numerosPorExtenso = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
        'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    };

    if (partes.length > 0 && !Object.values(marcadores).flat().some(m => partes[0].toLowerCase().trim().startsWith(m))) {
        tipoAtual = 'descricao';
        descricaoColetada.push(partes[0].trim());
    }

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();

        let marcadorEncontrado = false;
        for (const [tipo, keywords] of Object.entries(marcadores)) {
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo;
                marcadorEncontrado = true;
                continue;
            }
        }

        if (!marcadorEncontrado && tipoAtual) {
            switch (tipoAtual) {
                case 'quantidade':
                    let qtdEncontrada = NaN;
                    const matchDigito = parteAtual.match(/\d+/);
                    if (matchDigito) {
                        qtdEncontrada = parseInt(matchDigito[0], 10);
                    }
                    if (isNaN(qtdEncontrada)) {
                        const parteLowerTrimmed = parteAtual.toLowerCase().trim();
                        if (numerosPorExtenso.hasOwnProperty(parteLowerTrimmed)) {
                             qtdEncontrada = numerosPorExtenso[parteLowerTrimmed];
                        }
                    }
                    if (!isNaN(qtdEncontrada) && qtdEncontrada > 0) {
                        quantidade = qtdEncontrada;
                    } else {
                        console.warn(`Não foi possível parsear quantidade: "${parteAtual}". Usando padrão 1.`);
                        quantidade = 1;
                    }
                    tipoAtual = null;
                    break;
                case 'preco':
                    valorUnitario = parseNumber(parteAtual);
                    tipoAtual = null;
                    break;
                case 'descricao':
                    descricaoColetada.push(parteAtual);
                    break;
            }
        } else if (!marcadorEncontrado && !tipoAtual) {
             if (descricaoColetada.length === 0 && i === 0) {
                descricaoColetada.push(parteAtual);
             } else if (descricaoColetada.length > 0){
                 descricaoColetada.push(parteAtual);
             }
        }
    }

    descricao = descricaoColetada.join(' ').trim();

    if (!descricao) {
        mostrarFeedbackErro('A descrição (ou nome) não pode estar vazia. Verifique o comando.');
        return;
    }
    if (quantidade <= 0) {
        quantidade = 1;
    }

    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
        let itemFinal;

        if (itemExistenteIndex > -1) {
            const itemExistente = compras[itemExistenteIndex];
            const valorExistenteZero = !itemExistente.valorUnitario || itemExistente.valorUnitario <= 0;
            const valorNovoZero = valorUnitario <= 0;
            const precoMudou = !valorExistenteZero && !valorNovoZero && itemExistente.valorUnitario !== valorUnitario;
            const precoAdicionado = valorExistenteZero && !valorNovoZero;
            const precoRemovido = !valorExistenteZero && valorNovoZero;

            let precisaConfirmar = false;
            let mensagemConfirmacao = `"${descricao}" já está na lista com ${itemExistente.quantidade}x. `;

            if (precoMudou) {
                mensagemConfirmacao += `O preço será atualizado para R$ ${valorUnitario.toFixed(2).replace('.', ',')}. `;
                precisaConfirmar = true;
            }
            if (precoRemovido) {
                mensagemConfirmacao += `O preço será removido. `;
                precisaConfirmar = true;
            }
            if (precoAdicionado) {
                 mensagemConfirmacao += `Preço R$ ${valorUnitario.toFixed(2).replace('.', ',')} adicionado. `;
            }

            mensagemConfirmacao += `Deseja somar a nova quantidade (${quantidade})?`;

            if (precisaConfirmar && !confirm(mensagemConfirmacao)) {
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus();
                return;
            }

            compras[itemExistenteIndex].quantidade += quantidade;
            if (valorUnitario > 0 || valorExistenteZero || precoRemovido) {
                compras[itemExistenteIndex].valorUnitario = valorUnitario;
            }
            compras[itemExistenteIndex].categoria = inferirCategoria(compras[itemExistenteIndex].descricao);
            itemFinal = compras[itemExistenteIndex];

        } else {
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
            itemFinal = novoItem;
        }

        atualizarLista();
        salvarDados();
        vozInput.value = '';
        ocultarFeedback();
        const acaoRealizada = itemExistenteIndex > -1 ? "atualizado" : "adicionado";
        const indexFinal = itemExistenteIndex > -1 ? itemExistenteIndex : compras.length - 1;
        const precoFinalFeedback = compras[indexFinal].valorUnitario !== undefined ? compras[indexFinal].valorUnitario.toFixed(2).replace('.', ',') : '0,00';
        mostrarFeedbackSucesso(`Item "${descricao}" ${acaoRealizada}! (Qtd: ${compras[indexFinal].quantidade}, Preço: R$ ${precoFinalFeedback})`);

        atualizarPainelUltimoItem(itemFinal);
        vozInput.focus();

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro('Ocorreu um erro ao processar o item.');
    }
}

function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    const orcamentoValor = orcamentoInput.value;
    localStorage.setItem('orcamento', orcamentoValor);
}

function carregarDados() {
    const comprasSalvas = localStorage.getItem('compras');
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (comprasSalvas) {
        compras = JSON.parse(comprasSalvas);
        compras.forEach(item => {
            if (!item.categoria || typeof item.categoria !== 'string') {
                item.categoria = inferirCategoria(item.descricao || '');
            }
            if (item.valorUnitario === undefined || item.valorUnitario === null || isNaN(parseFloat(item.valorUnitario))) {
                 item.valorUnitario = 0;
            } else {
                 item.valorUnitario = parseFloat(item.valorUnitario);
            }
            if (item.quantidade === undefined || item.quantidade === null || isNaN(parseInt(item.quantidade)) || parseInt(item.quantidade) <= 0) {
                 item.quantidade = 1;
            } else {
                 item.quantidade = parseInt(item.quantidade);
            }
        });
    }
    if (orcamentoSalvo) {
        orcamentoInput.value = orcamentoSalvo;
    }
}

// --- Funções de Atualização da Interface (UI) ---

function mostrarFeedback(mensagem, tipo = 'info', elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return;
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''} show ${tipo}`;
}
function mostrarFeedbackSucesso(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'success', elementoFeedback); }
function mostrarFeedbackErro(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'error', elementoFeedback); }

function ocultarFeedback(elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return;
    elementoFeedback.classList.remove('show');
}
function mostrarFeedbackModalSucesso(mensagem) { mostrarFeedbackSucesso(mensagem, editarVozFeedback); }
function mostrarFeedbackModalErro(mensagem) { mostrarFeedbackErro(mensagem, editarVozFeedback); }
function ocultarFeedbackModal() { ocultarFeedback(editarVozFeedback); }

function atualizarPainelUltimoItem(item) {
    if (!item || !painelUltimoItem || !ultimoItemInfo) return;
    const { quantidade, descricao } = item;
    let infoTexto = `${quantidade}x ${descricao}`;
    ultimoItemInfo.textContent = infoTexto;
    setTimeout(() => {
         painelUltimoItem.classList.add('show');
    }, 10);
}

function resetarPainelUltimoItem() {
    if (!painelUltimoItem || !ultimoItemInfo) return;
    painelUltimoItem.classList.remove('show');
    setTimeout(() => {
        if (!painelUltimoItem.classList.contains('show')) {
             ultimoItemInfo.textContent = 'Nenhum item adicionado recentemente.';
        }
    }, 400);
}

function atualizarLista() {
    listaPendentesUL.innerHTML = '';
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidadesConfirmadas = 0;
    let nomesUnicosConfirmadosCount = 0;

    if(listaPendentesContainer) listaPendentesContainer.style.display = 'block';
    if(listaComprasContainer) listaComprasContainer.style.display = 'block';

    compras.forEach((item, index) => item.originalIndex = index);

    const itensPendentes = compras.filter(item => !item.valorUnitario || item.valorUnitario <= 0);
    const itensConfirmados = compras.filter(item => item.valorUnitario && item.valorUnitario > 0);

    const renderizarGrupoItens = (itens, targetUL, containerDiv, mensagemVazia) => {
        if (itens.length === 0) {
            targetUL.innerHTML = `<li class="lista-vazia">${mensagemVazia}</li>`;
            if (containerDiv) containerDiv.style.display = 'none';
            return;
        } else {
             if (containerDiv) containerDiv.style.display = 'block';
        }

        const itensAgrupados = itens.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push({ ...item });
            return acc;
        }, {});

        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'pt-BR');
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];
            itensDaCategoria.sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' }));

            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria;

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                li.dataset.index = item.originalIndex;

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                let buttonClass = "excluir-item";
                if (isPendente) {
                    li.classList.add('item-pendente');
                    buttonClass += " sem-valor";
                }

                li.innerHTML = `
                    <span class="item-info">
                        <span class="item-qtd">${item.quantidade}x</span>
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-preco">${item.valorUnitario > 0 ? `R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                    </span>
                    <button class="${buttonClass}" aria-label="Excluir ${item.descricao}" title="Excluir ${item.descricao}">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar);
                         } else {
                              console.error("Índice original inválido ou dessincronizado para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. A lista será atualizada.");
                              atualizarLista();
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });
            targetUL.appendChild(categoryGroup);
        });
    };

    renderizarGrupoItens(
        itensPendentes,
        listaPendentesUL,
        listaPendentesContainer,
        "Nenhum item pendente (sem preço definido)."
    );
    renderizarGrupoItens(
        itensConfirmados,
        listaComprasUL,
        listaComprasContainer,
        "Nenhum item com preço definido no carrinho."
    );

    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidadesConfirmadas = itensConfirmados.reduce((sum, item) => sum + item.quantidade, 0);
    nomesUnicosConfirmadosCount = new Set(itensConfirmados.map(item => item.descricao.toLowerCase().trim())).size;

    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosConfirmadosCount;
    contagemUnidadesSpan.textContent = totalUnidadesConfirmadas;

    aplicarFiltroCategoria();
    verificarOrcamento(totalGeral);
    toggleFloatingNavigatorVisibility(); // <-- ADICIONADO AQUI para atualizar visibilidade do navegador
}

function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;

    const filtrarLista = (ulElement) => {
        if (!ulElement) return;

        const todosGrupos = ulElement.querySelectorAll('.category-group');
        const listaVaziaMsg = ulElement.querySelector('.lista-vazia');
        let algumGrupoVisivel = false;

        let noResultsMsg = ulElement.querySelector('.filtro-sem-resultados');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }

        if (listaVaziaMsg && !todosGrupos.length) return;

        todosGrupos.forEach(grupo => {
            const grupoCategoria = grupo.dataset.category;
            if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
                grupo.classList.remove('hidden');
                algumGrupoVisivel = true;
            } else {
                grupo.classList.add('hidden');
            }
        });

        if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
            const msg = document.createElement('li');
            msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}" nesta lista.`;
            msg.classList.add('filtro-sem-resultados');
            ulElement.appendChild(msg);
        }
    };

    filtrarLista(listaPendentesUL);
    filtrarLista(listaComprasUL);
}

function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;
    let porcentagemReal = 0;

    if (orcamento > 0) {
        porcentagemReal = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagemReal, 100);
        barraProgresso.value = porcentagem;

        if (total > orcamento) {
            progressBarContainer.classList.add('over-budget');
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`;
            painelTotal.style.backgroundColor = '#f8d7da';
            painelTotal.style.color = '#721c24';
            painelTotal.style.borderColor = '#f5c6cb';
        } else {
            progressBarContainer.classList.remove('over-budget');
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`;
            painelTotal.style.backgroundColor = '#e9f5e9';
            painelTotal.style.color = '#006400';
            painelTotal.style.borderColor = '#c8e6c9';
        }
    } else {
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = '0%';
        progressBarContainer.classList.remove('over-budget');
        painelTotal.style.backgroundColor = '#e9f5e9';
        painelTotal.style.color = '#006400';
        painelTotal.style.borderColor = '#c8e6c9';
    }
}

// NOVO: Função para controlar a visibilidade do navegador flutuante
function toggleFloatingNavigatorVisibility() {
    if (!floatingNavigator) return; // Sai se o elemento não existir

    const containerElement = document.querySelector('.container');
    if (!containerElement) return; // Sai se o container principal não for encontrado

    const buffer = 20; // Distância em pixels do fundo para esconder o navegador
    // Calcula se o final do conteúdo do container está visível ou quase visível na parte inferior da janela
    const isNearBottom = containerElement.getBoundingClientRect().bottom <= window.innerHeight + buffer;

    // Mostra se não estiver perto do fundo, esconde se estiver
    if (isNearBottom) {
        floatingNavigator.classList.add('hidden');
    } else {
        // Condição extra: Só mostra se houver itens nas listas (evita mostrar com lista vazia)
        if (compras.length > 0) {
            floatingNavigator.classList.remove('hidden');
        } else {
             floatingNavigator.classList.add('hidden'); // Mantém escondido se lista vazia
        }
    }
}

// --- Funções de Edição e Modal ---

function editarItem(index) {
    if (index === null || typeof index !== 'number' || isNaN(index) || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição. Tente atualizar a página.");
        return;
    }
    itemEditandoIndex = index;
    const item = compras[index];

    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    if(editarVozInput) editarVozInput.value = '';
    ocultarFeedbackModal();

    modalEdicao.style.display = 'block';
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select();
    }, 350);
}

function fecharModalEdicao() {
    if (modalEdicao) modalEdicao.style.display = 'none';
    itemEditandoIndex = null;
    ocultarFeedbackModal();
}

editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/[^\d,.]/g, '');
    value = value.replace(/\./g, ',');
    if ((value.match(/,/g) || []).length > 1) {
        value = value.replace(/,(?=[^,]*$)/, '');
    }
    e.target.value = value;
});

editarValor.addEventListener('blur', function(e){
    const valorNumerico = parseNumber(e.target.value);
    e.target.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
});

function processarComandoEdicaoVoz() {
    const textoComando = editarVozInput.value.trim();
    if (!textoComando) {
        mostrarFeedbackModalErro("Digite ou dite um comando (Ex: qtd 5 preco 10,50).");
        return;
    }

    let novaQuantidade = null;
    let novoValor = null;
    let comandoValido = false;

    const marcadoresEdicao = {
        quantidade: ['quantidade', 'quant', 'qtd', 'qt'],
        preco: ['preço', 'preco', 'valor', 'val']
    };
    const numerosPorExtensoEdicao = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
        'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    };

    const marcadorRegex = new RegExp(`\\b(${
        [...marcadoresEdicao.quantidade, ...marcadoresEdicao.preco].join('|')
    })\\b\\s*`, 'gi');

    const partes = textoComando.split(marcadorRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null;

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();
        let marcadorEncontrado = false;

        for (const [tipo, keywords] of Object.entries(marcadoresEdicao)) {
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo;
                marcadorEncontrado = true;
                continue;
            }
        }

        if (!marcadorEncontrado && tipoAtual) {
            switch (tipoAtual) {
                case 'quantidade':
                    let qtdEncontrada = NaN;
                    const matchDigito = parteAtual.match(/\d+/);
                    if (matchDigito) {
                        qtdEncontrada = parseInt(matchDigito[0], 10);
                    }
                    if (isNaN(qtdEncontrada)) {
                         const parteLowerTrimmed = parteAtual.toLowerCase().trim();
                         if (numerosPorExtensoEdicao.hasOwnProperty(parteLowerTrimmed)) {
                             qtdEncontrada = numerosPorExtensoEdicao[parteLowerTrimmed];
                         }
                    }
                    if (!isNaN(qtdEncontrada) && qtdEncontrada > 0) {
                        novaQuantidade = qtdEncontrada;
                        comandoValido = true;
                    } else {
                        mostrarFeedbackModalErro(`Quantidade inválida: "${parteAtual}".`);
                    }
                    break;
                case 'preco':
                    const valorParseado = parseNumber(parteAtual);
                    if (valorParseado >= 0) {
                        novoValor = valorParseado;
                        comandoValido = true;
                    } else {
                         mostrarFeedbackModalErro(`Preço inválido: "${parteAtual}".`);
                    }
                    break;
            }
            tipoAtual = null;
        } else if (!marcadorEncontrado && !tipoAtual) {
             console.warn("Ignorando parte inválida no comando de edição:", parteAtual);
        }
    }

    if (comandoValido) {
        let feedbackMsg = "Campos atualizados por voz:";
        if (novaQuantidade !== null) {
            editarQuantidade.value = novaQuantidade;
            feedbackMsg += ` Qtd=${novaQuantidade}`;
        }
        if (novoValor !== null) {
            editarValor.value = novoValor > 0 ? novoValor.toFixed(2).replace('.', ',') : '';
            editarValor.dispatchEvent(new Event('blur'));
            feedbackMsg += ` Preço=R$ ${novoValor.toFixed(2).replace('.', ',')}`;
        }
        mostrarFeedbackModalSucesso(feedbackMsg);
        editarVozInput.value = '';
    } else {
        mostrarFeedbackModalErro("Nenhum comando válido de quantidade ou preço encontrado.");
    }
}

// --- Funções de Reconhecimento de Voz ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const targetInputId = recognition.targetInputId;
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript;
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('blur'));
            }
            const feedbackElement = targetInputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`, feedbackElement);
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento: ';
        switch (event.error) {
            case 'no-speech': errorMsg += 'Nenhuma fala detectada.'; break;
            case 'audio-capture': errorMsg += 'Falha na captura de áudio (verifique microfone/permissão).'; break;
            case 'not-allowed': errorMsg += 'Permissão para usar o microfone negada.'; break;
            case 'network': errorMsg += 'Erro de rede. Verifique a conexão.'; break;
            default: errorMsg += event.error;
        }

        const recordingButton = document.querySelector('.mic-btn.recording, .modal-mic-btn.recording');
        const targetId = recordingButton ? (recordingButton.dataset.target || 'vozInput') : 'vozInput';
        const feedbackElement = targetId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro(errorMsg, feedbackElement);

        console.error('Speech recognition error:', event.error);
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onend = () => {
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    document.querySelectorAll('.mic-btn, .modal-mic-btn').forEach(btn => {
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado";
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
}

function ativarVozParaInput(inputId) {
    if (!recognition) {
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Reconhecimento de voz não suportado.", feedbackElement);
        return;
    }

    try { recognition.stop(); } catch(e) { /* Ignora */ }
    document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));

    try {
        recognition.targetInputId = inputId;
        recognition.start();

        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        ocultarFeedback(feedbackElement);
        mostrarFeedback("Ouvindo...", 'info', feedbackElement);

        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], .modal-mic-btn[data-target="${inputId}"], #ativarVoz[data-target="vozInput"]`);
        const targetButton = clickedButton || (inputId === 'vozInput' ? ativarVoz : null);

        if (targetButton) {
            targetButton.classList.add('recording');
        } else {
             if (inputId === 'vozInput' && ativarVoz) {
                  ativarVoz.classList.add('recording');
             } else {
                  console.warn("Não foi possível encontrar o botão de microfone para o input:", inputId);
             }
        }
    } catch (e) {
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento.", feedbackElement);
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    }
}

// --- Funções de Importação/Exportação/Limpeza ---

function importarDadosXLSX(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (!jsonData || jsonData.length < 1) {
                mostrarFeedbackErro("Planilha vazia ou formato inválido.");
                return;
            }

            const headerRow = jsonData[0].map(h => String(h).toLowerCase().trim());
            const isHeader = ['descrição', 'descricao', 'desc', 'produto', 'item'].includes(headerRow[0]) &&
                             ['quantidade', 'quant', 'qtd'].includes(headerRow[1]);
            const dadosItens = isHeader ? jsonData.slice(1) : jsonData;

            if (dadosItens.length === 0 && isHeader) {
                 mostrarFeedbackErro("Planilha contém apenas cabeçalho.");
                 return;
            }
            if (dadosItens.length === 0 && !isHeader) {
                 mostrarFeedbackErro("Nenhum dado encontrado na planilha.");
                 return;
            }

            let itensImportados = 0;
            let errosImportacao = 0;
            let itensPulados = 0;
            let ultimoItemImportadoSucesso = null;

            dadosItens.forEach((row, index) => {
                if (!Array.isArray(row) || row.length === 0) {
                    console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Linha vazia ou inválida.`);
                    errosImportacao++;
                    return;
                }

                const descricao = String(row[0] || '').trim();
                if (!descricao) {
                     console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Descrição vazia.`);
                     return;
                }

                const quantidadeStr = String(row[1] || '1').trim();
                const valorUnitarioStr = String(row[2] || '0').trim();
                const categoriaPlanilha = String(row[3] || '').trim();

                let quantidade = parseInt(quantidadeStr.replace(/[^\d]/g, ''), 10);
                if (isNaN(quantidade) || quantidade <= 0) {
                    quantidade = 1;
                }
                const valorUnitario = parseNumber(valorUnitarioStr);
                const categoria = categoriaPlanilha || inferirCategoria(descricao);

                const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                if (itemExistenteIndex === -1) {
                     const novoItem = { descricao, quantidade, valorUnitario, categoria };
                     compras.push(novoItem);
                     ultimoItemImportadoSucesso = novoItem;
                     itensImportados++;
                } else {
                     console.warn(`Item "${descricao}" já existe (linha ${index + (isHeader ? 2 : 1)}), importação pulada.`);
                     itensPulados++;
                }
            });

            let feedbackMsg = "";
            if (itensImportados > 0) feedbackMsg += `${itensImportados} itens importados com sucesso! `;
            if (itensPulados > 0) feedbackMsg += `${itensPulados} itens ignorados (já existiam na lista). `;
            if (errosImportacao > 0) feedbackMsg += `${errosImportacao} linhas com erros de formato.`;

            if (itensImportados > 0) {
                atualizarLista();
                salvarDados();
                mostrarFeedbackSucesso(feedbackMsg.trim());
                if (ultimoItemImportadoSucesso) {
                    atualizarPainelUltimoItem(ultimoItemImportadoSucesso);
                }
            } else if (itensPulados > 0 || errosImportacao > 0) {
                 mostrarFeedbackErro(feedbackMsg.trim() || "Nenhum item novo importado.");
            } else {
                 mostrarFeedbackErro("Nenhum item válido encontrado para importar na planilha.");
            }

        } catch (error) {
            console.error("Erro ao ler ou processar o arquivo XLSX:", error);
            mostrarFeedbackErro("Erro ao importar planilha. Verifique o formato do arquivo e os dados.");
        }
    };
    reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        mostrarFeedbackErro("Não foi possível ler o arquivo selecionado.");
    };
    reader.readAsArrayBuffer(file);
}

function processarImportacaoTexto() {
    const texto = textImportArea.value.trim();
    if (!texto) {
        mostrarFeedbackErro("A área de texto está vazia. Cole ou digite os itens.");
        textImportArea.focus();
        return;
    }

    const nomesItens = texto.split(',')
                           .map(item => item.trim())
                           .filter(item => item !== '');

    if (nomesItens.length === 0) {
        mostrarFeedbackErro("Nenhum nome de item válido encontrado (separe por vírgula).");
        textImportArea.focus();
        return;
    }

    let itensAdicionados = 0;
    let itensDuplicados = 0;
    let ultimoItemAdicionadoTexto = null;

    nomesItens.forEach(nomeItem => {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) {
            const categoria = inferirCategoria(nomeItem);
            const novoItem = {
                descricao: nomeItem,
                quantidade: 1,
                valorUnitario: 0,
                categoria: categoria
            };
            compras.push(novoItem);
            ultimoItemAdicionadoTexto = novoItem;
            itensAdicionados++;
        } else {
            console.warn(`Item "${nomeItem}" já existe, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) adicionado(s) à lista de pendentes! `;
        atualizarLista();
        salvarDados();
        if(ultimoItemAdicionadoTexto){
            atualizarPainelUltimoItem(ultimoItemAdicionadoTexto);
        }
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) (já existiam na lista).`;
    }

    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         mostrarFeedbackErro("Não foi possível adicionar itens da lista fornecida.");
    }

    if (modalTextImport) modalTextImport.style.display = 'none';
}

function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens antes de gerar o relatório.");
        return;
    }

    const comprasOrdenadas = [...compras].sort((a, b) => {
         const catAIndex = ordemCategorias.indexOf(a.categoria || 'Outros');
         const catBIndex = ordemCategorias.indexOf(b.categoria || 'Outros');
         if (catAIndex !== catBIndex) {
             if (catAIndex === -1) return 1;
             if (catBIndex === -1) return -1;
             return catAIndex - catBIndex;
         }
         return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
    });

    const dadosParaExportar = comprasOrdenadas.map(item => ({
        'Categoria': item.categoria || 'Outros',
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario || 0,
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0))
    }));

    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Categoria', 'Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Valor Total (R$)']
    });

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = 3; C <= 4; ++C) {
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!worksheet[cell_ref]) continue;
            worksheet[cell_ref].t = 'n';
            worksheet[cell_ref].z = 'R$ #,##0.00';
        }
    }

    XLSX.utils.sheet_add_aoa(worksheet, [
        [],
        ['', '', '', 'Total Geral:', { t: 'n', v: totalGeral, z: 'R$ #,##0.00' }]
    ], { origin: -1 });

    const columnWidths = [
        { wch: 18 },
        { wch: Math.min(60, Math.max(25, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;

    try {
        XLSX.writeFile(workbook, nomeArquivo);
        mostrarFeedbackSucesso("Relatório Excel gerado com sucesso!");
    } catch (error) {
        console.error("Erro ao gerar o arquivo Excel:", error);
        mostrarFeedbackErro("Erro ao gerar o relatório Excel. Verifique as permissões do navegador.");
    }
}

// --- Event Listeners ---

vozInput.addEventListener('input', () => {
    ocultarFeedback();
    awesompleteInstance.evaluate();
});
vozInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !awesompleteInstance.opened) {
        e.preventDefault();
        processarEAdicionarItem(vozInput.value);
    }
});
if (ativarVoz && recognition) {
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput');
     });
     ativarVoz.setAttribute('data-target', 'vozInput');
}
inserirItem.addEventListener('click', () => {
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    }, 50);
});
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    ocultarFeedback();
    awesompleteInstance.close();
    vozInput.focus();
});

const setupDeleteListener = (ulElement) => {
    if (!ulElement) return;
    ulElement.addEventListener('click', (event) => {
        const excluirBtn = event.target.closest('.excluir-item');
        if (excluirBtn) {
            const li = excluirBtn.closest('li');
            if (!li || !li.dataset.index) {
                console.warn("Botão excluir clicado, mas LI ou dataset.index não encontrado.", li);
                return;
            }
            const indexOriginal = parseInt(li.dataset.index, 10);

            if (!isNaN(indexOriginal) && indexOriginal >= 0 && indexOriginal < compras.length) {
                const itemParaExcluir = compras[indexOriginal];
                if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                    li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                    li.style.opacity = '0';
                    li.style.transform = 'translateX(-50px)';
                    li.style.maxHeight = '0';
                    li.style.paddingTop = '0';
                    li.style.paddingBottom = '0';
                    li.style.marginTop = '0';
                    li.style.marginBottom = '0';
                    li.style.borderWidth = '0';

                    compras.splice(indexOriginal, 1);

                    setTimeout(() => {
                        atualizarLista();
                        salvarDados();
                        mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                    }, 400);
                }
            } else {
                console.error("Índice inválido ou dessincronizado para exclusão:", indexOriginal, "Tamanho atual:", compras.length);
                mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
                atualizarLista();
            }
        }
    });
};
setupDeleteListener(listaPendentesUL);
setupDeleteListener(listaComprasUL);

categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

orcamentoInput.addEventListener('input', () => {
    let value = orcamentoInput.value.replace(/[^\d,]/g, '');
     if ((value.match(/,/g) || []).length > 1) {
        value = value.substring(0, value.lastIndexOf(',')) + value.substring(value.lastIndexOf(',') + 1);
     }
    orcamentoInput.value = value;
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});

importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block';
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        mostrarFeedbackErro("Erro ao abrir opções de importação.");
    }
});
if (importChoiceXlsxBtn) {
    importChoiceXlsxBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none';
        if (modalImportInfo) {
            modalImportInfo.style.display = 'block';
            modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             mostrarFeedbackErro("Erro ao abrir informações de importação XLSX.");
        }
    });
}
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file);
            }
            document.body.removeChild(fileInput);
        }, { once: true });
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}
if (importChoiceTextBtn) {
    importChoiceTextBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none';
        if (modalTextImport) {
            textImportArea.value = '';
            modalTextImport.style.display = 'block';
            modalTextImport.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => textImportArea.focus(), 300);
        } else {
             mostrarFeedbackErro("Erro ao abrir importação por texto.");
        }
    });
}
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras e o orçamento?')) {
         if(confirm('Esta ação NÃO PODE SER DESFEITA. Confirma a limpeza total?')){
             compras = [];
             orcamentoInput.value = '';
             salvarDados();
             atualizarLista();
             resetarPainelUltimoItem();
             mostrarFeedbackSucesso('Lista e orçamento limpos com sucesso!');
             categoriaFiltro.value = "";
             verificarOrcamento(0);
         }
    }
});
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

salvarEdicaoBtn.addEventListener('click', () => {
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackModalErro("Nenhum item selecionado para salvar ou índice inválido. Fechando modal.");
         console.error("Tentativa de salvar edição com índice inválido:", itemEditandoIndex);
         fecharModalEdicao();
         atualizarLista();
         return;
     }

     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10);
     const novoValorUnitario = parseNumber(editarValor.value);

     if (!novaDescricao) {
         alert("A descrição não pode ficar vazia.");
         editarDescricao.focus();
         return;
     }
     if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
         alert("A quantidade deve ser um número maior que zero.");
         editarQuantidade.focus();
         return;
     }

     const novaCategoria = inferirCategoria(novaDescricao);
     const itemOriginal = compras[itemEditandoIndex];
     const itemAtualizado = {
         ...itemOriginal,
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
     };

     compras[itemEditandoIndex] = itemAtualizado;
     atualizarPainelUltimoItem(itemAtualizado);
     fecharModalEdicao();
     atualizarLista();
     salvarDados();
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`);
});

document.querySelectorAll('#modalEdicao .mic-btn[data-target="editarDescricao"]').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) {
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition && button) {
         button.disabled = true;
         button.style.cursor = 'not-allowed';
         button.title = "Reconhecimento de voz não suportado";
    }
});

if(editarVozMicBtn && recognition) {
    editarVozMicBtn.addEventListener('click', () => {
        ativarVozParaInput('editarVozInput');
    });
    editarVozMicBtn.setAttribute('data-target', 'editarVozInput');
} else if (editarVozMicBtn) {
     editarVozMicBtn.disabled = true;
     editarVozMicBtn.style.cursor = 'not-allowed';
     editarVozMicBtn.title = "Reconhecimento de voz não suportado";
}

if(processarEdicaoVoz) {
    processarEdicaoVoz.addEventListener('click', processarComandoEdicaoVoz);
}

if(limparEdicaoVoz) {
    limparEdicaoVoz.addEventListener('click', () => {
        editarVozInput.value = '';
        ocultarFeedbackModal();
        editarVozInput.focus();
    });
}
if(editarVozInput) {
    editarVozInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processarComandoEdicaoVoz();
        }
    });
    editarVozInput.addEventListener('input', ocultarFeedbackModal);
}

document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target;
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            if (targetModalId === 'modalEdicao') {
                fecharModalEdicao();
            } else {
                 targetModal.style.display = 'none';
            }
        } else {
             const parentModal = btn.closest('.modal');
             if(parentModal) {
                 if (parentModal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { parentModal.style.display = 'none'; }
             }
        }
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
         if (event.target.id === 'modalEdicao') {
             fecharModalEdicao();
         } else {
             event.target.style.display = 'none';
         }
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        let modalAberto = false;
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modalAberto = true;
                 if (modal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { modal.style.display = 'none'; }
            }
        });
        if (modalAberto && recognition && document.querySelector('.mic-btn.recording, .modal-mic-btn.recording')) {
             try { recognition.stop(); } catch(e) { /* Ignora */ }
             document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             ocultarFeedback();
             ocultarFeedbackModal();
         }
    }
});

// NOVO: Configura os cliques nos botões do navegador flutuante
function setupFloatingNavigatorListeners() {
    if (!floatingNavigator) return;

    const topButton = floatingNavigator.querySelector('.top-button');
    const pendingButton = floatingNavigator.querySelector('.pending-button');
    const pricedButton = floatingNavigator.querySelector('.priced-button');

    if (topButton) {
        topButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (pendingButton) {
        pendingButton.addEventListener('click', (event) => {
            event.preventDefault();
            const targetElement = document.getElementById('listaPendentesContainer');
            if (targetElement && targetElement.offsetParent !== null) { // Verifica se está visível
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mostrarFeedbackErro('A lista de itens pendentes está vazia ou oculta.');
            }
        });
    }

    if (pricedButton) {
        pricedButton.addEventListener('click', (event) => {
            event.preventDefault();
            const targetElement = document.getElementById('listaComprasContainer');
             if (targetElement && targetElement.offsetParent !== null) { // Verifica se está visível
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mostrarFeedbackErro('A lista de itens no carrinho (com preço) está vazia ou oculta.');
            }
        });
    }
}

// NOVO: Listeners para controlar visibilidade do navegador flutuante
window.addEventListener('scroll', toggleFloatingNavigatorVisibility);
window.addEventListener('resize', toggleFloatingNavigatorVisibility);

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorOrcamentoCarregado > 0 ? valorOrcamentoCarregado.toFixed(2).replace('.', ',') : '';

    resetarPainelUltimoItem();
    atualizarLista(); // Exibe as listas e calcula totais inicial

    // --- NOVO: Inicializa o navegador flutuante ---
    setupFloatingNavigatorListeners(); // Configura os cliques
    toggleFloatingNavigatorVisibility(); // Define o estado inicial de visibilidade
    // --- FIM NOVO ---
});
