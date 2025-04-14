// script.js - Minhas Compras de Mercado (Versão com Melhorias Finais)

// --- Seleção de elementos do DOM (Adicionar novos do modal de edição e painel último item) ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback'); // Feedback principal
const listaComprasUL = document.querySelector('#listaCompras');
const listaComprasContainer = document.querySelector('#listaComprasContainer');
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

// --- Novos Seletores para Edição por Voz ---
const editarVozInput = document.getElementById('editarVozInput');
const editarVozMicBtn = document.getElementById('editarVozMicBtn');
const processarEdicaoVoz = document.getElementById('processarEdicaoVoz');
const limparEdicaoVoz = document.getElementById('limparEdicaoVoz');
const editarVozFeedback = document.getElementById('editarVozFeedback'); // Feedback no modal

// Seletores para modal de info de importação XLSX
const modalImportInfo = document.getElementById('modalImportInfo');
const continuarImportBtn = document.getElementById('continuarImport');

// Seletores para novos modais de importação (Escolha e Texto)
const modalImportChoice = document.getElementById('modalImportChoice');
const modalTextImport = document.getElementById('modalTextImport');
const importChoiceXlsxBtn = document.getElementById('importChoiceXlsx');
const importChoiceTextBtn = document.getElementById('importChoiceText');
const textImportArea = document.getElementById('textImportArea');
const processTextImportBtn = document.getElementById('processTextImport');

// --- Seletores para Painel Último Item ---
const painelUltimoItem = document.getElementById('painelUltimoItem');
const ultimoItemInfo = document.getElementById('ultimoItemInfo');

// --- Variáveis Globais ---
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para Autocomplete (Awesomplete) - Mantida
const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Açúcar", "Café", "Sal", "Farinha de Trigo", "Leite", "Ovos",
    "Pão de Forma", "Manteiga", "Queijo", "Presunto", "Frango", "Carne Moída", "Linguiça", "Peixe",
    "Alface", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Maçã", "Banana", "Laranja", "Limão",
    "Sabão em Pó", "Amaciante", "Detergente", "Água Sanitária", "Limpador Multiuso", "Esponja de Aço",
    "Papel Higiênico", "Sabonete", "Shampoo", "Condicionador", "Creme Dental", "Escova de Dentes",
    "Desodorante", "Biscoito", "Refrigerante", "Suco", "Água Mineral", "Iogurte", "Chocolate"
];
// Ordem desejada das categorias para exibição - Mantida
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// --- Funções de Inicialização e Configuração ---
const awesompleteInstance = new Awesomplete(vozInput, {
    list: listaSugestoes,
    minChars: 1,
    maxItems: 7,
    autoFirst: true
});
vozInput.addEventListener('focus', () => {
    // setTimeout(() => awesompleteInstance.evaluate(), 1); // Descomentar se precisar forçar avaliação no foco
});

// --- Funções de Manipulação de Dados ---

