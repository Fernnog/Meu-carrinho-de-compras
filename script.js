// --- START OF FILE script.js ---

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
    // Garante que o display: block seja aplicado antes da classe show
    painelUltimoItem.style.display = 'block';
    setTimeout(() => {
         painelUltimoItem.classList.add('show');
    }, 10); // Pequeno delay para a transição CSS funcionar
}

function resetarPainelUltimoItem() {
    if (!painelUltimoItem || !ultimoItemInfo) return;
    painelUltimoItem.classList.remove('show');
    setTimeout(() => {
        if (!painelUltimoItem.classList.contains('show')) {
             ultimoItemInfo.textContent = 'Nenhum item adicionado recentemente.';
             // Opcional: Esconder completamente após a animação
             // painelUltimoItem.style.display = 'none';
        }
    }, 400); // Tempo da transição em styles.css
}

function atualizarLista() {
    listaPendentesUL.innerHTML = '';
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidadesConfirmadas = 0;
    let nomesUnicosConfirmadosCount = 0;

    // Não esconder os containers inicialmente, a função de renderização fará isso se necessário
    if(listaPendentesContainer) listaPendentesContainer.style.display = 'block';
    if(listaComprasContainer) listaComprasContainer.style.display = 'block';

    // Garante que cada item tenha seu índice original na lista `compras` atual
    compras.forEach((item, index) => item.originalIndex = index);

    const itensPendentes = compras.filter(item => !item.valorUnitario || item.valorUnitario <= 0);
    const itensConfirmados = compras.filter(item => item.valorUnitario && item.valorUnitario > 0);

    const renderizarGrupoItens = (itens, targetUL, containerDiv, mensagemVazia) => {
        if (itens.length === 0) {
            targetUL.innerHTML = `<li class="lista-vazia">${mensagemVazia}</li>`;
            if (containerDiv) containerDiv.style.display = 'none'; // Esconde o container se não há itens
            return;
        } else {
             if (containerDiv) containerDiv.style.display = 'block'; // Garante que o container esteja visível
        }

        const itensAgrupados = itens.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push({ ...item }); // Copia o item para evitar problemas de referência
            return acc;
        }, {});

        // Ordena as categorias conforme a ordem definida
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'pt-BR'); // Ambas "Outras" ou desconhecidas
            if (indexA === -1) return 1; // Categoria A desconhecida vai para o fim
            if (indexB === -1) return -1; // Categoria B desconhecida vai para o fim
            return indexA - indexB; // Ordena pela ordem definida
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];
            // Ordena itens dentro da categoria alfabeticamente pela descrição
            itensDaCategoria.sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' }));

            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Guarda a categoria no elemento

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                // Usa o originalIndex que foi salvo anteriormente
                li.dataset.index = item.originalIndex;

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                let buttonClass = "excluir-item";
                if (isPendente) {
                    li.classList.add('item-pendente'); // Aplica fundo diferente se pendente
                    buttonClass += " sem-valor"; // Muda cor da lixeira se pendente
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

                // Adiciona evento de clique no LI para edição (evitando o botão excluir)
                li.addEventListener('click', (event) => {
                    // Só edita se o clique NÃO foi no botão de excluir ou seu ícone
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         // Verifica se o índice é válido no array 'compras' atual
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar);
                         } else {
                              // Caso de dessincronização (raro, mas possível)
                              console.error("Índice original inválido ou dessincronizado para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. A lista será atualizada.");
                              atualizarLista(); // Força atualização para resincronizar
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });
            targetUL.appendChild(categoryGroup); // Adiciona o grupo da categoria à lista UL
        });
    };

    // Renderiza as duas listas
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

    // Calcula totais e contagens APÓS a renderização
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidadesConfirmadas = itensConfirmados.reduce((sum, item) => sum + item.quantidade, 0);
    nomesUnicosConfirmadosCount = new Set(itensConfirmados.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza os painéis de informação
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza total oculto
    contagemNomesSpan.textContent = nomesUnicosConfirmadosCount;
    contagemUnidadesSpan.textContent = totalUnidadesConfirmadas;

    aplicarFiltroCategoria(); // Garante que o filtro seja aplicado após atualizar
    verificarOrcamento(totalGeral); // Atualiza a barra de progresso e cores
    toggleFloatingNavigatorVisibility(); // Atualiza visibilidade do navegador flutuante
}


