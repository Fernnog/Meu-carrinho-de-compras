// script.js - Minhas Compras de Mercado (Versão com Separação Pendentes/Confirmados)

// --- Seleção de elementos do DOM (Adicionar novos containers/listas) ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback'); // Feedback principal
// **NOVOS** Seletores para a lista de Pendentes
const listaPendentesContainer = document.querySelector('#listaPendentesContainer');
const listaPendentesUL = document.querySelector('#listaPendentes');
// Seletores para a lista Confirmada (Itens no Carrinho)
const listaComprasContainer = document.querySelector('#listaComprasContainer');
const listaComprasUL = document.querySelector('#listaCompras');
// --- Fim Novos Seletores ---
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

    // Começa assumindo descrição se não encontrar marcador inicial
    if (partes.length > 0 && !Object.values(marcadores).flat().some(m => partes[0].toLowerCase().trim().startsWith(m))) {
        tipoAtual = 'descricao';
        descricaoColetada.push(partes[0].trim());
    }

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();

        let marcadorEncontrado = false;
        for (const [tipo, keywords] of Object.entries(marcadores)) {
            // Verifica se a parte ATUAL é um marcador
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo;
                marcadorEncontrado = true;
                // Se encontrou marcador, o próximo item é o valor, não continue neste loop
                continue;
            }
        }

        // Se NÃO for um marcador e tivermos um tipoAtual definido (ou seja, é o valor do marcador anterior)
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
                    // Atualiza quantidade e reseta tipoAtual
                    if (!isNaN(qtdEncontrada) && qtdEncontrada > 0) {
                        quantidade = qtdEncontrada;
                    } else {
                        console.warn(`Não foi possível parsear quantidade: "${parteAtual}". Usando padrão 1.`);
                        quantidade = 1; // Garante que seja pelo menos 1
                    }
                    tipoAtual = null; // Processou o valor da quantidade
                    break;
                case 'preco':
                    valorUnitario = parseNumber(parteAtual);
                    tipoAtual = null; // Processou o valor do preço
                    break;
                case 'descricao':
                    // Se o tipo atual ainda é descrição, continua coletando
                    descricaoColetada.push(parteAtual);
                    // Não reseta tipoAtual aqui, pode haver mais partes da descrição
                    break;
            }
        // Se não for marcador e não tiver tipoAtual, assume que é parte da descrição inicial
        } else if (!marcadorEncontrado && !tipoAtual) {
             if (descricaoColetada.length === 0 && i === 0) { // Só adiciona a primeira parte se ainda não foi coletada
                descricaoColetada.push(parteAtual);
             } else if (descricaoColetada.length > 0){ // Adiciona partes subsequentes à descrição se já começou
                 descricaoColetada.push(parteAtual);
             }
        }
    }

    descricao = descricaoColetada.join(' ').trim();

    // Validação final da descrição
    if (!descricao) {
        mostrarFeedbackErro('A descrição (ou nome) não pode estar vazia. Verifique o comando.');
        return;
    }
    // Garante quantidade mínima
    if (quantidade <= 0) {
        quantidade = 1;
    }

    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
        let itemFinal; // Guarda o item que foi adicionado/atualizado

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
            // Não precisa confirmar se apenas adicionou preço
            if (precoAdicionado) {
                 mensagemConfirmacao += `Preço R$ ${valorUnitario.toFixed(2).replace('.', ',')} adicionado. `;
            }

            mensagemConfirmacao += `Deseja somar a nova quantidade (${quantidade})?`;

            // Só pergunta se precisar confirmar (mudança de preço ou remoção)
            if (precisaConfirmar && !confirm(mensagemConfirmacao)) {
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus();
                return;
            }

            // Executa a atualização
            compras[itemExistenteIndex].quantidade += quantidade;
            // Atualiza o valor apenas se o novo valor for > 0 OU se o valor existente era <= 0 (ou se foi confirmado)
            if (valorUnitario > 0 || valorExistenteZero || (precoRemovido && !precisaConfirmar /* Caso não tenha perguntado */) ) {
                compras[itemExistenteIndex].valorUnitario = valorUnitario;
            }
             // Se o novo valor for 0 e o existente era > 0, e o usuário confirmou (se necessário), remove o preço
            else if (valorNovoZero && !valorExistenteZero && (!precisaConfirmar || (precisaConfirmar && confirm(mensagemConfirmacao /* já perguntou antes, mas confirma de novo? Ou só executa? */) )) ) {
                // A lógica do confirm já foi feita antes, então aqui apenas executa
                 compras[itemExistenteIndex].valorUnitario = 0;
            }

            // Garante que a categoria seja atualizada
            compras[itemExistenteIndex].categoria = inferirCategoria(compras[itemExistenteIndex].descricao);
            itemFinal = compras[itemExistenteIndex]; // Guarda o item atualizado

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
        // Mostra o preço final no feedback, mesmo que seja 0,00 para clareza
        const precoFinalFeedback = compras[indexFinal].valorUnitario !== undefined ? compras[indexFinal].valorUnitario.toFixed(2).replace('.', ',') : '0,00';
        mostrarFeedbackSucesso(`Item "${descricao}" ${acaoRealizada}! (Qtd: ${compras[indexFinal].quantidade}, Preço: R$ ${precoFinalFeedback})`);

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
        // Garante que itens antigos sem categoria ou com erros recebam uma
        compras.forEach(item => {
            if (!item.categoria || typeof item.categoria !== 'string') {
                item.categoria = inferirCategoria(item.descricao || '');
            }
             // Garante que valorUnitario seja número
            if (item.valorUnitario === undefined || item.valorUnitario === null || isNaN(parseFloat(item.valorUnitario))) {
                 item.valorUnitario = 0;
            } else {
                 item.valorUnitario = parseFloat(item.valorUnitario);
            }
             // Garante que quantidade seja número > 0
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

// Funções de Feedback (Principal e Modal)
function mostrarFeedback(mensagem, tipo = 'info', elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return; // Segurança
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''} show ${tipo}`;
    // elementoFeedback.style.display = 'block'; // Classe 'show' já faz isso se tiver display:block/flex etc
}
function mostrarFeedbackSucesso(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'success', elementoFeedback); }
function mostrarFeedbackErro(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'error', elementoFeedback); }

function ocultarFeedback(elementoFeedback = vozFeedback) {
    if (!elementoFeedback) return; // Segurança
    elementoFeedback.classList.remove('show');
    // O CSS deve cuidar de esconder o elemento quando a classe 'show' for removida
    // setTimeout(() => {
    //     if (!elementoFeedback.classList.contains('show')) {
    //         // elementoFeedback.style.display = 'none'; // Deixar CSS fazer isso
    //         elementoFeedback.textContent = '';
    //         elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''}`;
    //     }
    // }, 300); // Tempo da transição CSS
}
// Atalhos para feedback no modal
function mostrarFeedbackModalSucesso(mensagem) { mostrarFeedbackSucesso(mensagem, editarVozFeedback); }
function mostrarFeedbackModalErro(mensagem) { mostrarFeedbackErro(mensagem, editarVozFeedback); }
function ocultarFeedbackModal() { ocultarFeedback(editarVozFeedback); }

// --- Funções para Painel Último Item ---
function atualizarPainelUltimoItem(item) {
    if (!item || !painelUltimoItem || !ultimoItemInfo) return;

    const { quantidade, descricao } = item;
    let infoTexto = `${quantidade}x ${descricao}`;

    ultimoItemInfo.textContent = infoTexto;
    // painelUltimoItem.style.display = 'block'; // Deixar CSS fazer com a classe 'show'
    // Adiciona a classe 'show' com um pequeno delay para a transição CSS funcionar
    // O delay não é estritamente necessário se o display inicial for none e a transição for na opacidade/altura
    setTimeout(() => {
         painelUltimoItem.classList.add('show');
    }, 10);
}

function resetarPainelUltimoItem() {
    if (!painelUltimoItem || !ultimoItemInfo) return;
    painelUltimoItem.classList.remove('show');
    // Espera a transição de fade-out antes de resetar o texto (se necessário)
    // O CSS deve esconder o elemento via opacity: 0 / max-height: 0
    setTimeout(() => {
        // Verifica se ainda está escondido (caso haja múltiplas chamadas rápidas)
        if (!painelUltimoItem.classList.contains('show')) {
             ultimoItemInfo.textContent = 'Nenhum item adicionado recentemente.';
             // painelUltimoItem.style.display = 'none'; // CSS deve cuidar disso
        }
    }, 400); // Tempo da transição CSS (opacity/max-height)
}

// *** FUNÇÃO CENTRAL DE ATUALIZAÇÃO DA LISTA - REESCRITA ***
function atualizarLista() {
    listaPendentesUL.innerHTML = ''; // Limpa lista de pendentes
    listaComprasUL.innerHTML = '';   // Limpa lista de confirmados (com preço)
    let totalGeral = 0;
    let totalUnidadesConfirmadas = 0;
    let nomesUnicosConfirmadosCount = 0;

    // Garante que containers estejam visíveis por padrão antes de verificar se estão vazios
    if(listaPendentesContainer) listaPendentesContainer.style.display = 'block';
    if(listaComprasContainer) listaComprasContainer.style.display = 'block';


    // Atribui índice original para referência segura na edição/exclusão
    compras.forEach((item, index) => item.originalIndex = index);

    // Separa os itens
    const itensPendentes = compras.filter(item => !item.valorUnitario || item.valorUnitario <= 0);
    const itensConfirmados = compras.filter(item => item.valorUnitario && item.valorUnitario > 0);

    // Função auxiliar para renderizar um grupo de itens (pendentes ou confirmados)
    const renderizarGrupoItens = (itens, targetUL, containerDiv, mensagemVazia) => {
        if (itens.length === 0) {
            targetUL.innerHTML = `<li class="lista-vazia">${mensagemVazia}</li>`;
            if (containerDiv) containerDiv.style.display = 'none'; // Esconde o container inteiro se vazio
            return; // Sai da função se não há itens para renderizar
        } else {
             if (containerDiv) containerDiv.style.display = 'block'; // Garante que o container esteja visível
        }

        const itensAgrupados = itens.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros'; // Garante uma categoria
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push({ ...item }); // Copia para não afetar originalIndex
            return acc;
        }, {});

        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            // Ordena por ordem definida, depois alfabeticamente
            if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'pt-BR');
            if (indexA === -1) return 1; // Categorias não listadas vão para o fim
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];
            // Ordena alfabeticamente dentro da categoria
            itensDaCategoria.sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' }));

            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Adiciona categoria ao grupo

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                // Guarda o índice ORIGINAL do item no array 'compras'
                li.dataset.index = item.originalIndex;

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                let buttonClass = "excluir-item"; // Classe base
                if (isPendente) {
                    // Adiciona classe para fundo rosa (se houver no CSS, senão apenas visual)
                    li.classList.add('item-pendente');
                    buttonClass += " sem-valor"; // Adiciona classe para lixeira vermelha
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

                // Event listener para editar ao clicar no item (exceto no botão excluir)
                li.addEventListener('click', (event) => {
                    // Garante que o clique não foi no botão de excluir ou seu ícone
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         // Valida se o índice existe no array principal 'compras'
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar); // Chama a função de edição com o índice original
                         } else {
                              console.error("Índice original inválido ou dessincronizado para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. A lista será atualizada.");
                              atualizarLista(); // Força atualização
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });
            targetUL.appendChild(categoryGroup); // Adiciona o grupo à UL correta
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

    // Remove o índice original temporário APÓS renderizar (opcional, mas limpa o objeto)
    // compras.forEach(item => delete item.originalIndex);

    // --- Cálculos de Totais e Contagens ---
    // Total Geral (R$) considera TODOS os itens, mesmo os pendentes (com valor 0)
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Contagem de unidades e nomes únicos considera APENAS itens CONFIRMADOS (com preço)
    totalUnidadesConfirmadas = itensConfirmados.reduce((sum, item) => sum + item.quantidade, 0);
    nomesUnicosConfirmadosCount = new Set(itensConfirmados.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza os painéis de total e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosConfirmadosCount; // Contagem de nomes CONFIRMADOS
    contagemUnidadesSpan.textContent = totalUnidadesConfirmadas; // Contagem de unidades CONFIRMADAS

    aplicarFiltroCategoria(); // Aplica filtro às DUAS listas após renderizar
    verificarOrcamento(totalGeral); // Verifica orçamento com o total GERAL
}