// Função para inferir categoria baseado na descrição
function inferirCategoria(descricao) {
    const descLower = descricao.toLowerCase();
    // Palavras-chave para cada categoria (ajuste conforme necessário)
    const alimentosKeys = ['arroz', 'feijão', 'macarrão', 'óleo', 'acucar', 'açúcar', 'cafe', 'café', 'sal', 'farinha', 'leite', 'ovos', 'pão', 'manteiga', 'queijo', 'presunto', 'frango', 'carne', 'linguiça', 'peixe', 'alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'maçã', 'banana', 'laranja', 'limão', 'biscoito', 'refrigerante', 'suco', 'água', 'iogurte', 'chocolate', 'cerveja', 'vinho', 'legume', 'verdura', 'fruta', 'cereal', 'peito', 'sobrecoxa', 'patinho', 'acem', 'picanha', 'tilapia', 'sardinha', 'atum', 'mussarela', 'prato', 'mortadela', 'salame', 'soja'];
    const limpezaKeys = ['sabão', 'amaciante', 'detergente', 'sanitária', 'multiuso', 'limpador', 'esponja', 'desinfetante', 'lustra', 'alcool', 'álcool', 'pano', 'vassoura', 'rodo', 'balde', 'inseticida', 'guardanapo', 'papel toalha'];
    const higieneKeys = ['papel higiênico', 'sabonete', 'shampoo', 'condicionador', 'creme dental', 'pasta de dente', 'escova de dente', 'desodorante', 'fio dental', 'absorvente', 'cotonete', 'barbeador', 'gilete', 'fralda'];

    if (alimentosKeys.some(key => descLower.includes(key))) return 'Alimentos';
    if (limpezaKeys.some(key => descLower.includes(key))) return 'Limpeza';
    if (higieneKeys.some(key => descLower.includes(key))) return 'Higiene Pessoal';
    return 'Outros'; // Categoria padrão
}

// Função para converter texto com vírgula ou ponto para número
function parseNumber(texto) {
    if (!texto || typeof texto !== 'string') return 0;
    // Remove R$, espaços, pontos de milhar e substitui vírgula por ponto
    const numeroLimpo = texto.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
    const valor = parseFloat(numeroLimpo);
    return isNaN(valor) ? 0 : valor; // Retorna 0 se não for um número válido
}

// Função para processar texto de entrada (voz ou digitação) e adicionar item
function processarEAdicionarItem(textoOriginal) {
    if (!textoOriginal || textoOriginal.trim() === '') {
        mostrarFeedbackErro('Digite ou dite alguma informação do item.');
        return;
    }

    const texto = textoOriginal.trim();
    let quantidade = 1; // Padrão
    let valorUnitario = 0; // Padrão
    let descricao = ''; // Começa vazia

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

    if (partes.length > 0 && !Object.values(marcadores).flat().includes(partes[0].toLowerCase().trim())) {
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
                break;
            }
        }

        if (!marcadorEncontrado && parteAtual) {
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
                    }
                    break;
                case 'preco':
                    valorUnitario = parseNumber(parteAtual);
                    break;
                case 'descricao':
                    descricaoColetada.push(parteAtual);
                    break;
                default:
                    if (!tipoAtual) {
                         descricaoColetada.push(parteAtual);
                    }
                    break;
            }
             if (tipoAtual === 'quantidade' || tipoAtual === 'preco') {
                 tipoAtual = null;
             }
        }
    }

    descricao = descricaoColetada.join(' ').trim();

    if (!descricao) {
        if (textoOriginal && partes.length <= 1 && !Object.values(marcadores).flat().includes(textoOriginal.toLowerCase())) {
            descricao = textoOriginal;
        } else {
            mostrarFeedbackErro('A descrição (ou nome) não pode estar vazia. Verifique o comando.');
            return;
        }
    }
     if (quantidade <= 0) {
          quantidade = 1;
     }

    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
        let itemFinal; // Guarda o item que foi adicionado/atualizado

        if (itemExistenteIndex > -1) {
             if (confirm(`"${descricao}" já está na lista com quantidade ${compras[itemExistenteIndex].quantidade}. Deseja somar a nova quantidade (${quantidade}) e atualizar o valor unitário (para R$ ${valorUnitario.toFixed(2).replace('.', ',')})?`)) {
                compras[itemExistenteIndex].quantidade += quantidade;
                if (valorUnitario > 0 || !compras[itemExistenteIndex].valorUnitario || compras[itemExistenteIndex].valorUnitario <= 0) {
                    compras[itemExistenteIndex].valorUnitario = valorUnitario;
                }
                itemFinal = compras[itemExistenteIndex]; // Guarda o item atualizado
            } else {
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus();
                return;
            }
        } else {
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
            itemFinal = novoItem; // Guarda o novo item
        }

        atualizarLista();
        salvarDados();
        vozInput.value = '';
        ocultarFeedback();
        const acaoRealizada = itemExistenteIndex > -1 ? "atualizado" : "adicionado";
        const indexFinal = itemExistenteIndex > -1 ? itemExistenteIndex : compras.length - 1;
        mostrarFeedbackSucesso(`Item "${descricao}" ${acaoRealizada}! (Qtd final: ${compras[indexFinal].quantidade}, Preço: R$ ${compras[indexFinal].valorUnitario.toFixed(2).replace('.', ',')})`);

        atualizarPainelUltimoItem(itemFinal); // Atualiza o painel do último item

        vozInput.focus();

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro('Ocorreu um erro ao processar o item.');
    }
}

// Salva a lista de compras e o orçamento no localStorage
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    const orcamentoValor = orcamentoInput.value;
    localStorage.setItem('orcamento', orcamentoValor);
}