function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;

    const filtrarLista = (ulElement) => {
        if (!ulElement) return; // Sai se a UL não existe

        const todosGrupos = ulElement.querySelectorAll('.category-group');
        const listaVaziaMsg = ulElement.querySelector('.lista-vazia');
        let algumGrupoVisivel = false;

        // Remove mensagem de filtro anterior, se houver
        let noResultsMsg = ulElement.querySelector('.filtro-sem-resultados');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }

        // Se a lista já estava vazia (mensagem original), não faz nada
        if (listaVaziaMsg && !todosGrupos.length) return;

        // Itera sobre os grupos de categoria
        todosGrupos.forEach(grupo => {
            const grupoCategoria = grupo.dataset.category;
            // Mostra o grupo se "Todas" selecionado OU se a categoria bate
            if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
                grupo.classList.remove('hidden');
                algumGrupoVisivel = true;
            } else {
                grupo.classList.add('hidden'); // Esconde o grupo
            }
        });

        // Se NENHUM grupo ficou visível APÓS filtrar (e não era "Todas") E a lista não estava vazia originalmente
        if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
            // Adiciona mensagem de filtro sem resultados
            const msg = document.createElement('li');
            msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}" nesta lista.`;
            msg.classList.add('filtro-sem-resultados');
            ulElement.appendChild(msg);
        }
    };

    // Aplica o filtro para ambas as listas
    filtrarLista(listaPendentesUL);
    filtrarLista(listaComprasUL);
}

function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;
    let porcentagemReal = 0;

    if (orcamento > 0) {
        porcentagemReal = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagemReal, 100); // Limita a barra a 100% visualmente
        barraProgresso.value = porcentagem;

        // Verifica se estourou o orçamento
        if (total > orcamento) {
            progressBarContainer.classList.add('over-budget'); // Aplica estilo de estouro
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`; // Mostra % real
            // Muda cor do painel total para vermelho
            painelTotal.style.backgroundColor = '#f8d7da';
            painelTotal.style.color = '#721c24';
            painelTotal.style.borderColor = '#f5c6cb';
        } else {
            progressBarContainer.classList.remove('over-budget'); // Remove estilo de estouro
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`; // Mostra % limitada a 100
            // Restaura cor do painel total para verde
            painelTotal.style.backgroundColor = '#e9f5e9';
            painelTotal.style.color = '#006400';
            painelTotal.style.borderColor = '#c8e6c9';
        }
    } else {
        // Se não há orçamento definido
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = '0%';
        progressBarContainer.classList.remove('over-budget');
        // Mantém cor verde padrão no painel total
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
    // Validação robusta do índice
    if (index === null || typeof index !== 'number' || isNaN(index) || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição. Tente atualizar a página.");
        return;
    }
    itemEditandoIndex = index; // Guarda o índice do item sendo editado
    const item = compras[index];

    // Preenche os campos do modal com os dados do item
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata o valor para exibição (com vírgula), deixa vazio se for 0
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    // Limpa campo de edição por voz e feedback anterior do modal
    if(editarVozInput) editarVozInput.value = '';
    ocultarFeedbackModal();

    // Exibe o modal
    modalEdicao.style.display = 'block';
    // Rola a página para centralizar o modal (suavemente)
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Coloca o foco no campo de descrição após um pequeno delay (para animação)
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select(); // Seleciona o texto para facilitar a edição
    }, 350); // Delay pode precisar de ajuste
}

function fecharModalEdicao() {
    if (modalEdicao) modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Reseta o índice de edição
    ocultarFeedbackModal(); // Esconde qualquer feedback do modal
}

// Formatação automática do campo de valor no modal de edição
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    // Permite apenas dígitos, vírgula e ponto
    value = value.replace(/[^\d,.]/g, '');
    // Substitui ponto por vírgula para consistência
    value = value.replace(/\./g, ',');
    // Garante que haja apenas uma vírgula
    if ((value.match(/,/g) || []).length > 1) {
        // Remove a última vírgula digitada se já houver uma
        value = value.substring(0, value.lastIndexOf(',')) + value.substring(value.lastIndexOf(',') + 1);
    }
    e.target.value = value;
});

// Formata o valor com duas casas decimais ao sair do campo
editarValor.addEventListener('blur', function(e){
    const valorNumerico = parseNumber(e.target.value); // Converte para número
    // Exibe formatado se > 0, senão deixa vazio
    e.target.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
});