// Função para aplicar o filtro de categoria (mostrar/ocultar grupos) - ADAPTADA
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;

    // Função auxiliar para filtrar uma lista específica (UL)
    const filtrarLista = (ulElement) => {
        if (!ulElement) return; // Segurança

        const todosGrupos = ulElement.querySelectorAll('.category-group');
        const listaVaziaMsg = ulElement.querySelector('.lista-vazia');
        let algumGrupoVisivel = false;

        // Remove mensagem de filtro anterior, se houver
        let noResultsMsg = ulElement.querySelector('.filtro-sem-resultados');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }

        // Se a lista original já estava vazia, não faz nada
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

        // Adiciona mensagem se nenhum grupo ficou visível após filtrar
        if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
            const msg = document.createElement('li');
            msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}" nesta lista.`;
            msg.classList.add('filtro-sem-resultados');
            ulElement.appendChild(msg);
        }
    };

    // Aplica o filtro a ambas as listas
    filtrarLista(listaPendentesUL);
    filtrarLista(listaComprasUL);
}


// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;
    let porcentagemReal = 0; // Para o texto quando estourar

    if (orcamento > 0) {
        porcentagemReal = (total / orcamento) * 100;
        // A barra de progresso visual só vai até 100%
        porcentagem = Math.min(porcentagemReal, 100);
        barraProgresso.value = porcentagem;

        if (total > orcamento) {
            progressBarContainer.classList.add('over-budget');
            // Mostra a porcentagem real, mesmo acima de 100%
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`;
            painelTotal.style.backgroundColor = '#f8d7da'; // Vermelho claro
            painelTotal.style.color = '#721c24';          // Vermelho escuro
            painelTotal.style.borderColor = '#f5c6cb';    // Borda vermelha
        } else {
            progressBarContainer.classList.remove('over-budget');
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`;
            painelTotal.style.backgroundColor = '#e9f5e9'; // Verde claro (padrão)
            painelTotal.style.color = '#006400';          // Verde escuro (padrão)
            painelTotal.style.borderColor = '#c8e6c9';    // Borda verde (padrão)
        }
    } else {
        // Se não há orçamento, reseta a barra e o painel total
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = '0%';
        progressBarContainer.classList.remove('over-budget');
        painelTotal.style.backgroundColor = '#e9f5e9'; // Verde claro (padrão)
        painelTotal.style.color = '#006400';          // Verde escuro (padrão)
        painelTotal.style.borderColor = '#c8e6c9';    // Borda verde (padrão)
    }
}

