// script.js - Minhas Compras de Mercado

// --- Seleção de elementos do DOM (Adicionar novos do modal de edição) ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback'); // Feedback principal
const listaComprasUL = document.querySelector('#listaCompras');
const listaComprasContainer = document.querySelector('#listaComprasContainer');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor');
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
// const fecharModalBtn = document.querySelector('#modalEdicao .fechar-modal'); // Usar genérico
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
    // setTimeout(() => awesompleteInstance.evaluate(), 1);
});

// --- Funções de Manipulação de Dados (inferirCategoria, parseNumber, processarEAdicionarItem, salvarDados, carregarDados) ---
// (Nenhuma alteração necessária nessas funções por enquanto)
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

// ***** FUNÇÃO processarEAdicionarItem (Sem alterações) *****
function processarEAdicionarItem(textoOriginal) {
    if (!textoOriginal || textoOriginal.trim() === '') {
        mostrarFeedbackErro('Digite ou dite alguma informação do item.');
        return;
    }

    const texto = textoOriginal.trim();
    let quantidade = 1; // Padrão
    let valorUnitario = 0; // Padrão
    let descricao = ''; // Começa vazia

    // 1. Definir os marcadores e suas variações (em minúsculas)
    const marcadores = {
        quantidade: ['quantidade', 'quant', 'qtd', 'qt'],
        descricao: ['descrição', 'descricao', 'desc', 'nome'],
        preco: ['preço', 'preco', 'valor', 'val']
    };

    // Cria uma expressão regular para encontrar qualquer um dos marcadores
    const todosMarcadoresRegex = new RegExp(`\\b(${
        [...marcadores.quantidade, ...marcadores.descricao, ...marcadores.preco].join('|')
    })\\b\\s*`, 'gi');

    // 2. Dividir o texto usando os marcadores como delimitadores
    const partes = texto.split(todosMarcadoresRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null;
    let descricaoColetada = [];

    // Mapa de números por extenso
    const numerosPorExtenso = {
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
        'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    };

    // Se a primeira parte NÃO é um marcador, assume-se que é o início da descrição
    if (partes.length > 0 && !Object.values(marcadores).flat().includes(partes[0].toLowerCase().trim())) {
        tipoAtual = 'descricao';
        descricaoColetada.push(partes[0].trim());
    }

    // 3. Iterar pelas partes para extrair valores
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
                        // Mantém quantidade = 1 se não conseguir parsear
                    }
                    break;
                case 'preco':
                    // parseNumber retorna 0 se não conseguir parsear
                    valorUnitario = parseNumber(parteAtual);
                    break;
                case 'descricao':
                    descricaoColetada.push(parteAtual);
                    break;
                default:
                    if (!tipoAtual) { // Se ainda não achou marcador, assume descrição
                         descricaoColetada.push(parteAtual);
                    }
                    break;
            }
             // Reseta o tipo após ler o valor (exceto descrição)
             if (tipoAtual === 'quantidade' || tipoAtual === 'preco') {
                 tipoAtual = null;
             }
        }
    }

    // 4. Montar a descrição final
    descricao = descricaoColetada.join(' ').trim();

    // 5. Validação Final e Adição/Atualização
    if (!descricao) {
        // Se o texto original não tinha marcadores e não é vazio, usa ele todo como descrição
        if (textoOriginal && partes.length <= 1 && !Object.values(marcadores).flat().includes(textoOriginal.toLowerCase())) {
            descricao = textoOriginal;
        } else {
            mostrarFeedbackErro('A descrição (ou nome) não pode estar vazia. Verifique o comando.');
            return;
        }
    }
     // Garante que a quantidade seja pelo menos 1
     if (quantidade <= 0) {
          quantidade = 1;
     }

    // --- Lógica de Adicionar/Atualizar Item ---
    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());

        if (itemExistenteIndex > -1) {
             if (confirm(`"${descricao}" já está na lista com quantidade ${compras[itemExistenteIndex].quantidade}. Deseja somar a nova quantidade (${quantidade}) e atualizar o valor unitário (para R$ ${valorUnitario.toFixed(2).replace('.', ',')})?`)) {
                compras[itemExistenteIndex].quantidade += quantidade;
                if (valorUnitario > 0 || !compras[itemExistenteIndex].valorUnitario || compras[itemExistenteIndex].valorUnitario <= 0) {
                    compras[itemExistenteIndex].valorUnitario = valorUnitario;
                }
            } else {
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus();
                return;
            }
        } else {
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
        }

        atualizarLista();
        salvarDados();
        vozInput.value = '';
        ocultarFeedback();
        const acaoRealizada = itemExistenteIndex > -1 ? "atualizado" : "adicionado";
        const indexFinal = itemExistenteIndex > -1 ? itemExistenteIndex : compras.length - 1;
        mostrarFeedbackSucesso(`Item "${descricao}" ${acaoRealizada}! (Qtd final: ${compras[indexFinal].quantidade}, Preço: R$ ${compras[indexFinal].valorUnitario.toFixed(2).replace('.', ',')})`);
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