// Processa o comando de voz para editar quantidade e/ou preço no modal
function processarComandoEdicaoVoz() {
    const textoComando = editarVozInput.value.trim();
    if (!textoComando) {
        mostrarFeedbackModalErro("Digite ou dite um comando (Ex: qtd 5 preco 10,50).");
        return;
    }

    let novaQuantidade = null;
    let novoValor = null;
    let comandoValido = false; // Flag para saber se algo foi alterado

    // Definições específicas para o comando de edição
    const marcadoresEdicao = {
        quantidade: ['quantidade', 'quant', 'qtd', 'qt'],
        preco: ['preço', 'preco', 'valor', 'val']
    };
    const numerosPorExtensoEdicao = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
        'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
        // Adicionar mais se necessário
    };

    // Regex para encontrar os marcadores (qtd, preco, etc.)
    const marcadorRegex = new RegExp(`\\b(${
        [...marcadoresEdicao.quantidade, ...marcadoresEdicao.preco].join('|')
    })\\b\\s*`, 'gi');

    // Divide o comando pelas palavras chave
    const partes = textoComando.split(marcadorRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null; // Guarda qual tipo de informação está sendo lida (qtd ou preco)

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();
        let marcadorEncontrado = false;

        // Verifica se a parte atual é um marcador
        for (const [tipo, keywords] of Object.entries(marcadoresEdicao)) {
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo;
                marcadorEncontrado = true;
                continue; // Pula para a próxima parte (que deve ser o valor)
            }
        }

        // Se não for marcador E sabemos qual tipo esperar
        if (!marcadorEncontrado && tipoAtual) {
            switch (tipoAtual) {
                case 'quantidade':
                    let qtdEncontrada = NaN;
                    const matchDigito = parteAtual.match(/\d+/); // Tenta pegar número direto
                    if (matchDigito) {
                        qtdEncontrada = parseInt(matchDigito[0], 10);
                    }
                    // Se não achou dígito, tenta por extenso
                    if (isNaN(qtdEncontrada)) {
                         const parteLowerTrimmed = parteAtual.toLowerCase().trim();
                         if (numerosPorExtensoEdicao.hasOwnProperty(parteLowerTrimmed)) {
                             qtdEncontrada = numerosPorExtensoEdicao[parteLowerTrimmed];
                         }
                    }
                    // Se encontrou uma quantidade válida
                    if (!isNaN(qtdEncontrada) && qtdEncontrada > 0) {
                        novaQuantidade = qtdEncontrada;
                        comandoValido = true;
                    } else {
                        // Feedback de erro se a quantidade não foi reconhecida
                        mostrarFeedbackModalErro(`Quantidade inválida: "${parteAtual}".`);
                    }
                    break;
                case 'preco':
                    const valorParseado = parseNumber(parteAtual); // Usa a função de parse
                    if (valorParseado >= 0) { // Permite preço 0.00
                        novoValor = valorParseado;
                        comandoValido = true;
                    } else {
                         // Feedback de erro se o preço não foi reconhecido
                         mostrarFeedbackModalErro(`Preço inválido: "${parteAtual}".`);
                    }
                    break;
            }
            tipoAtual = null; // Reseta o tipo esperado após ler o valor
        } else if (!marcadorEncontrado && !tipoAtual) {
             // Ignora partes que não são marcadores nem valores esperados
             console.warn("Ignorando parte inválida no comando de edição:", parteAtual);
        }
    }

    // Se alguma alteração válida foi encontrada
    if (comandoValido) {
        let feedbackMsg = "Campos atualizados por voz:";
        // Atualiza o campo de quantidade no formulário se um novo valor foi detectado
        if (novaQuantidade !== null) {
            editarQuantidade.value = novaQuantidade;
            feedbackMsg += ` Qtd=${novaQuantidade}`;
        }
        // Atualiza o campo de valor no formulário se um novo valor foi detectado
        if (novoValor !== null) {
            editarValor.value = novoValor > 0 ? novoValor.toFixed(2).replace('.', ',') : ''; // Formata
            editarValor.dispatchEvent(new Event('blur')); // Dispara evento blur para formatar corretamente
            feedbackMsg += ` Preço=R$ ${novoValor.toFixed(2).replace('.', ',')}`;
        }
        mostrarFeedbackModalSucesso(feedbackMsg); // Mostra o que foi alterado
        editarVozInput.value = ''; // Limpa o input de comando
    } else {
        // Se nenhum comando válido foi encontrado no texto
        mostrarFeedbackModalErro("Nenhum comando válido de quantidade ou preço encontrado.");
    }
}