// --- Funções de Edição e Modal ---

// Abre o modal para editar um item específico
function editarItem(index) {
    // Valida o índice recebido contra o array 'compras'
    if (index === null || typeof index !== 'number' || isNaN(index) || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição. Tente atualizar a página.");
        return;
    }
    itemEditandoIndex = index; // Guarda o índice ORIGINAL
    const item = compras[index]; // Pega o item original

    // Preenche os campos do modal com os dados do item
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata o valor para exibição no campo (ou deixa vazio se for 0)
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    // Limpa campos e feedback da edição por voz
    if(editarVozInput) editarVozInput.value = '';
    ocultarFeedbackModal();

    // Exibe o modal
    modalEdicao.style.display = 'block';
    // Rola a página para centralizar o modal (útil em mobile)
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Foca no campo de descrição após um pequeno delay para garantir que o modal esteja visível
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select(); // Seleciona o texto para facilitar a edição
    }, 350);
}

// Fecha o modal de edição
function fecharModalEdicao() {
    if (modalEdicao) modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Reseta o índice de edição
    ocultarFeedbackModal(); // Limpa o feedback do modal
}

// Formata o campo de valor MANUAL no modal de edição enquanto digita
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    // Permite vírgula e ponto temporariamente para digitação, mas remove outros não-dígitos
    value = value.replace(/[^\d,.]/g, '');
    // Substitui ponto por vírgula para consistência, exceto se for o último caractere
    value = value.replace(/\./g, ',');
    // Remove múltiplas vírgulas, mantendo apenas a última (se houver)
    if ((value.match(/,/g) || []).length > 1) {
        value = value.replace(/,(?=[^,]*$)/, ''); // Remove todas menos a última
    }
    // Atualiza o valor do input
    e.target.value = value;
});