// Carrega a lista de compras e o orçamento do localStorage
function carregarDados() {
    const comprasSalvas = localStorage.getItem('compras');
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (comprasSalvas) {
        compras = JSON.parse(comprasSalvas);
    }
    if (orcamentoSalvo) {
        orcamentoInput.value = orcamentoSalvo;
    }
}

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback (Principal e Modal)
function mostrarFeedback(mensagem, tipo = 'info', elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return; // Segurança
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''} show ${tipo}`;
    elementoFeedback.style.display = 'block';
}
function mostrarFeedbackSucesso(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'success', elementoFeedback); }
function mostrarFeedbackErro(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'error', elementoFeedback); }

function ocultarFeedback(elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return; // Segurança
    elementoFeedback.classList.remove('show');
    setTimeout(() => {
        if (!elementoFeedback.classList.contains('show')) {
            elementoFeedback.style.display = 'none';
            elementoFeedback.textContent = '';
            elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''}`;
        }
    }, 300);
}
// Atalhos para feedback no modal
function mostrarFeedbackModalSucesso(mensagem) { mostrarFeedbackSucesso(mensagem, editarVozFeedback); }
function mostrarFeedbackModalErro(mensagem) { mostrarFeedbackErro(mensagem, editarVozFeedback); }
function ocultarFeedbackModal() { ocultarFeedback(editarVozFeedback); }

// --- Funções para Painel Último Item ---
function atualizarPainelUltimoItem(item) {
    if (!item || !painelUltimoItem || !ultimoItemInfo) return; // Segurança

    const { quantidade, descricao } = item; // Mostra Qtd e Descrição
    let infoTexto = `${quantidade}x ${descricao}`;

    ultimoItemInfo.textContent = infoTexto;
    painelUltimoItem.style.display = 'block'; // Garante visibilidade antes da classe
    // Adiciona a classe 'show' com um pequeno delay para a transição CSS funcionar
    setTimeout(() => {
         painelUltimoItem.classList.add('show');
    }, 10); // Pequeno delay
}

function resetarPainelUltimoItem() {
    if (!painelUltimoItem || !ultimoItemInfo) return; // Segurança
    painelUltimoItem.classList.remove('show');
    // Espera a transição de fade-out antes de esconder e resetar
    setTimeout(() => {
        if (!painelUltimoItem.classList.contains('show')) { // Verifica se ainda está escondido
             painelUltimoItem.style.display = 'none';
             ultimoItemInfo.textContent = 'Nenhum item adicionado recentemente.';
        }
    }, 400); // Tempo da transição CSS (definido em styles.css)
}

// Atualiza a exibição da lista de compras, agrupando por categoria
function atualizarLista() {
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;
    let nomesUnicosCount = 0;
    const tituloLista = listaComprasContainer.querySelector('h2');

    // Atribui índice original para referência segura na edição/exclusão
    compras.forEach((item, index) => item.originalIndex = index);

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Sua lista de compras está vazia.</li>';
        if (tituloLista) tituloLista.style.display = 'none';
    } else {
        if (tituloLista) tituloLista.style.display = 'inline-block';

        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            acc[categoria].push({ ...item }); // Cria cópia para não afetar originalIndex
            return acc;
        }, {});

        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1; // Corrigido para colocar desconhecido B antes
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            // Ordena itens dentro da categoria (Pendentes primeiro, depois alfabético)
            itensDaCategoria.sort((a, b) => {
                const aPendente = !a.valorUnitario || a.valorUnitario <= 0;
                const bPendente = !b.valorUnitario || b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1;
                if (!aPendente && bPendente) return 1;
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
            });

            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria;

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                li.dataset.index = item.originalIndex; // Usa o índice original do array 'compras'

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                if (isPendente) {
                    li.classList.add('item-pendente');
                }

                let buttonClass = isPendente ? "excluir-item sem-valor" : "excluir-item";

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

                // Event listener para editar ao clicar no item (exceto no botão excluir)
                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         // Verifica se o índice é válido no array 'compras' atual
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar); // Chama a função de edição
                         } else {
                              console.error("Índice original inválido para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                              atualizarLista(); // Força atualização se índice estiver dessincronizado
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });
            listaComprasUL.appendChild(categoryGroup);
        });
    }

    // Remove o índice original temporário APÓS renderizar (não é estritamente necessário, mas limpa o objeto)
    // compras.forEach(item => delete item.originalIndex); // Comentado pois o índice é útil para depuração

    aplicarFiltroCategoria(); // Aplica filtro após renderizar

    // --- Cálculos de Totais e Contagens ---
    // Filtra itens COM PREÇO DEFINIDO (maior que zero) ANTES de contar unidades e nomes
    const itensComPreco = compras.filter(item => item.valorUnitario && item.valorUnitario > 0);

    // Calcula total geral (R$) USANDO TODOS os itens
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Calcula contagens USANDO APENAS itens com preço
    totalUnidades = itensComPreco.reduce((sum, item) => sum + item.quantidade, 0);
    nomesUnicosCount = new Set(itensComPreco.map(item => item.descricao.toLowerCase().trim())).size;
    // --- Fim da Modificação ---

    // Atualiza os painéis de total e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosCount; // Usa a contagem filtrada
    contagemUnidadesSpan.textContent = totalUnidades; // Usa a contagem filtrada

    verificarOrcamento(totalGeral); // Orçamento ainda usa o total geral
}

// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');
    let algumGrupoVisivel = false;

    let noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
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
        msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
        msg.classList.add('filtro-sem-resultados');
        listaComprasUL.appendChild(msg);
    }
}

// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        const porcentagemReal = (total / orcamento) * 100;
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

// --- Funções de Edição e Modal ---

// Abre o modal para editar um item específico
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
    }, 350);
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null;
    ocultarFeedbackModal();
}

// Formata o campo de valor MANUAL no modal de edição
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value) {
        let numberValue = parseInt(value, 10) / 100;
        // Tenta formatar, mas usa replace para garantir ponto como separador decimal interno se falhar
        let formattedValue = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        e.target.value = formattedValue.replace('R$', '').trim();
    } else {
        e.target.value = '';
    }
});


// Processa Comando de Voz de Edição (Qtd/Preço)
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
                break;
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
                        tipoAtual = null;
                        continue;
                    }
                    break;
                case 'preco':
                    const valorParseado = parseNumber(parteAtual);
                    if (valorParseado >= 0) { // Permite zerar o preço
                        novoValor = valorParseado;
                        comandoValido = true;
                    } else {
                         mostrarFeedbackModalErro(`Preço inválido: "${parteAtual}".`);
                         tipoAtual = null;
                         continue;
                    }
                    break;
            }
            tipoAtual = null;
        } else if (!marcadorEncontrado && !tipoAtual) {
             console.warn("Ignorando parte inicial inválida no comando de edição:", parteAtual);
        }
    }

    if (comandoValido) {
        let feedbackMsg = "Alterações aplicadas aos campos manuais:";
        if (novaQuantidade !== null) {
            editarQuantidade.value = novaQuantidade; // Atualiza campo manual
            feedbackMsg += ` Qtd=${novaQuantidade}`;
        }
        if (novoValor !== null) {
            // Atualiza campo manual e dispara evento para reformatar
            editarValor.value = novoValor > 0 ? novoValor.toFixed(2).replace('.', ',') : '';
            editarValor.dispatchEvent(new Event('input'));
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
                 targetInput.dispatchEvent(new Event('input'));
            }
            const feedbackElement = targetInputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`, feedbackElement);
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento de voz: ';
        if (event.error == 'no-speech') { errorMsg += 'Nenhuma fala detectada.'; }
        else if (event.error == 'audio-capture') { errorMsg += 'Falha na captura de áudio (verifique permissão).'; }
        else if (event.error == 'not-allowed') { errorMsg += 'Permissão para usar o microfone negada.'; }
        else { errorMsg += event.error; }

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
    });
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Reconhecimento de voz não suportado.", feedbackElement);
        return;
    }
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estiver rodando */ }
    document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));

    try {
        recognition.targetInputId = inputId;
        recognition.start();

        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        ocultarFeedback(feedbackElement);
        mostrarFeedback("Ouvindo...", 'info', feedbackElement);

        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], .modal-mic-btn[data-target="${inputId}"], #ativarVoz`);
        if (clickedButton) {
            clickedButton.classList.add('recording');
        } else {
             console.warn("Não foi possível encontrar o botão de microfone para o input:", inputId);
        }
    } catch (e) {
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento.", feedbackElement);
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    }
}


// --- Funções de Importação/Exportação/Limpeza ---