// --- Funções de Reconhecimento de Voz ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR'; // Define o idioma
    recognition.interimResults = false; // Retorna apenas resultados finais
    recognition.maxAlternatives = 1; // Retorna apenas a melhor alternativa

    // Evento disparado quando o reconhecimento tem um resultado
    recognition.onresult = (event) => {
        // Pega a transcrição do último resultado
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        // Pega o ID do input que estava sendo alvo da voz
        const targetInputId = recognition.targetInputId;
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript; // Coloca o texto ditado no input
            // Se for o campo de valor, dispara o evento blur para formatar
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('blur'));
            }
            // Define qual área de feedback usar (principal ou do modal)
            const feedbackElement = targetInputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`, feedbackElement);
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        // Remove a classe 'recording' de todos os botões de microfone
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Evento disparado em caso de erro no reconhecimento
    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento: ';
        switch (event.error) {
            case 'no-speech': errorMsg += 'Nenhuma fala detectada.'; break;
            case 'audio-capture': errorMsg += 'Falha na captura de áudio (verifique microfone/permissão).'; break;
            case 'not-allowed': errorMsg += 'Permissão para usar o microfone negada.'; break;
            case 'network': errorMsg += 'Erro de rede. Verifique a conexão.'; break;
            default: errorMsg += event.error;
        }

        // Identifica qual feedback mostrar o erro
        const recordingButton = document.querySelector('.mic-btn.recording, .modal-mic-btn.recording');
        const targetId = recordingButton ? (recordingButton.dataset.target || 'vozInput') : 'vozInput';
        const feedbackElement = targetId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro(errorMsg, feedbackElement);

        console.error('Speech recognition error:', event.error);
        // Garante que a classe 'recording' seja removida
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Evento disparado quando o reconhecimento termina (naturalmente ou por stop())
    recognition.onend = () => {
        // Garante que a classe 'recording' seja removida
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    // Se a API não é suportada pelo navegador
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    // Desabilita todos os botões de microfone
    document.querySelectorAll('.mic-btn, .modal-mic-btn').forEach(btn => {
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado";
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
}

// Função para iniciar o reconhecimento de voz para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) { // Verifica se a API está disponível
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Reconhecimento de voz não suportado.", feedbackElement);
        return;
    }

    // Para qualquer gravação anterior e remove a classe 'recording'
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estava gravando */ }
    document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));

    try {
        recognition.targetInputId = inputId; // Guarda qual input receberá o resultado
        recognition.start(); // Inicia o reconhecimento

        // Mostra feedback "Ouvindo..."
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        ocultarFeedback(feedbackElement); // Limpa feedback anterior
        mostrarFeedback("Ouvindo...", 'info', feedbackElement);

        // Encontra o botão de microfone correspondente ao input e adiciona a classe 'recording'
        // Trata o caso especial do botão principal que não tem data-target explícito
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], .modal-mic-btn[data-target="${inputId}"], #ativarVoz[data-target="vozInput"]`);
        const targetButton = clickedButton || (inputId === 'vozInput' ? ativarVoz : null);

        if (targetButton) {
            targetButton.classList.add('recording');
        } else {
             // Caso especial para o botão principal #ativarVoz se não tiver data-target
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
        // Garante que a classe 'recording' seja removida em caso de erro ao iniciar
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
            // Converte para JSON, tratando a primeira linha como dados se não for cabeçalho
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false }); // raw: false para pegar valores formatados

            if (!jsonData || jsonData.length < 1) {
                mostrarFeedbackErro("Planilha vazia ou formato inválido.");
                return;
            }

            // Tenta detectar se a primeira linha é cabeçalho
            const headerRow = jsonData[0].map(h => String(h).toLowerCase().trim());
            const isHeader = ['descrição', 'descricao', 'desc', 'produto', 'item'].includes(headerRow[0]) &&
                             ['quantidade', 'quant', 'qtd'].includes(headerRow[1]); // Checa colunas 1 e 2

            const dadosItens = isHeader ? jsonData.slice(1) : jsonData; // Pula cabeçalho se detectado

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
                // Validação básica da linha
                if (!Array.isArray(row) || row.length === 0) {
                    console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Linha vazia ou inválida.`);
                    errosImportacao++;
                    return;
                }

                const descricao = String(row[0] || '').trim();
                if (!descricao) {
                     console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Descrição vazia.`);
                     // Não incrementa erro, apenas ignora linha sem descrição
                     return;
                }

                // Pega dados das colunas esperadas
                const quantidadeStr = String(row[1] || '1').trim(); // Padrão 1 se vazio
                const valorUnitarioStr = String(row[2] || '0').trim(); // Padrão 0 se vazio
                const categoriaPlanilha = String(row[3] || '').trim(); // Categoria opcional

                // Trata quantidade (remove não dígitos)
                let quantidade = parseInt(quantidadeStr.replace(/[^\d]/g, ''), 10);
                if (isNaN(quantidade) || quantidade <= 0) {
                    quantidade = 1; // Padrão 1 se inválido
                }
                // Trata valor unitário
                const valorUnitario = parseNumber(valorUnitarioStr); // Usa parseNumber para tratar R$, . , etc.
                // Infere categoria se não fornecida
                const categoria = categoriaPlanilha || inferirCategoria(descricao);

                // Verifica se o item já existe na lista (ignorando case)
                const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                if (itemExistenteIndex === -1) {
                     // Adiciona apenas se não existir
                     const novoItem = { descricao, quantidade, valorUnitario, categoria };
                     compras.push(novoItem);
                     ultimoItemImportadoSucesso = novoItem; // Guarda o último adicionado
                     itensImportados++;
                } else {
                     // Informa que o item foi pulado
                     console.warn(`Item "${descricao}" já existe (linha ${index + (isHeader ? 2 : 1)}), importação pulada.`);
                     itensPulados++;
                }
            });

            // Monta o feedback final
            let feedbackMsg = "";
            if (itensImportados > 0) feedbackMsg += `${itensImportados} itens importados com sucesso! `;
            if (itensPulados > 0) feedbackMsg += `${itensPulados} itens ignorados (já existiam na lista). `;
            if (errosImportacao > 0) feedbackMsg += `${errosImportacao} linhas com erros de formato.`;

            if (itensImportados > 0) {
                atualizarLista(); // Atualiza a interface
                salvarDados(); // Salva no localStorage
                mostrarFeedbackSucesso(feedbackMsg.trim());
                if (ultimoItemImportadoSucesso) {
                    atualizarPainelUltimoItem(ultimoItemImportadoSucesso); // Mostra o último no painel
                }
            } else if (itensPulados > 0 || errosImportacao > 0) {
                 // Se só pulou ou teve erros, mostra erro
                 mostrarFeedbackErro(feedbackMsg.trim() || "Nenhum item novo importado.");
            } else {
                 // Se não houve importados, pulados ou erros (planilha vazia ou inválida)
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
    reader.readAsArrayBuffer(file); // Inicia a leitura do arquivo
}