// Funções de Feedback (Principal)
function mostrarFeedback(mensagem, tipo = 'info', elementoFeedback = vozFeedback) {
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''} show ${tipo}`; // Adiciona classe base correta
    elementoFeedback.style.display = 'block';
}
function mostrarFeedbackSucesso(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'success', elementoFeedback); }
function mostrarFeedbackErro(mensagem, elementoFeedback = vozFeedback) { mostrarFeedback(mensagem, 'error', elementoFeedback); }

function ocultarFeedback(elementoFeedback = vozFeedback) {
    elementoFeedback.classList.remove('show');
    setTimeout(() => {
        if (!elementoFeedback.classList.contains('show')) {
            elementoFeedback.style.display = 'none';
            elementoFeedback.textContent = '';
            elementoFeedback.className = `voz-feedback ${elementoFeedback.id === 'editarVozFeedback' ? 'modal-feedback' : ''}`; // Reseta classes base
        }
    }, 300);
}
// Atalhos para feedback no modal
function mostrarFeedbackModalSucesso(mensagem) { mostrarFeedbackSucesso(mensagem, editarVozFeedback); }
function mostrarFeedbackModalErro(mensagem) { mostrarFeedbackErro(mensagem, editarVozFeedback); }
function ocultarFeedbackModal() { ocultarFeedback(editarVozFeedback); }


// Atualiza a exibição da lista de compras, agrupando por categoria - SEM ALTERAÇÕES AQUI
function atualizarLista() {
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;
    const tituloLista = listaComprasContainer.querySelector('h2');

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
            acc[categoria].push({ ...item });
            return acc;
        }, {});

        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return 1; // Corrigido para 1 (desconhecido B vai para o fim)
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

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
                li.dataset.index = item.originalIndex; // Usa o índice original

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

                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar); // Chama a função de edição
                         } else {
                              console.error("Índice original inválido para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                              atualizarLista();
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });

            listaComprasUL.appendChild(categoryGroup);
        });
    }

    // Remove o índice original temporário APÓS renderizar
    compras.forEach(item => delete item.originalIndex);


    aplicarFiltroCategoria(); // Aplica filtro após renderizar

    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral);
}


// Função para aplicar o filtro de categoria (mostrar/ocultar grupos) - SEM ALTERAÇÕES
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');
    let algumGrupoVisivel = false;

    // Remove mensagem de filtro anterior antes de reavaliar
    let noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }

    if (listaVaziaMsg && !todosGrupos.length) return; // Sai se a lista estiver realmente vazia

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden');
            algumGrupoVisivel = true;
        } else {
            grupo.classList.add('hidden');
        }
    });

    // Adiciona mensagem de sem resultados SE necessário
    if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
        const msg = document.createElement('li');
        msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
        msg.classList.add('filtro-sem-resultados');
        listaComprasUL.appendChild(msg); // Adiciona ao final da UL
    }
}


// Verificar orçamento e atualizar barra de progresso - SEM ALTERAÇÕES
function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        const porcentagemReal = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagemReal, 100); // Barra não passa de 100%
        barraProgresso.value = porcentagem;

        if (total > orcamento) {
            progressBarContainer.classList.add('over-budget');
            // Exibe a porcentagem real, mesmo acima de 100%
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`;
            // Altera estilo do painel total para alerta
            painelTotal.style.backgroundColor = '#f8d7da';
            painelTotal.style.color = '#721c24';
            painelTotal.style.borderColor = '#f5c6cb';
        } else {
            progressBarContainer.classList.remove('over-budget');
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`;
            // Restaura estilo normal do painel total
            painelTotal.style.backgroundColor = '#e9f5e9';
            painelTotal.style.color = '#006400';
            painelTotal.style.borderColor = '#c8e6c9';
        }
    } else {
        // Sem orçamento definido
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = '0%';
        progressBarContainer.classList.remove('over-budget');
        // Estilo normal do painel total
        painelTotal.style.backgroundColor = '#e9f5e9';
        painelTotal.style.color = '#006400';
        painelTotal.style.borderColor = '#c8e6c9';
    }
}


// --- Funções de Edição e Modal ---

// Abre o modal para editar um item específico
function editarItem(index) {
    // Validação crucial do índice recebido do dataset
    if (index === null || typeof index !== 'number' || isNaN(index) || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição. Tente atualizar a página.");
        return;
    }
    itemEditandoIndex = index; // Guarda o índice válido
    const item = compras[index]; // Acessa o item usando o índice validado

    // Preenche os campos MANUAIS do modal
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    // Limpa o campo de comando de voz e o feedback do modal
    if(editarVozInput) editarVozInput.value = '';
    ocultarFeedbackModal(); // Usa a função específica do modal

    modalEdicao.style.display = 'block';

    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus(); // Foca na descrição primeiro
        // editarDescricao.select(); // Descomentar se quiser selecionar o texto
    }, 350);
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null;
    ocultarFeedbackModal(); // Limpa feedback ao fechar
}

// Formata o campo de valor MANUAL no modal de edição
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove não-dígitos
    if (value) {
        // Divide por 100 e formata como moeda BRL
        let numberValue = parseInt(value, 10) / 100;
        e.target.value = numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '').trim();
    } else {
        e.target.value = '';
    }
});


// --- NOVA Função para Processar Comando de Voz de Edição ---
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
    const numerosPorExtensoEdicao = { // Pode reutilizar o global, mas definindo aqui fica claro
        'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
        'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    };

    // Regex para encontrar marcadores de quantidade OU preço
    const marcadorRegex = new RegExp(`\\b(${
        [...marcadoresEdicao.quantidade, ...marcadoresEdicao.preco].join('|')
    })\\b\\s*`, 'gi');

    const partes = textoComando.split(marcadorRegex).filter(p => p && p.trim() !== '');

    let tipoAtual = null;

    for (let i = 0; i < partes.length; i++) {
        const parteAtual = partes[i].trim();
        const parteLower = parteAtual.toLowerCase();
        let marcadorEncontrado = false;

        // Verifica se a parte atual é um marcador
        for (const [tipo, keywords] of Object.entries(marcadoresEdicao)) {
            if (keywords.includes(parteLower)) {
                tipoAtual = tipo;
                marcadorEncontrado = true;
                break;
            }
        }

        // Se NÃO for marcador, é um valor (ou lixo)
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
                        comandoValido = true; // Marcar que algo válido foi encontrado
                    } else {
                        mostrarFeedbackModalErro(`Quantidade inválida: "${parteAtual}".`);
                        tipoAtual = null; // Reseta para evitar aplicar valor errado
                        continue; // Pula para próxima parte
                    }
                    break;
                case 'preco':
                    const valorParseado = parseNumber(parteAtual); // Usa a função existente
                    // Considera 0 como válido, mas talvez não seja ideal aqui?
                    // Vamos considerar > 0 como preço válido para edição por voz
                    if (valorParseado >= 0) { // Permite zerar o preço
                        novoValor = valorParseado;
                        comandoValido = true; // Marcar que algo válido foi encontrado
                    } else {
                         mostrarFeedbackModalErro(`Preço inválido: "${parteAtual}".`);
                         tipoAtual = null; // Reseta
                         continue; // Pula
                    }
                    break;
            }
            tipoAtual = null; // Reseta o tipo após ler o valor
        } else if (!marcadorEncontrado && !tipoAtual) {
             // Ignora partes que não são marcadores e vêm antes de um marcador válido
             console.warn("Ignorando parte inicial inválida no comando de edição:", parteAtual);
        }
    }

    // Aplica as alterações aos campos manuais se algo válido foi encontrado
    if (comandoValido) {
        let feedbackMsg = "Alterações aplicadas:";
        if (novaQuantidade !== null) {
            editarQuantidade.value = novaQuantidade;
            feedbackMsg += ` Qtd=${novaQuantidade}`;
        }
        if (novoValor !== null) {
            editarValor.value = novoValor > 0 ? novoValor.toFixed(2).replace('.', ',') : '';
             // Dispara o evento input para reformatar se necessário (caso a função parseNumber mude)
             editarValor.dispatchEvent(new Event('input'));
            feedbackMsg += ` Preço=R$ ${novoValor.toFixed(2).replace('.', ',')}`;
        }
        mostrarFeedbackModalSucesso(feedbackMsg);
        editarVozInput.value = ''; // Limpa o input de comando
        // Focar no botão salvar? Ou no próximo campo?
        // salvarEdicaoBtn.focus();
    } else {
        mostrarFeedbackModalErro("Nenhum comando válido de quantidade ou preço encontrado.");
    }
}


// --- Funções de Reconhecimento de Voz (adaptar para modal) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const targetInputId = recognition.targetInputId; // ID do input alvo (e.g., 'vozInput' ou 'editarVozInput')
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript;
            // Se for o input de valor manual, dispara formatação
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('input'));
            }
            // Determina qual feedback usar (principal ou modal)
            const feedbackElement = targetInputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`, feedbackElement);

            // Se o alvo for o input de edição por voz, processa automaticamente? Ou espera o 'check'?
            // Vamos esperar o 'check' por enquanto para mais controle do usuário.
            // if (targetInputId === 'editarVozInput') {
            //     setTimeout(processarComandoEdicaoVoz, 100); // Pequeno delay
            // }

        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        // Remove classe 'recording' de TODOS os botões de microfone
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento de voz: ';
        if (event.error == 'no-speech') { errorMsg += 'Nenhuma fala detectada.'; }
        else if (event.error == 'audio-capture') { errorMsg += 'Falha na captura de áudio (verifique permissão do microfone).'; }
        else if (event.error == 'not-allowed') { errorMsg += 'Permissão para usar o microfone negada.'; }
        else { errorMsg += event.error; }

        // Determina qual feedback usar baseado no botão que estava gravando (se houver)
        const recordingButton = document.querySelector('.mic-btn.recording, .modal-mic-btn.recording');
        const targetId = recordingButton ? (recordingButton.dataset.target || 'vozInput') : 'vozInput';
        const feedbackElement = targetId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro(errorMsg, feedbackElement);

        console.error('Speech recognition error:', event.error);
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onend = () => {
        // Garante que todos os botões parem de pulsar
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    document.querySelectorAll('.mic-btn, .modal-mic-btn').forEach(btn => { // Desabilita TODOS os mics
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado";
    });
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        // Tenta determinar o feedback correto mesmo sem reconhecimento
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Reconhecimento de voz não suportado ou inicializado.", feedbackElement);
        return;
    }
    // Para a instância anterior, se houver
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estiver rodando */ }
    // Remove classe de gravação de qualquer botão antes de iniciar
    document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));

    try {
        recognition.targetInputId = inputId; // Guarda o ID do input alvo
        recognition.start();

        // Determina qual feedback usar e mostra "Ouvindo..."
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        ocultarFeedback(feedbackElement); // Limpa feedback anterior primeiro
        mostrarFeedback("Ouvindo...", 'info', feedbackElement);

        // Adiciona classe 'recording' APENAS ao botão correto
        // Seleciona pelo data-target OU pelo ID específico do botão principal (#ativarVoz)
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], .modal-mic-btn[data-target="${inputId}"], #ativarVoz`);
        if (clickedButton) {
            clickedButton.classList.add('recording');
        } else {
             console.warn("Não foi possível encontrar o botão de microfone para o input:", inputId);
        }
    } catch (e) {
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        // Determina qual feedback usar para o erro
        const feedbackElement = inputId === 'editarVozInput' ? editarVozFeedback : vozFeedback;
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento de voz.", feedbackElement);
        // Garante a remoção da classe recording em caso de erro ao iniciar
        document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    }
}