// Formata o valor no campo de valor MANUAL ao perder o foco
editarValor.addEventListener('blur', function(e){
    const valorNumerico = parseNumber(e.target.value); // Usa parseNumber para converter
    e.target.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : ''; // Formata para exibição
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

    // Regex para encontrar marcadores (quantidade, preço, etc.)
    const marcadorRegex = new RegExp(`\\b(${
        [...marcadoresEdicao.quantidade, ...marcadoresEdicao.preco].join('|')
    })\\b\\s*`, 'gi');

    // Divide o comando com base nos marcadores
    const partes = textoComando.split(marcadorRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null;

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();
        let marcadorEncontrado = false;

        // Verifica se a parte atual é um marcador conhecido
        for (const [tipo, keywords] of Object.entries(marcadoresEdicao)) {
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo; // Define o tipo esperado para a próxima parte
                marcadorEncontrado = true;
                continue; // Pula para a próxima parte (que deve ser o valor)
            }
        }

        // Se não for um marcador E temos um tipoAtual definido (ou seja, esta parte é o VALOR)
        if (!marcadorEncontrado && tipoAtual) {
            switch (tipoAtual) {
                case 'quantidade':
                    let qtdEncontrada = NaN;
                    const matchDigito = parteAtual.match(/\d+/); // Tenta encontrar dígitos
                    if (matchDigito) {
                        qtdEncontrada = parseInt(matchDigito[0], 10);
                    }
                    // Se não encontrou dígitos, tenta por extenso
                    if (isNaN(qtdEncontrada)) {
                         const parteLowerTrimmed = parteAtual.toLowerCase().trim();
                         if (numerosPorExtensoEdicao.hasOwnProperty(parteLowerTrimmed)) {
                             qtdEncontrada = numerosPorExtensoEdicao[parteLowerTrimmed];
                         }
                    }
                    // Valida e armazena a quantidade
                    if (!isNaN(qtdEncontrada) && qtdEncontrada > 0) {
                        novaQuantidade = qtdEncontrada;
                        comandoValido = true; // Marcou que um comando válido foi processado
                    } else {
                        mostrarFeedbackModalErro(`Quantidade inválida: "${parteAtual}".`);
                    }
                    break; // Sai do switch
                case 'preco':
                    const valorParseado = parseNumber(parteAtual); // Usa a função parseNumber
                    // Valida e armazena o preço (permite 0)
                    if (valorParseado >= 0) {
                        novoValor = valorParseado;
                        comandoValido = true; // Marcou que um comando válido foi processado
                    } else {
                         mostrarFeedbackModalErro(`Preço inválido: "${parteAtual}".`);
                    }
                    break; // Sai do switch
            }
            tipoAtual = null; // Reseta o tipo atual após processar o valor
        } else if (!marcadorEncontrado && !tipoAtual) {
             // Ignora partes que não são marcadores nem valores esperados
             console.warn("Ignorando parte inválida no comando de edição:", parteAtual);
        }
    }

    // Se algum comando válido foi processado, atualiza os campos manuais
    if (comandoValido) {
        let feedbackMsg = "Campos atualizados por voz:";
        if (novaQuantidade !== null) {
            editarQuantidade.value = novaQuantidade; // Atualiza campo manual de quantidade
            feedbackMsg += ` Qtd=${novaQuantidade}`;
        }
        if (novoValor !== null) {
            // Atualiza campo manual de valor e dispara evento para reformatar
            editarValor.value = novoValor > 0 ? novoValor.toFixed(2).replace('.', ',') : '';
            // Dispara o evento 'blur' para aplicar a formatação definida no listener dele
            editarValor.dispatchEvent(new Event('blur'));
            feedbackMsg += ` Preço=R$ ${novoValor.toFixed(2).replace('.', ',')}`;
        }
        mostrarFeedbackModalSucesso(feedbackMsg);
        editarVozInput.value = ''; // Limpa o campo de comando de voz
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

    // Evento disparado quando um resultado é obtido
    recognition.onresult = (event) => {
        // Pega a transcrição do último resultado
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        // Pega o ID do input alvo que foi definido ao iniciar o reconhecimento
        const targetInputId = recognition.targetInputId;
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript; // Preenche o input com o texto ditado
            // Se for o campo de valor no modal, dispara 'blur' para formatar
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('blur'));
            }
             // Se for o campo de comando de edição, apenas preenche
            if (targetInput === editarVozInput) {
                // O usuário ainda precisa clicar em "Processar" (check)
            }
            // Se for o input principal, apenas preenche (usuário clica em + ou Enter)
            if (targetInput === vozInput) {
                // O usuário clica em '+' ou Enter
            }
            // Mostra feedback de sucesso no local apropriado (modal ou principal)
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

        // Determina onde mostrar o erro (modal ou principal)
        const recordingButton = document.querySelector('.mic-btn.recording, .modal-mic-btn.recording');
        const targetId = recordingButton ? (recordingButton.dataset.target || 'vozInput') : 'vozInput'; // Assume principal se não achar botão
        const feedbackElement = targetId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro(errorMsg, feedbackElement);

        console.error('Speech recognition error:', event.error);
        // Remove a classe 'recording'
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Evento disparado quando o reconhecimento termina (mesmo com erro ou sem fala)
    recognition.onend = () => {
        // Garante que a classe 'recording' seja removida
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    // Se a API não for suportada pelo navegador
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    // Desabilita todos os botões de microfone
    document.querySelectorAll('.mic-btn, .modal-mic-btn').forEach(btn => {
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado";
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Reconhecimento de voz não suportado.", feedbackElement);
        return;
    }

    // Para qualquer reconhecimento anterior em andamento e remove indicadores visuais
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estiver rodando */ }
    document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));

    try {
        recognition.targetInputId = inputId; // Define qual input receberá o resultado
        recognition.start(); // Inicia o reconhecimento

        // Mostra feedback "Ouvindo..."
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        ocultarFeedback(feedbackElement); // Limpa feedback anterior
        mostrarFeedback("Ouvindo...", 'info', feedbackElement);

        // Adiciona classe 'recording' ao botão clicado
        // Busca o botão específico para o input alvo ou o botão principal se for o caso
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], .modal-mic-btn[data-target="${inputId}"], #ativarVoz[data-target="vozInput"]`);
        // Se não encontrar por data-target, tenta pelo ID padrão do botão principal
        const targetButton = clickedButton || (inputId === 'vozInput' ? ativarVoz : null);

        if (targetButton) {
            targetButton.classList.add('recording');
        } else {
             // Fallback para o botão do microfone principal se o input for o vozInput
             if (inputId === 'vozInput' && ativarVoz) {
                  ativarVoz.classList.add('recording');
             } else {
                  console.warn("Não foi possível encontrar o botão de microfone para o input:", inputId);
             }
        }
    } catch (e) {
        // Captura erros ao iniciar (ex: reconhecimento já ativo)
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento.", feedbackElement);
        // Garante remoção da classe 'recording' em caso de falha ao iniciar
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
            // header: 1 -> lê como array de arrays; defval: "" -> células vazias viram string vazia; raw: false -> formata datas/numeros
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (!jsonData || jsonData.length < 1) { // Verifica se jsonData é válido e tem linhas
                mostrarFeedbackErro("Planilha vazia ou formato inválido.");
                return;
            }

            // Pula a primeira linha se parecer um cabeçalho comum
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
                // Garante que a linha seja um array e tenha pelo menos uma coluna
                if (!Array.isArray(row) || row.length === 0) {
                    console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Linha vazia ou inválida.`);
                    errosImportacao++;
                    return;
                }

                const descricao = String(row[0] || '').trim();
                // Pula linha se a descrição for vazia
                if (!descricao) {
                     console.warn(`Linha ${index + (isHeader ? 2 : 1)} ignorada: Descrição vazia.`);
                     // Não conta como erro, apenas pula
                     return;
                }

                // Colunas opcionais: Quantidade (padrão 1), Valor (padrão 0), Categoria (padrão inferido)
                const quantidadeStr = String(row[1] || '1').trim();
                const valorUnitarioStr = String(row[2] || '0').trim();
                const categoriaPlanilha = String(row[3] || '').trim();

                // Processa quantidade (ignora não-dígitos, padrão 1 se inválido)
                let quantidade = parseInt(quantidadeStr.replace(/[^\d]/g, ''), 10);
                if (isNaN(quantidade) || quantidade <= 0) {
                    quantidade = 1;
                }
                // Processa valor unitário (usa parseNumber)
                const valorUnitario = parseNumber(valorUnitarioStr);
                // Determina categoria (usa da planilha ou infere)
                const categoria = categoriaPlanilha || inferirCategoria(descricao);

                // Verifica se o item já existe na lista (ignorando caso)
                const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                if (itemExistenteIndex === -1) {
                     // Item não existe, adiciona
                     const novoItem = { descricao, quantidade, valorUnitario, categoria };
                     compras.push(novoItem);
                     ultimoItemImportadoSucesso = novoItem; // Guarda o último adicionado com sucesso
                     itensImportados++;
                } else {
                     // Item já existe, pula esta linha
                     console.warn(`Item "${descricao}" já existe (linha ${index + (isHeader ? 2 : 1)}), importação pulada.`);
                     itensPulados++;
                }
            });

            // Monta mensagem de feedback
            let feedbackMsg = "";
            if (itensImportados > 0) feedbackMsg += `${itensImportados} itens importados com sucesso! `;
            if (itensPulados > 0) feedbackMsg += `${itensPulados} itens ignorados (já existiam na lista). `;
            if (errosImportacao > 0) feedbackMsg += `${errosImportacao} linhas com erros de formato.`;

            // Exibe o feedback apropriado
            if (itensImportados > 0) {
                atualizarLista(); // Atualiza a interface
                salvarDados(); // Salva os novos dados
                mostrarFeedbackSucesso(feedbackMsg.trim());
                if (ultimoItemImportadoSucesso) {
                    atualizarPainelUltimoItem(ultimoItemImportadoSucesso); // Mostra o último adicionado
                }
            } else if (itensPulados > 0 || errosImportacao > 0) {
                 // Se não importou nada, mas pulou ou teve erros
                 mostrarFeedbackErro(feedbackMsg.trim() || "Nenhum item novo importado.");
            } else {
                 // Se não encontrou nada para importar
                 mostrarFeedbackErro("Nenhum item válido encontrado para importar na planilha.");
            }

        } catch (error) {
            console.error("Erro ao ler ou processar o arquivo XLSX:", error);
            mostrarFeedbackErro("Erro ao importar planilha. Verifique o formato do arquivo e os dados.");
        }
    };
    // Evento de erro na leitura do arquivo
    reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        mostrarFeedbackErro("Não foi possível ler o arquivo selecionado.");
    };
    // Inicia a leitura do arquivo como ArrayBuffer
    reader.readAsArrayBuffer(file);
}

// Processa importação por lista de texto separada por vírgula
function processarImportacaoTexto() {
    const texto = textImportArea.value.trim();
    if (!texto) {
        // Mostra feedback direto no modal de texto? Ou no principal? Vamos usar o principal.
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
        // Verifica se o item já existe (ignorando caso)
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) {
            // Item não existe, adiciona com qtd 1, valor 0 e categoria inferida
            const categoria = inferirCategoria(nomeItem);
            const novoItem = {
                descricao: nomeItem,
                quantidade: 1,
                valorUnitario: 0, // Importação por texto sempre adiciona sem preço
                categoria: categoria
            };
            compras.push(novoItem);
            ultimoItemAdicionadoTexto = novoItem; // Guarda o último adicionado
            itensAdicionados++;
        } else {
            // Item já existe, conta como duplicado
            console.warn(`Item "${nomeItem}" já existe, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    // Monta mensagem de feedback
    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) adicionado(s) à lista de pendentes! `;
        atualizarLista(); // Atualiza a interface
        salvarDados();    // Salva os dados
        if(ultimoItemAdicionadoTexto){
            atualizarPainelUltimoItem(ultimoItemAdicionadoTexto); // Mostra o último adicionado
        }
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) (já existiam na lista).`;
    }

    // Exibe feedback
    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        // Se só houve duplicados, mostra como erro/aviso
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         // Se por algum motivo não adicionou nem duplicou nada
         mostrarFeedbackErro("Não foi possível adicionar itens da lista fornecida.");
    }

    // Fecha o modal de importação por texto
    if (modalTextImport) modalTextImport.style.display = 'none';
}