function processarImportacaoTexto() {
    const texto = textImportArea.value.trim();
    if (!texto) {
        mostrarFeedbackErro("A área de texto está vazia. Cole ou digite os itens.");
        textImportArea.focus();
        return;
    }

    // Divide por vírgula, remove espaços extras e filtra itens vazios
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
        // Verifica duplicidade (ignorando case)
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) { // Se não existe
            const categoria = inferirCategoria(nomeItem); // Tenta adivinhar a categoria
            const novoItem = {
                descricao: nomeItem,
                quantidade: 1,      // Quantidade padrão 1
                valorUnitario: 0,   // Valor padrão 0
                categoria: categoria
            };
            compras.push(novoItem);
            ultimoItemAdicionadoTexto = novoItem; // Guarda o último adicionado
            itensAdicionados++;
        } else {
            console.warn(`Item "${nomeItem}" já existe, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    // Monta feedback
    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) adicionado(s) à lista de pendentes! `;
        atualizarLista(); // Atualiza UI
        salvarDados(); // Salva dados
        if(ultimoItemAdicionadoTexto){
            atualizarPainelUltimoItem(ultimoItemAdicionadoTexto); // Mostra último no painel
        }
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) (já existiam na lista).`;
    }

    // Exibe o feedback apropriado
    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        // Se só houve duplicados, mostra como erro/aviso
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         // Se nenhum item foi processado
         mostrarFeedbackErro("Não foi possível adicionar itens da lista fornecida.");
    }

    // Fecha o modal de importação por texto
    if (modalTextImport) modalTextImport.style.display = 'none';
}

function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens antes de gerar o relatório.");
        return;
    }

    // Cria cópia e ordena por categoria e depois descrição
    const comprasOrdenadas = [...compras].sort((a, b) => {
         const catAIndex = ordemCategorias.indexOf(a.categoria || 'Outros');
         const catBIndex = ordemCategorias.indexOf(b.categoria || 'Outros');
         // Ordena pela ordem definida em `ordemCategorias`
         if (catAIndex !== catBIndex) {
             if (catAIndex === -1) return 1; // Categoria desconhecida vai pro fim
             if (catBIndex === -1) return -1;
             return catAIndex - catBIndex;
         }
         // Dentro da mesma categoria, ordena alfabeticamente pela descrição
         return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
    });

    // Mapeia os dados para o formato da planilha
    const dadosParaExportar = comprasOrdenadas.map(item => ({
        'Categoria': item.categoria || 'Outros',
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario || 0,
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0))
    }));

    // Calcula o total geral novamente para incluir no relatório
    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Cria a planilha a partir do JSON
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Categoria', 'Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Valor Total (R$)'] // Define cabeçalhos
    });

    // Formata as colunas de valor como moeda (R$)
    const range = XLSX.utils.decode_range(worksheet['!ref']); // Pega o range da planilha
    for (let C = 3; C <= 4; ++C) { // Colunas D (Valor Unitário) e E (Valor Total) - índice baseado em 0
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Itera pelas linhas de dados (pula cabeçalho)
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!worksheet[cell_ref]) continue; // Pula se a célula não existe
            worksheet[cell_ref].t = 'n'; // Define tipo como número
            worksheet[cell_ref].z = 'R$ #,##0.00'; // Define formato de moeda
        }
    }

    // Adiciona linha com o Total Geral ao final da planilha
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco para separar
        ['', '', '', 'Total Geral:', { t: 'n', v: totalGeral, z: 'R$ #,##0.00' }] // Linha do total
    ], { origin: -1 }); // Adiciona no final

    // Define larguras das colunas (ajuste conforme necessário)
    const columnWidths = [
        { wch: 18 }, // Categoria
        { wch: Math.min(60, Math.max(25, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) }, // Descrição (auto-ajuste limitado)
        { wch: 12 }, // Quantidade
        { wch: 20 }, // Valor Unitário
        { wch: 20 }  // Valor Total
    ];
    worksheet['!cols'] = columnWidths;

    // Cria o workbook e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras"); // Nome da aba

    // Gera o nome do arquivo com a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;

    // Tenta fazer o download do arquivo
    try {
        XLSX.writeFile(workbook, nomeArquivo);
        mostrarFeedbackSucesso("Relatório Excel gerado com sucesso!");
    } catch (error) {
        console.error("Erro ao gerar o arquivo Excel:", error);
        mostrarFeedbackErro("Erro ao gerar o relatório Excel. Verifique as permissões do navegador.");
    }
}

// --- Event Listeners ---

// Input principal (voz/texto)
vozInput.addEventListener('input', () => {
    ocultarFeedback(); // Esconde feedback ao digitar
    awesompleteInstance.evaluate(); // Avalia sugestões do Awesomplete
});
vozInput.addEventListener('keypress', (e) => {
    // Adiciona item ao pressionar Enter (se o Awesomplete não estiver aberto)
    if (e.key === 'Enter' && !awesompleteInstance.opened) {
        e.preventDefault(); // Evita envio de formulário (se houver)
        processarEAdicionarItem(vozInput.value);
    }
});
// Botão de microfone principal
if (ativarVoz && recognition) {
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput'); // Chama função de ativar voz para o input principal
     });
     // Adiciona data-target caso não tenha sido feito no HTML (redundância segura)
     ativarVoz.setAttribute('data-target', 'vozInput');
}
// Botão de adicionar item (+)
inserirItem.addEventListener('click', () => {
    // Rola a tela para garantir que o input esteja visível antes de adicionar
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { // Pequeno delay para garantir que a rolagem termine
        processarEAdicionarItem(vozInput.value);
    }, 50);
});
// Botão de limpar input (X)
limparInput.addEventListener('click', () => {
    vozInput.value = ''; // Limpa o campo
    ocultarFeedback(); // Esconde feedback
    awesompleteInstance.close(); // Fecha sugestões
    vozInput.focus(); // Devolve o foco ao input
});

// Delegação de evento para botões de excluir nas listas
const setupDeleteListener = (ulElement) => {
    if (!ulElement) return;
    ulElement.addEventListener('click', (event) => {
        const excluirBtn = event.target.closest('.excluir-item'); // Encontra o botão de excluir clicado
        if (excluirBtn) {
            const li = excluirBtn.closest('li'); // Encontra o item da lista (LI) pai
            // Verifica se encontrou o LI e se ele tem o data-index
            if (!li || !li.dataset.index) {
                console.warn("Botão excluir clicado, mas LI ou dataset.index não encontrado.", li);
                return;
            }
            const indexOriginal = parseInt(li.dataset.index, 10); // Pega o índice original

            // Verifica se o índice é válido no array 'compras'
            if (!isNaN(indexOriginal) && indexOriginal >= 0 && indexOriginal < compras.length) {
                const itemParaExcluir = compras[indexOriginal]; // Pega o item para mostrar na confirmação
                if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                    // Animação de exclusão (fade out e slide left)
                    li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                    li.style.opacity = '0';
                    li.style.transform = 'translateX(-50px)';
                    li.style.maxHeight = '0';
                    li.style.paddingTop = '0';
                    li.style.paddingBottom = '0';
                    li.style.marginTop = '0';
                    li.style.marginBottom = '0';
                    li.style.borderWidth = '0';

                    // Remove o item do array APÓS iniciar a animação
                    compras.splice(indexOriginal, 1);

                    // Atualiza a lista e salva APÓS a animação terminar
                    setTimeout(() => {
                        atualizarLista(); // Isso removerá o LI do DOM e recalculará tudo
                        salvarDados();
                        mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                    }, 400); // Tempo da animação
                }
            } else {
                // Caso de dessincronização
                console.error("Índice inválido ou dessincronizado para exclusão:", indexOriginal, "Tamanho atual:", compras.length);
                mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
                atualizarLista(); // Força atualização
            }
        }
    });
};
setupDeleteListener(listaPendentesUL); // Configura listener para lista pendente
setupDeleteListener(listaComprasUL); // Configura listener para lista confirmada

// Filtro de categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Input de Orçamento
orcamentoInput.addEventListener('input', () => {
    // Formata o valor enquanto digita (permite apenas números e uma vírgula)
    let value = orcamentoInput.value.replace(/[^\d,]/g, '');
     if ((value.match(/,/g) || []).length > 1) {
        value = value.substring(0, value.lastIndexOf(',')) + value.substring(value.lastIndexOf(',') + 1);
     }
    orcamentoInput.value = value;
    salvarDados(); // Salva o valor (mesmo não formatado)
    // Recalcula a barra de progresso
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    // Formata com duas casas decimais ao sair do campo
    const valorNumerico = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
    salvarDados(); // Salva o valor formatado
    // Recalcula a barra de progresso
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});

// Botão Importar (abre modal de escolha)
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block'; // Mostra modal de escolha
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        mostrarFeedbackErro("Erro ao abrir opções de importação.");
    }
});
// Botão "Arquivo Excel (.xlsx)" no modal de escolha
if (importChoiceXlsxBtn) {
    importChoiceXlsxBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        if (modalImportInfo) {
            modalImportInfo.style.display = 'block'; // Abre modal de info XLSX
            modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             mostrarFeedbackErro("Erro ao abrir informações de importação XLSX.");
        }
    });
}
// Botão "Selecionar Arquivo .xlsx" no modal de info
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none'; // Fecha modal de info
        // Cria um input de arquivo dinamicamente
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"; // Aceita apenas XLSX
        fileInput.style.display = 'none'; // Esconde o input
        fileInput.addEventListener('change', (event) => { // Quando um arquivo é selecionado
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file); // Chama a função de importação
            }
            document.body.removeChild(fileInput); // Remove o input dinâmico
        }, { once: true }); // Listener executa apenas uma vez
        document.body.appendChild(fileInput); // Adiciona ao DOM
        fileInput.click(); // Simula clique para abrir seleção de arquivo
    });
}
// Botão "Lista de Itens (texto)" no modal de escolha
if (importChoiceTextBtn) {
    importChoiceTextBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        if (modalTextImport) {
            textImportArea.value = ''; // Limpa área de texto
            modalTextImport.style.display = 'block'; // Abre modal de texto
            modalTextImport.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => textImportArea.focus(), 300); // Foca na área de texto
        } else {
             mostrarFeedbackErro("Erro ao abrir importação por texto.");
        }
    });
}
// Botão "Adicionar Itens da Lista" no modal de texto
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}
// Botão Limpar Tudo
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    // Dupla confirmação para segurança
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras e o orçamento?')) {
         if(confirm('Esta ação NÃO PODE SER DESFEITA. Confirma a limpeza total?')){
             compras = []; // Esvazia o array
             orcamentoInput.value = ''; // Limpa orçamento
             salvarDados(); // Salva estado vazio
             atualizarLista(); // Atualiza UI (mostrará listas vazias)
             resetarPainelUltimoItem(); // Limpa painel do último item
             mostrarFeedbackSucesso('Lista e orçamento limpos com sucesso!');
             categoriaFiltro.value = ""; // Reseta filtro
             verificarOrcamento(0); // Zera barra de progresso
         }
    }
});
// Botão Relatório
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// Botão Salvar no Modal de Edição
salvarEdicaoBtn.addEventListener('click', () => {
     // Re-valida o índice antes de salvar
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackModalErro("Nenhum item selecionado para salvar ou índice inválido. Fechando modal.");
         console.error("Tentativa de salvar edição com índice inválido:", itemEditandoIndex);
         fecharModalEdicao();
         atualizarLista(); // Atualiza para garantir consistência
         return;
     }

     // Pega os valores dos campos do modal
     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10);
     const novoValorUnitario = parseNumber(editarValor.value); // Usa parseNumber

     // Validações básicas
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
     // Valor unitário 0 é permitido

     const novaCategoria = inferirCategoria(novaDescricao); // Re-infere a categoria caso a descrição mude
     const itemOriginal = compras[itemEditandoIndex];

     // Cria o objeto atualizado (preservando outras propriedades, se houver)
     const itemAtualizado = {
         ...itemOriginal, // Mantém propriedades não editadas
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
     };

     // Atualiza o item no array 'compras'
     compras[itemEditandoIndex] = itemAtualizado;
     atualizarPainelUltimoItem(itemAtualizado); // Mostra item atualizado no painel
     fecharModalEdicao(); // Fecha o modal
     atualizarLista(); // Atualiza a interface
     salvarDados(); // Salva no localStorage
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`);
});