// Importa dados de arquivo XLSX
function importarDadosXLSX(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (jsonData.length < 1) {
                mostrarFeedbackErro("Planilha vazia ou sem dados válidos.");
                return;
            }

            const dadosItens = jsonData;
            let itensImportados = 0;
            let errosImportacao = 0;
            let itensPulados = 0;
            let ultimoItemImportadoSucesso = null;

            dadosItens.forEach((row, index) => {
                const descricao = String(row[0] || '').trim();
                if (!descricao) {
                     console.warn(`Linha ${index + 1} ignorada: Descrição vazia.`);
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
                     console.warn(`Item "${descricao}" já existe, pulando importação da linha ${index + 1}.`);
                     itensPulados++;
                }
            });

            let feedbackMsg = "";
            if (itensImportados > 0) feedbackMsg += `${itensImportados} itens importados! `;
            if (itensPulados > 0) feedbackMsg += `${itensPulados} ignorados (já existiam). `;
            if (errosImportacao > 0) feedbackMsg += `${errosImportacao} linhas com erros.`;

            if (itensImportados > 0) {
                atualizarLista();
                salvarDados();
                mostrarFeedbackSucesso(feedbackMsg.trim());
                if (ultimoItemImportadoSucesso) {
                    atualizarPainelUltimoItem(ultimoItemImportadoSucesso); // Atualiza painel
                }
            } else if (itensPulados > 0 || errosImportacao > 0) {
                 mostrarFeedbackErro(feedbackMsg.trim() || "Nenhum item novo importado.");
            } else {
                 mostrarFeedbackErro("Nenhum item encontrado para importar na planilha.");
            }

        } catch (error) {
            console.error("Erro ao ler ou processar o arquivo XLSX:", error);
            mostrarFeedbackErro("Erro ao importar planilha. Verifique o formato.");
        }
    };
    reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        mostrarFeedbackErro("Não foi possível ler o arquivo selecionado.");
    };
    reader.readAsArrayBuffer(file);
}