// Gera relatório em Excel (.xlsx)
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens antes de gerar o relatório.");
        return;
    }

    // Cria uma cópia e ordena os itens: primeiro por categoria (ordem definida), depois alfabeticamente
    const comprasOrdenadas = [...compras].sort((a, b) => {
         const catAIndex = ordemCategorias.indexOf(a.categoria || 'Outros');
         const catBIndex = ordemCategorias.indexOf(b.categoria || 'Outros');

         // Se categorias são diferentes, ordena pela ordem definida
         if (catAIndex !== catBIndex) {
             // Se uma categoria não está na ordem definida, vai para o fim
             if (catAIndex === -1) return 1;
             if (catBIndex === -1) return -1;
             return catAIndex - catBIndex;
         }
         // Se categorias são iguais, ordena alfabeticamente pela descrição
         return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
    });

    // Mapeia os dados para o formato do SheetJS, calculando o total por item
    const dadosParaExportar = comprasOrdenadas.map(item => ({
        'Categoria': item.categoria || 'Outros',
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario || 0, // Garante que seja número
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0)) // Calcula total
    }));

    // Calcula o total geral de todos os itens
    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Cria a planilha a partir do array de objetos
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Categoria', 'Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Valor Total (R$)'] // Ordem das colunas
    });

    // Aplica formatação de moeda (R$) às colunas de valor unitário e total
    const range = XLSX.utils.decode_range(worksheet['!ref']); // Obtém o range da planilha
    for (let C = 3; C <= 4; ++C) { // Colunas D (índice 3) e E (índice 4)
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Itera pelas linhas de dados (pula cabeçalho)
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!worksheet[cell_ref]) continue; // Pula células vazias
            worksheet[cell_ref].t = 'n'; // Define o tipo como número ('n')
            worksheet[cell_ref].z = 'R$ #,##0.00'; // Define o formato de número (R$ com 2 decimais)
        }
    }

    // Adiciona linha com o Total Geral ao final da planilha
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco para separar
        ['', '', '', 'Total Geral:', { t: 'n', v: totalGeral, z: 'R$ #,##0.00' }] // Linha do total
    ], { origin: -1 }); // Adiciona no final (-1)

    // Define larguras aproximadas para as colunas (em número de caracteres)
    const columnWidths = [
        { wch: 18 }, // Categoria
        { wch: Math.min(60, Math.max(25, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) }, // Descrição (adapta ao conteúdo, com min/max)
        { wch: 12 }, // Quantidade
        { wch: 20 }, // Valor Unitário
        { wch: 20 }  // Valor Total
    ];
    worksheet['!cols'] = columnWidths; // Aplica as larguras

    // Cria o workbook (arquivo Excel) e adiciona a planilha
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

// Input principal e botões associados
vozInput.addEventListener('input', () => {
    ocultarFeedback(); // Esconde feedback ao digitar
    awesompleteInstance.evaluate(); // Reavalia sugestões do autocomplete
});
vozInput.addEventListener('keypress', (e) => {
    // Adiciona item se Enter for pressionado e o autocomplete não estiver aberto
    if (e.key === 'Enter' && !awesompleteInstance.opened) {
        e.preventDefault(); // Evita envio de formulário (se houver)
        processarEAdicionarItem(vozInput.value);
    }
});
// Botão do Microfone Principal
if (ativarVoz && recognition) { // Verifica se o botão e a API existem
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput'); // Ativa reconhecimento para o input principal
     });
     ativarVoz.setAttribute('data-target', 'vozInput'); // Adiciona data-target para consistência
}
// Botão Adicionar (+)
inserirItem.addEventListener('click', () => {
    // Traz o input para a visão (útil em mobile se o teclado abrir)
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Adiciona um pequeno delay para garantir que o scroll termine antes de processar
    setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    }, 50);
});
// Botão Limpar Input (X)
limparInput.addEventListener('click', () => {
    vozInput.value = ''; // Limpa o campo
    ocultarFeedback(); // Esconde feedback
    awesompleteInstance.close(); // Fecha sugestões do autocomplete
    vozInput.focus(); // Devolve o foco ao campo
});