// Listeners para botões de microfone DENTRO do modal de edição
document.querySelectorAll('#modalEdicao .mic-btn[data-target="editarDescricao"], #modalEdicao .modal-mic-btn[data-target="editarDescricao"]').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) {
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition && button) {
         // Desabilita se a API não for suportada
         button.disabled = true;
         button.style.cursor = 'not-allowed';
         button.title = "Reconhecimento de voz não suportado";
    }
});

// Botão de microfone para edição por voz (qtd/preço)
if(editarVozMicBtn && recognition) {
    editarVozMicBtn.addEventListener('click', () => {
        ativarVozParaInput('editarVozInput');
    });
    editarVozMicBtn.setAttribute('data-target', 'editarVozInput'); // Garante data-target
} else if (editarVozMicBtn) {
     // Desabilita se API não suportada
     editarVozMicBtn.disabled = true;
     editarVozMicBtn.style.cursor = 'not-allowed';
     editarVozMicBtn.title = "Reconhecimento de voz não suportado";
}

// Botão de processar comando de voz (check) no modal
if(processarEdicaoVoz) {
    processarEdicaoVoz.addEventListener('click', processarComandoEdicaoVoz);
}

// Botão de limpar comando de voz (X) no modal
if(limparEdicaoVoz) {
    limparEdicaoVoz.addEventListener('click', () => {
        editarVozInput.value = '';
        ocultarFeedbackModal();
        editarVozInput.focus();
    });
}
// Input de comando de voz no modal (processa com Enter)
if(editarVozInput) {
    editarVozInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processarComandoEdicaoVoz();
        }
    });
    // Limpa feedback ao digitar no input de voz do modal
    editarVozInput.addEventListener('input', ocultarFeedbackModal);
}