// --- Funções de Importação/Exportação/Limpeza (SEM ALTERAÇÕES) ---
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

            dadosItens.forEach((row, index) => {
                if (row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== '')) {
                    const descricao = String(row[0] || '').trim();
                    const quantidadeStr = String(row[1] || '1').trim();
                    const valorUnitarioStr = String(row[2] || '0').trim();
                    const categoria = String(row[3] || '').trim() || inferirCategoria(descricao);

                    // Correção: Usar parseNumber para quantidade também pode ser arriscado, melhor parseInt
                    const quantidade = parseInt(quantidadeStr.replace(/\D/g,''), 10); // Tenta pegar só os dígitos
                    const valorUnitario = parseNumber(valorUnitarioStr);

                    if (descricao && !isNaN(quantidade) && quantidade > 0) {
                        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                        if (itemExistenteIndex === -1) {
                             compras.push({ descricao, quantidade, valorUnitario, categoria });
                             itensImportados++;
                        } else {
                             console.warn(`Item "${descricao}" já existe na lista, pulando importação da linha ${index + 1}.`);
                             itensPulados++;
                        }
                    } else {
                        console.warn(`Linha ${index + 1} inválida ou incompleta: Desc='${descricao}', Qtd='${quantidadeStr}', Valor='${valorUnitarioStr}'`);
                        errosImportacao++;
                    }
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

    nomesItens.forEach(nomeItem => {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) {
            const categoria = inferirCategoria(nomeItem);
            compras.push({
                descricao: nomeItem,
                quantidade: 1,
                valorUnitario: 0,
                categoria: categoria
            });
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

    if (modalTextImport) modalTextImport.style.display = 'none'; // Fecha o modal
}


function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens para gerar o relatório.");
        return;
    }

    // Ordena os dados para exportação por categoria e depois descrição
    const comprasOrdenadas = [...compras].sort((a, b) => {
         const catA = ordemCategorias.indexOf(a.categoria || 'Outros');
         const catB = ordemCategorias.indexOf(b.categoria || 'Outros');
         if (catA !== catB) {
             // Coloca categorias desconhecidas no final
             if (catA === -1) return 1;
             if (catB === -1) return -1;
             return catA - catB;
         }
         // Dentro da mesma categoria, ordena por descrição
         return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
    });


    const dadosParaExportar = comprasOrdenadas.map(item => ({
        'Categoria': item.categoria || 'Outros', // Adiciona categoria primeiro
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        // Formata valor unitário para número no Excel (melhor para somas)
        'Valor Unitário (R$)': item.valorUnitario || 0,
        // Calcula e formata valor total para número no Excel
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0))
    }));

    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Cria a planilha a partir dos dados JSON
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Categoria', 'Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Valor Total (R$)'] // Ordem das colunas
    });

     // Aplica formatação de número às colunas de valor
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = 3; C <= 4; ++C) { // Colunas D e E (Valor Unitário e Valor Total)
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Começa da linha 2 (abaixo do cabeçalho)
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!worksheet[cell_ref]) continue; // Pula células vazias
            worksheet[cell_ref].t = 'n'; // Define tipo como número
            worksheet[cell_ref].z = 'R$ #,##0.00'; // Define formato de moeda BRL
        }
    }

    // Adiciona linha do total geral
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco
        ['', '', '', 'Total Geral:', { t: 'n', v: totalGeral, z: 'R$ #,##0.00' }] // Formata total como número/moeda
    ], { origin: -1 }); // Adiciona ao final

    // Define larguras das colunas (ajuste conforme necessário)
    const columnWidths = [
        { wch: 18 }, // Categoria
        { wch: Math.min(60, Math.max(25, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) }, // Descrição
        { wch: 12 }, // Quantidade
        { wch: 20 }, // Valor Unitário
        { wch: 20 }  // Valor Total
    ];
    worksheet['!cols'] = columnWidths;

    // Cria o workbook e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    // Gera e baixa o arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;
    try {
        XLSX.writeFile(workbook, nomeArquivo);
        mostrarFeedbackSucesso("Relatório Excel gerado com sucesso!");
    } catch (error) {
        console.error("Erro ao gerar o arquivo Excel:", error);
        mostrarFeedbackErro("Ocorreu um erro ao gerar o relatório Excel.");
    }
}