// Delegação de eventos para excluir item (para AMBAS as listas)
const setupDeleteListener = (ulElement) => {
    if (!ulElement) return;
    ulElement.addEventListener('click', (event) => {
        const excluirBtn = event.target.closest('.excluir-item'); // Encontra o botão de excluir clicado
        if (excluirBtn) {
            const li = excluirBtn.closest('li'); // Encontra o item da lista (LI) pai
            if (!li || !li.dataset.index) {
                console.warn("Botão excluir clicado, mas LI ou dataset.index não encontrado.", li);
                return;
            }
            // Pega o índice ORIGINAL armazenado no dataset
            const indexOriginal = parseInt(li.dataset.index, 10);

            // Valida o índice contra o array principal 'compras'
            if (!isNaN(indexOriginal) && indexOriginal >= 0 && indexOriginal < compras.length) {
                const itemParaExcluir = compras[indexOriginal]; // Pega o item para a mensagem de confirmação
                if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                    // Animação de saída (opcional, mas melhora a UX)
                    li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                    li.style.opacity = '0';
                    li.style.transform = 'translateX(-50px)';
                    li.style.maxHeight = '0';
                    li.style.paddingTop = '0';
                    li.style.paddingBottom = '0';
                    li.style.marginTop = '0';
                    li.style.marginBottom = '0';
                    li.style.borderWidth = '0';

                    // Remove o item do array 'compras' USANDO O ÍNDICE ORIGINAL
                    compras.splice(indexOriginal, 1);

                    // Aguarda a animação terminar antes de redesenhar a lista
                    setTimeout(() => {
                        atualizarLista(); // Redesenha TUDO para recalcular índices e totais
                        salvarDados(); // Salva o estado atual
                        mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                        // Não precisa mais remover o LI do DOM, pois atualizarLista() faz isso
                    }, 400); // Tempo da animação CSS (deve corresponder ao max-height)
                }
            } else {
                // Se o índice não for válido (pode acontecer em casos raros de dessincronização)
                console.error("Índice inválido ou dessincronizado para exclusão:", indexOriginal, "Tamanho atual:", compras.length);
                mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
                atualizarLista(); // Força atualização para corrigir possível dessincronização
            }
        }
    });
};
// Configura o listener para ambas as listas
setupDeleteListener(listaPendentesUL);
setupDeleteListener(listaComprasUL);