// Fechar Modais clicando no X (usando data-target)
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target; // Pega o ID do modal alvo do data-target
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            if (targetModalId === 'modalEdicao') {
                fecharModalEdicao(); // Usa função específica para modal de edição
            } else {
                 targetModal.style.display = 'none'; // Fecha outros modais
            }
        } else {
             // Fallback: Tenta fechar o modal pai mais próximo se data-target falhar
             const parentModal = btn.closest('.modal');
             if(parentModal) {
                 if (parentModal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { parentModal.style.display = 'none'; }
             }
        }
    });
});

// Fechar Modais clicando fora do conteúdo
window.addEventListener('click', (event) => {
    // Verifica se o clique foi diretamente no fundo do modal (elemento com classe 'modal')
    if (event.target.classList.contains('modal')) {
         if (event.target.id === 'modalEdicao') {
             fecharModalEdicao(); // Função específica para edição
         } else {
             event.target.style.display = 'none'; // Fecha outros modais
         }
    }
});

// Fechar Modais com a tecla Escape
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        let modalAberto = false;
        // Verifica todos os modais
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') { // Se algum estiver visível
                modalAberto = true;
                 if (modal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { modal.style.display = 'none'; }
            }
        });
        // Se um modal foi fechado pelo ESC e a gravação de voz estava ativa, para a gravação
        if (modalAberto && recognition && document.querySelector('.mic-btn.recording, .modal-mic-btn.recording')) {
             try { recognition.stop(); } catch(e) { /* Ignora erro se não estava gravando */ }
             // Garante remoção da classe 'recording' e esconde feedbacks
             document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             ocultarFeedback();
             ocultarFeedbackModal();
         }
    }
});