// Processa importação por lista de texto separada por vírgula
function processarImportacaoTexto() {
    const texto = textImportArea.value.trim();
    if (!texto) {
        mostrarFeedbackErro("A área de texto está vazia.");
        textImportArea.focus();
        return;
    }

    const nomesItens = texto.split(',')
                           .map(item => item.trim())
                           .filter(item => item !== '');

    if (nomesItens.length === 0) {
        mostrarFeedbackErro("Nenhum nome de item válido encontrado (separado por vírgula).");
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
            ultimoItemAdicionadoTexto = novoItem; // Guarda o último
            itensAdicionados++;
        } else {
            console.warn(`Item "${nomeItem}" já existe, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) importado(s)! `;
        atualizarLista();
        salvarDados();
        if(ultimoItemAdicionadoTexto){
            atualizarPainelUltimoItem(ultimoItemAdicionadoTexto); // Atualiza painel
        }
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) (já existiam).`;
    }

    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         mostrarFeedbackErro("Não foi possível importar itens da lista.");
    }

    if (modalTextImport) modalTextImport.style.display = 'none';
}

// Gera relatório em Excel (.xlsx)
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia.");
        return;
    }

    const comprasOrdenadas = [...compras].sort((a, b) => {
         const catA = ordemCategorias.indexOf(a.categoria || 'Outros');
         const catB = ordemCategorias.indexOf(b.categoria || 'Outros');
         if (catA !== catB) {
             if (catA === -1) return 1;
             if (catB === -1) return -1;
             return catA - catB;
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
    for (let C = 3; C <= 4; ++C) { // Colunas D e E
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
        { wch: 18 }, { wch: Math.min(60, Math.max(25, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) },
        { wch: 12 }, { wch: 20 }, { wch: 20 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;
    try {
        XLSX.writeFile(workbook, nomeArquivo);
        mostrarFeedbackSucesso("Relatório Excel gerado!");
    } catch (error) {
        console.error("Erro ao gerar o arquivo Excel:", error);
        mostrarFeedbackErro("Erro ao gerar o relatório Excel.");
    }
}


// --- Event Listeners ---

// Input principal e botões associados
vozInput.addEventListener('input', () => {
    ocultarFeedback();
    awesompleteInstance.evaluate();
});
vozInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !awesompleteInstance.opened) {
        processarEAdicionarItem(vozInput.value);
    }
});
if (ativarVoz) {
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput');
     });
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

// Delegação de eventos para excluir item
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        if (!li || !li.dataset.index) {
            console.warn("Botão excluir clicado, mas LI ou dataset.index não encontrado.", li);
            return;
        }
        const index = parseInt(li.dataset.index, 10);

         if (!isNaN(index) && index >= 0 && index < compras.length) {
             const itemParaExcluir = compras[index];
             if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                 // Animação de saída
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-50px)';
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.borderWidth = '0';

                 // Remove do array APÓS iniciar a animação
                 compras.splice(index, 1);

                 setTimeout(() => {
                      atualizarLista(); // Redesenha TUDO para recalcular índices e totais
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                 }, 400); // Tempo da animação CSS
             }
         } else {
             console.error("Índice inválido ou dessincronizado para exclusão:", index, "Tamanho atual:", compras.length);
             mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
             atualizarLista(); // Força atualização
         }
    }
});

// Filtro por categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    salvarDados(); // Salva enquanto digita
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual); // Reverifica com valor formatado
});

// Botões de Ação Superiores e Modais de Importação
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
             mostrarFeedbackErro("Erro ao abrir info de importação XLSX.");
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
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras?')) {
         if(confirm('Esta ação não pode ser desfeita. Confirma a limpeza da lista e do orçamento?')){
             compras = [];
             orcamentoInput.value = '';
             salvarDados();
             atualizarLista();
             resetarPainelUltimoItem(); // Reseta o painel
             mostrarFeedbackSucesso('Lista e orçamento limpos!');
             categoriaFiltro.value = "";
         }
    }
});
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição ---

// Botão Salvar Edição (Principal do Modal)
salvarEdicaoBtn.addEventListener('click', () => {
     // Validação crucial do índice
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackModalErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao();
         return;
     }

     // Pega os valores FINAIS dos campos manuais
     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1;
     const novoValorUnitario = parseNumber(editarValor.value);

     // Validações básicas
     if (!novaDescricao) {
         alert("A descrição não pode ficar vazia.");
         editarDescricao.focus();
         return;
     }
     if (novaQuantidade <= 0) {
         alert("A quantidade deve ser maior que zero.");
         editarQuantidade.focus();
         return;
     }

     const novaCategoria = inferirCategoria(novaDescricao);

     // Cria o objeto do item atualizado para usar em ambas as atualizações (array e painel)
     const itemAtualizado = {
         ...compras[itemEditandoIndex], // Preserva outras propriedades
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
     };

     // Atualiza o item no array 'compras'
     compras[itemEditandoIndex] = itemAtualizado;

     // --- ATUALIZA O PAINEL DE ÚLTIMO ITEM COM O ITEM EDITADO ---
     atualizarPainelUltimoItem(itemAtualizado);
     // --- FIM DA ATUALIZAÇÃO ---

     fecharModalEdicao();
     atualizarLista(); // Atualiza a interface geral
     salvarDados();
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`); // Feedback principal
});

// Microfone da DESCRIÇÃO (Manual dentro do Modal)
document.querySelectorAll('#modalEdicao .mic-btn[data-target="editarDescricao"]').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) {
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition) {
         button.disabled = true;
    }
});

// Listeners para a seção de Edição por Voz (dentro do Modal)
if(editarVozMicBtn && recognition) {
    editarVozMicBtn.addEventListener('click', () => {
        ativarVozParaInput('editarVozInput');
    });
} else if (editarVozMicBtn) {
     editarVozMicBtn.disabled = true;
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
            processarComandoEdicaoVoz();
        }
    });
    editarVozInput.addEventListener('input', ocultarFeedbackModal);
}

// --- Listeners Genéricos para Fechar Modais ---
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target;
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            if (targetModalId === 'modalEdicao') {
                fecharModalEdicao(); // Usa função específica
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
         if (event.target.id === 'modalEdicao') { fecharModalEdicao(); }
         else { event.target.style.display = 'none'; }
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
             try { recognition.stop(); } catch(e) {}
             document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             ocultarFeedback();
             ocultarFeedbackModal();
         }
    }
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    // Formata orçamento carregado
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorOrcamentoCarregado > 0 ? valorOrcamentoCarregado.toFixed(2).replace('.', ',') : '';

    resetarPainelUltimoItem(); // Garante que comece escondido/resetado
    atualizarLista(); // Exibe a lista e calcula totais/orçamento inicial
});