// --- Event Listeners ---

// Input principal e botões associados (SEM ALTERAÇÕES)
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
         ativarVozParaInput('vozInput'); // Chama a função genérica
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

// Delegação de eventos para excluir item (SEM ALTERAÇÕES)
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
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-50px)';
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.borderWidth = '0';

                 // Remove do array DEPOIS de iniciar a animação
                 compras.splice(index, 1);

                 setTimeout(() => {
                      atualizarLista(); // Redesenha TUDO
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                 }, 400); // Tempo da animação CSS
             }
         } else {
             console.error("Índice inválido ou dessincronizado para exclusão:", index, "Tamanho do array:", compras.length);
             mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
             atualizarLista();
         }
    }
});


// Filtro por categoria (SEM ALTERAÇÕES)
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input (SEM ALTERAÇÕES)
orcamentoInput.addEventListener('input', () => {
    salvarDados(); // Salva enquanto digita? Pode ser pesado. Talvez só no blur?
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorNumerico > 0 ? valorNumerico.toFixed(2).replace('.', ',') : '';
    salvarDados(); // Salva o valor final formatado
    // Recalcula a barra caso o valor tenha mudado significativamente na formatação
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});


// --- Listeners para Botões de Ação Superiores e Modais de Importação (SEM ALTERAÇÕES) ---
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block';
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error("Modal #modalImportChoice não encontrado no DOM.");
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
             console.error("Modal #modalImportInfo não encontrado no DOM.");
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
        }, { once: true }); // Garante que o listener seja removido após o uso
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
             console.error("Modal #modalTextImport não encontrado no DOM.");
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
             mostrarFeedbackSucesso('Lista e orçamento limpos!');
             categoriaFiltro.value = ""; // Reseta filtro
         }
    }
});
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição (ATUALIZADO) ---