// *** FUNÇÃO MODIFICADA PARA FOCAR NO H2 ***
// NOVO: Configura os cliques nos botões do navegador flutuante (Versão ajustada para focar nos H2)
function setupFloatingNavigatorListeners() {
    if (!floatingNavigator) return;

    const topButton = floatingNavigator.querySelector('.top-button');
    const pendingButton = floatingNavigator.querySelector('.pending-button');
    const pricedButton = floatingNavigator.querySelector('.priced-button');

    // Botão para ir ao Topo
    if (topButton) {
        topButton.addEventListener('click', (event) => {
            event.preventDefault(); // Previne comportamento padrão do link #
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo suavemente
        });
    }

    // Botão para ir aos Itens Pendentes (Lixeira Vermelha)
    if (pendingButton) {
        pendingButton.addEventListener('click', (event) => {
            event.preventDefault();
            const containerElement = document.getElementById('listaPendentesContainer');
            // Seleciona o H2 DENTRO do container
            const targetTitle = containerElement ? containerElement.querySelector('h2') : null;

            // Verifica se o CONTAINER está visível E se o TÍTULO (H2) foi encontrado dentro dele
            if (containerElement && targetTitle && containerElement.offsetParent !== null) {
                // Aplica o scrollIntoView no TÍTULO (H2), alinhando ao topo da viewport
                targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Fallback: Se container ou título não existem/visíveis, vai para o topo e avisa
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mostrarFeedbackErro('A lista de itens pendentes está vazia ou oculta.');
            }
        });
    }

    // Botão para ir aos Itens no Carrinho/Confirmados (Lixeira Verde)
    if (pricedButton) {
        pricedButton.addEventListener('click', (event) => {
            event.preventDefault();
            const containerElement = document.getElementById('listaComprasContainer');
            // Seleciona o H2 DENTRO do container
            const targetTitle = containerElement ? containerElement.querySelector('h2') : null;

            // Verifica se o CONTAINER está visível E se o TÍTULO (H2) foi encontrado dentro dele
            if (containerElement && targetTitle && containerElement.offsetParent !== null) {
                 // Aplica o scrollIntoView no TÍTULO (H2), alinhando ao topo da viewport
                targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                 // Fallback: Se container ou título não existem/visíveis, vai para o topo e avisa
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mostrarFeedbackErro('A lista de itens no carrinho (com preço) está vazia ou oculta.');
            }
        });
    }
}
// *** FIM DA FUNÇÃO MODIFICADA ***


// NOVO: Listeners para controlar visibilidade do navegador flutuante na rolagem e redimensionamento
window.addEventListener('scroll', toggleFloatingNavigatorVisibility);
window.addEventListener('resize', toggleFloatingNavigatorVisibility);

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega dados do localStorage

    // Formata o valor do orçamento carregado
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorOrcamentoCarregado > 0 ? valorOrcamentoCarregado.toFixed(2).replace('.', ',') : '';

    resetarPainelUltimoItem(); // Garante que o painel do último item comece limpo
    atualizarLista(); // Exibe as listas, calcula totais e aplica filtros iniciais

    // --- NOVO: Inicializa o navegador flutuante ---
    setupFloatingNavigatorListeners(); // Configura os cliques dos botões flutuantes
    toggleFloatingNavigatorVisibility(); // Define o estado inicial de visibilidade do navegador
    // --- FIM NOVO ---
});

// --- END OF FILE script.js ---