// Filtro por categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    // Formatação enquanto digita (remove não dígitos, exceto vírgula) - SIMPLIFICADA
    let value = orcamentoInput.value.replace(/[^\d,]/g, '');
    // Permite apenas uma vírgula
     if ((value.match(/,/g) || []).length > 1) {
        value = value.substring(0, value.lastIndexOf(',')) + value.substring(value.lastIndexOf(',') + 1);
     }
    orcamentoInput.value = value;

    // Atualiza localStorage e verificação em tempo real (com valor parcial)
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    // Formata ao perder o foco
    const valorNumerico = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
    salvarDados(); // Salva valor formatado
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual); // Reverifica com valor formatado
});

// Botões de Ação Superiores e Modais de Importação
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block'; // Mostra modal de escolha
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        mostrarFeedbackErro("Erro ao abrir opções de importação.");
    }
});
// Botão "Arquivo Excel" no modal de escolha
if (importChoiceXlsxBtn) {
    importChoiceXlsxBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Esconde modal de escolha
        if (modalImportInfo) {
            modalImportInfo.style.display = 'block'; // Mostra modal de info XLSX
            modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             mostrarFeedbackErro("Erro ao abrir informações de importação XLSX.");
        }
    });
}
// Botão "Selecionar Arquivo .xlsx" no modal de info
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none'; // Esconde modal de info
        // Cria input de arquivo dinamicamente
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"; // Tipos aceitos
        fileInput.style.display = 'none'; // Esconde o input
        // Listener para quando um arquivo for selecionado
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file); // Chama a função de importação
            }
            document.body.removeChild(fileInput); // Remove o input após uso
        }, { once: true }); // Listener é executado apenas uma vez
        document.body.appendChild(fileInput); // Adiciona ao body para funcionar
        fileInput.click(); // Simula clique para abrir a janela de seleção
    });
}
// Botão "Lista de Itens (texto)" no modal de escolha
if (importChoiceTextBtn) {
    importChoiceTextBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Esconde modal de escolha
        if (modalTextImport) {
            textImportArea.value = ''; // Limpa textarea
            modalTextImport.style.display = 'block'; // Mostra modal de texto
            modalTextImport.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => textImportArea.focus(), 300); // Foca na textarea
        } else {
             mostrarFeedbackErro("Erro ao abrir importação por texto.");
        }
    });
}
// Botão "Adicionar Itens da Lista" no modal de texto
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}
// Botão Limpar Lista
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    // Dupla confirmação para segurança
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras e o orçamento?')) {
         if(confirm('Esta ação NÃO PODE SER DESFEITA. Confirma a limpeza total?')){
             compras = []; // Esvazia o array
             orcamentoInput.value = ''; // Limpa o orçamento
             salvarDados(); // Salva o estado vazio
             atualizarLista(); // Atualiza a interface (mostrará listas vazias)
             resetarPainelUltimoItem(); // Reseta o painel do último item
             mostrarFeedbackSucesso('Lista e orçamento limpos com sucesso!');
             categoriaFiltro.value = ""; // Reseta o filtro de categoria
             verificarOrcamento(0); // Reseta a barra de progresso
         }
    }
});
// Botão Relatório
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição ---