// Botão Salvar Edição (Principal)
salvarEdicaoBtn.addEventListener('click', () => {
     // Validação crucial do índice
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackModalErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao();
         return;
     }

     // Pega os valores FINAIS dos campos manuais (que podem ter sido alterados por voz)
     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1; // Pega do campo manual
     const novoValorUnitario = parseNumber(editarValor.value); // Pega do campo manual formatado

     if (!novaDescricao) {
         alert("A descrição não pode ficar vazia."); // Usar alert aqui é ok para bloqueio rápido
         editarDescricao.focus();
         return;
     }
     if (novaQuantidade <= 0) {
         alert("A quantidade deve ser maior que zero.");
         editarQuantidade.focus();
         return;
     }

     const novaCategoria = inferirCategoria(novaDescricao);

     // Atualiza o item no array 'compras'
     compras[itemEditandoIndex] = {
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
     };

     fecharModalEdicao();
     atualizarLista(); // Atualiza a interface geral
     salvarDados();
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`); // Feedback principal
});

// Microfone da DESCRIÇÃO (Manual)
document.querySelectorAll('#modalEdicao .mic-btn[data-target="editarDescricao"]').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) {
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition) {
         button.disabled = true;
    }
});

// --- NOVOS Listeners para a seção de Edição por Voz ---
if(editarVozMicBtn && recognition) {
    editarVozMicBtn.addEventListener('click', () => {
        ativarVozParaInput('editarVozInput'); // Chama a função genérica para o input de comando
    });
} else if (editarVozMicBtn) {
     editarVozMicBtn.disabled = true; // Desabilita se não houver API de voz
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
// Opcional: Processar comando de voz ao pressionar Enter no input
if(editarVozInput) {
    editarVozInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processarComandoEdicaoVoz();
        }
    });
    // Opcional: Limpar feedback ao começar a digitar novo comando
     editarVozInput.addEventListener('input', ocultarFeedbackModal);
}


// --- Listeners Genéricos para Fechar Modais (SEM ALTERAÇÕES) ---
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target;
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            // Se for o modal de edição, chama a função específica para limpar o index
            if (targetModalId === 'modalEdicao') {
                fecharModalEdicao();
            } else {
                 targetModal.style.display = 'none';
            }
        } else {
            // Fallback para fechar modal pai se target não for encontrado
            const parentModal = btn.closest('.modal');
            if(parentModal) {
                 if (parentModal.id === 'modalEdicao') {
                     fecharModalEdicao();
                 } else {
                     parentModal.style.display = 'none';
                 }
            } else {
                 console.warn(`Modal com ID "${targetModalId}" ou modal pai não encontrado.`);
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
                 if (modal.id === 'modalEdicao') {
                     fecharModalEdicao();
                 } else {
                     modal.style.display = 'none';
                 }
            }
        });
        // Para reconhecimento de voz se ESC for pressionado e um modal estava aberto
        if (modalAberto && recognition && document.querySelector('.mic-btn.recording, .modal-mic-btn.recording')) {
             try { recognition.stop(); } catch(e) {}
             document.querySelectorAll('.mic-btn.recording, .modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             ocultarFeedback(); // Limpa feedback principal
             ocultarFeedbackModal(); // Limpa feedback do modal
         }
    }
});


// --- Inicialização da Aplicação (SEM ALTERAÇÕES) ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    orcamentoInput.value = valorOrcamentoCarregado > 0 ? valorOrcamentoCarregado.toFixed(2).replace('.', ',') : '';

    atualizarLista(); // Exibe a lista e calcula totais/orçamento inicial
});