// Botão Salvar Edição (Principal do Modal)
salvarEdicaoBtn.addEventListener('click', () => {
     // Validação crucial do índice ANTES de tentar acessar compras[itemEditandoIndex]
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackModalErro("Nenhum item selecionado para salvar ou índice inválido. Fechando modal.");
         console.error("Tentativa de salvar edição com índice inválido:", itemEditandoIndex);
         fecharModalEdicao();
         atualizarLista(); // Atualiza para garantir consistência
         return;
     }

     // Pega os valores FINAIS dos campos manuais
     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10); // Já validado para ser > 0
     const novoValorUnitario = parseNumber(editarValor.value); // Usa parseNumber

     // Validações básicas
     if (!novaDescricao) {
         alert("A descrição não pode ficar vazia.");
         editarDescricao.focus();
         return;
     }
     // Valida quantidade (deve ser número > 0)
     if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
         alert("A quantidade deve ser um número maior que zero.");
         editarQuantidade.focus();
         return;
     }

     // Infére a nova categoria baseada na descrição (pode ter mudado)
     const novaCategoria = inferirCategoria(novaDescricao);

     // Cria o objeto do item atualizado para usar em ambas as atualizações (array e painel)
     const itemOriginal = compras[itemEditandoIndex];
     const itemAtualizado = {
         ...itemOriginal, // Preserva outras propriedades não editadas (se houver no futuro)
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario, // Já parseado para número
         categoria: novaCategoria
     };

     // Atualiza o item no array 'compras' usando o índice original guardado
     compras[itemEditandoIndex] = itemAtualizado;

     // --- ATUALIZA O PAINEL DE ÚLTIMO ITEM COM O ITEM EDITADO ---
     atualizarPainelUltimoItem(itemAtualizado);
     // --- FIM DA ATUALIZAÇÃO ---

     fecharModalEdicao(); // Fecha o modal
     atualizarLista(); // Atualiza a interface geral (ambas as listas)
     salvarDados(); // Salva as alterações
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`); // Feedback principal
});

// Microfone da DESCRIÇÃO (Manual dentro do Modal)
document.querySelectorAll('#modalEdicao .mic-btn[data-target="editarDescricao"]').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) { // Verifica se o botão tem target e a API existe
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition && button) { // Se a API não existe, desabilita
         button.disabled = true;
         button.style.cursor = 'not-allowed';
         button.title = "Reconhecimento de voz não suportado";
    }
});

// Listeners para a seção de Edição por Voz (dentro do Modal)
if(editarVozMicBtn && recognition) { // Microfone do comando qtd/preço
    editarVozMicBtn.addEventListener('click', () => {
        ativarVozParaInput('editarVozInput');
    });
    editarVozMicBtn.setAttribute('data-target', 'editarVozInput'); // Garante data-target
} else if (editarVozMicBtn) { // Desabilita se API não existir
     editarVozMicBtn.disabled = true;
     editarVozMicBtn.style.cursor = 'not-allowed';
     editarVozMicBtn.title = "Reconhecimento de voz não suportado";
}

if(processarEdicaoVoz) { // Botão Processar (Check) comando de voz
    processarEdicaoVoz.addEventListener('click', processarComandoEdicaoVoz);
}

if(limparEdicaoVoz) { // Botão Limpar (X) comando de voz
    limparEdicaoVoz.addEventListener('click', () => {
        editarVozInput.value = ''; // Limpa o campo
        ocultarFeedbackModal(); // Esconde feedback do modal
        editarVozInput.focus(); // Foca no campo
    });
}
// Input do comando de voz (processa com Enter também)
if(editarVozInput) {
    editarVozInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita outros comportamentos do Enter
            processarComandoEdicaoVoz();
        }
    });
    // Limpa feedback ao começar a digitar no campo de comando de voz
    editarVozInput.addEventListener('input', ocultarFeedbackModal);
}

// --- Listeners Genéricos para Fechar Modais ---
// Botões Fechar (X) dentro dos modais
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target; // Pega o ID do modal alvo do data-target
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            // Se for o modal de edição, usa a função específica
            if (targetModalId === 'modalEdicao') {
                fecharModalEdicao();
            } else {
                 // Para outros modais, apenas esconde
                 targetModal.style.display = 'none';
            }
        } else {
             // Fallback: tenta fechar o modal pai mais próximo se o target não for encontrado
             const parentModal = btn.closest('.modal');
             if(parentModal) {
                 if (parentModal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { parentModal.style.display = 'none'; }
             }
        }
    });
});

// Fechar modal clicando fora do conteúdo
window.addEventListener('click', (event) => {
    // Verifica se o clique foi diretamente na área de fundo do modal
    if (event.target.classList.contains('modal')) {
         // Se for o modal de edição, usa a função específica
         if (event.target.id === 'modalEdicao') {
             fecharModalEdicao();
         } else {
             // Para outros modais, apenas esconde
             event.target.style.display = 'none';
         }
    }
});

// Fechar modal com a tecla Escape
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        let modalAberto = false;
        // Itera por todos os modais
        document.querySelectorAll('.modal').forEach(modal => {
            // Se encontrar um modal visível
            if (modal.style.display === 'block') {
                modalAberto = true;
                 // Fecha o modal apropriado
                 if (modal.id === 'modalEdicao') { fecharModalEdicao(); }
                 else { modal.style.display = 'none'; }
            }
        });
        // Se um modal estava aberto E o reconhecimento de voz estava ativo, para o reconhecimento
        if (modalAberto && recognition && document.querySelector('.mic-btn.recording, .modal-mic-btn.recording')) {
             try { recognition.stop(); } catch(e) { /* Ignora erro se não estiver rodando */ }
             // Remove a classe 'recording' visualmente
             document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             // Limpa feedbacks
             ocultarFeedback();
             ocultarFeedbackModal();
         }
    }
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega dados salvos (lista e orçamento)

    // Formata orçamento carregado ao iniciar
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorOrcamentoCarregado > 0 ? valorOrcamentoCarregado.toFixed(2).replace('.', ',') : '';

    resetarPainelUltimoItem(); // Garante que o painel do último item comece escondido/resetado
    atualizarLista(); // Exibe as listas (pendentes e confirmados) e calcula totais/orçamento inicial
});
