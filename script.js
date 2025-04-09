// script.js - Minhas Compras de Mercado

// --- Seleção de elementos do DOM ---
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaComprasUL = document.querySelector('#listaCompras'); // Seleciona a UL especificamente
const listaComprasContainer = document.querySelector('#listaComprasContainer'); // Container geral da lista
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor'); // O total oculto (mantido por compatibilidade?)
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const fecharModalBtn = document.querySelector('#modalEdicao .fechar-modal'); // Específico para edição (pode ser removido se genérico funcionar)
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade');
const editarValor = document.querySelector('#editarValor');
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const importarBtn = document.querySelector('#importar');
const limparListaBtn = document.querySelector('#limparLista');
const relatorioBtn = document.querySelector('#relatorio');
const barraProgresso = document.getElementById('barraProgresso');
const porcentagemProgresso = document.getElementById('porcentagemProgresso');
const progressBarContainer = document.querySelector('.progress-bar-container'); // Container da barra
const painelTotal = document.querySelector('#painelTotal'); // Seleciona o painel total para estilização
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');

// Seletores para modal de info de importação XLSX
const modalImportInfo = document.getElementById('modalImportInfo');
const continuarImportBtn = document.getElementById('continuarImport');
// const fecharModalInfoBtns = document.querySelectorAll('#modalImportInfo .fechar-modal'); // Removido, usar genérico

// Seletores para novos modais de importação (Escolha e Texto)
const modalImportChoice = document.getElementById('modalImportChoice');
const modalTextImport = document.getElementById('modalTextImport');
const importChoiceXlsxBtn = document.getElementById('importChoiceXlsx');
const importChoiceTextBtn = document.getElementById('importChoiceText');
const textImportArea = document.getElementById('textImportArea');
const processTextImportBtn = document.getElementById('processTextImport');
// const fecharModalChoiceBtn = document.querySelector('#modalImportChoice .fechar-modal'); // Removido, usar genérico
// const fecharModalTextBtn = document.querySelector('#modalTextImport .fechar-modal'); // Removido, usar genérico

// --- Variáveis Globais ---
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para Autocomplete (Awesomplete)
const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Açúcar", "Café", "Sal", "Farinha de Trigo", "Leite", "Ovos",
    "Pão de Forma", "Manteiga", "Queijo", "Presunto", "Frango", "Carne Moída", "Linguiça", "Peixe",
    "Alface", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Maçã", "Banana", "Laranja", "Limão",
    "Sabão em Pó", "Amaciante", "Detergente", "Água Sanitária", "Limpador Multiuso", "Esponja de Aço",
    "Papel Higiênico", "Sabonete", "Shampoo", "Condicionador", "Creme Dental", "Escova de Dentes",
    "Desodorante", "Biscoito", "Refrigerante", "Suco", "Água Mineral", "Iogurte", "Chocolate"
];
// Ordem desejada das categorias para exibição
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// --- Funções de Inicialização e Configuração ---
const awesompleteInstance = new Awesomplete(vozInput, {
    list: listaSugestoes,
    minChars: 1, // Sugere a partir de 1 caractere
    maxItems: 7, // Máximo de 7 sugestões visíveis
    autoFirst: true // Seleciona automaticamente a primeira sugestão
});
// Evitar sugestões automáticas no foco inicial (opcional)
vozInput.addEventListener('focus', () => {
    // setTimeout(() => awesompleteInstance.evaluate(), 1); // Pequeno delay se necessário
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

// ***** FUNÇÃO processarEAdicionarItem (Com marcador 'nome', SEM edição inteligente) *****
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
        // ---> MELHORIA APLICADA AQUI: Adicionado 'nome' como alternativa
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

    // --- Lógica de Adicionar/Atualizar Item (COMPORTAMENTO ORIGINAL RESTAURADO) ---
    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());

        if (itemExistenteIndex > -1) {
            // Item já existe. Confirma SOMAR quantidade e ATUALIZAR valor.
             if (confirm(`"${descricao}" já está na lista com quantidade ${compras[itemExistenteIndex].quantidade}. Deseja somar a nova quantidade (${quantidade}) e atualizar o valor unitário (para R$ ${valorUnitario.toFixed(2).replace('.', ',')})?`)) {
                // Soma a quantidade
                compras[itemExistenteIndex].quantidade += quantidade;
                // Atualiza o valor unitário SE o novo valor for > 0 OU se o valor existente for 0/nulo
                if (valorUnitario > 0 || !compras[itemExistenteIndex].valorUnitario || compras[itemExistenteIndex].valorUnitario <= 0) {
                    compras[itemExistenteIndex].valorUnitario = valorUnitario;
                }
                // Opcional: Re-inferir categoria se a descrição mudar (pouco provável aqui)
                // compras[itemExistenteIndex].categoria = inferirCategoria(descricao);
            } else {
                // Usuário cancelou a atualização/soma
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus();
                return; // Interrompe a execução
            }
        } else {
            // Item novo, adiciona normalmente
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
        }

        // Atualiza a interface, salva e dá feedback (para adição ou atualização confirmada)
        atualizarLista();
        salvarDados();
        vozInput.value = '';
        ocultarFeedback(); // Limpa feedback anterior
        // Adapta a mensagem se foi atualização ou adição
        const acaoRealizada = itemExistenteIndex > -1 ? "atualizado" : "adicionado";
        // Pega o índice correto para exibir a quantidade final
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
    const orcamentoValor = orcamentoInput.value; // Salva o valor formatado ou vazio
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

// Funções de Feedback na área abaixo do input principal
function mostrarFeedback(mensagem, tipo = 'info') {
    vozFeedback.textContent = mensagem;
    vozFeedback.className = `voz-feedback show ${tipo}`;
    vozFeedback.style.display = 'block'; // Garante que fique visível
     // Auto-ocultar feedback após alguns segundos (exceto erros talvez?)
     /*
     if(tipo !== 'error') {
         setTimeout(() => {
             ocultarFeedback();
         }, 4000); // Oculta após 4 segundos
     }
     */
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() {
    vozFeedback.classList.remove('show');
    // Delay para permitir a animação de fade-out antes de esconder e limpar
    setTimeout(() => {
        if (!vozFeedback.classList.contains('show')) { // Verifica se não foi re-exibido no meio tempo
            vozFeedback.style.display = 'none';
            vozFeedback.textContent = '';
            vozFeedback.className = 'voz-feedback'; // Reseta classes
        }
    }, 300); // Tempo da transição CSS
}

// Atualiza a exibição da lista de compras, agrupando por categoria
function atualizarLista() {
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;
    const tituloLista = listaComprasContainer.querySelector('h2');

    // Adiciona um índice original temporário para referência no DOM
    // Isso é crucial para que a exclusão e edição via clique funcionem corretamente
    // mesmo após reordenações ou filtros.
    compras.forEach((item, index) => item.originalIndex = index);


    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Sua lista de compras está vazia.</li>';
        if (tituloLista) tituloLista.style.display = 'none'; // Esconde "Itens no Carrinho"
    } else {
        if (tituloLista) tituloLista.style.display = 'inline-block'; // Mostra "Itens no Carrinho"

        // Agrupa os itens por categoria
        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            // Guarda o item com seu índice original
            acc[categoria].push({ ...item });
            return acc;
        }, {});

        // Ordena as categorias pela ordem definida em 'ordemCategorias'
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Alfabética se ambas desconhecidas
            if (indexA === -1) return 1; // Desconhecidas vão para o fim
            if (indexB === -1) return 1;
            return indexA - indexB; // Ordena pela lista definida
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            // Ordena itens dentro da categoria: Pendentes primeiro, depois alfabeticamente
            itensDaCategoria.sort((a, b) => {
                const aPendente = !a.valorUnitario || a.valorUnitario <= 0;
                const bPendente = !b.valorUnitario || b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1;
                if (!aPendente && bPendente) return 1;
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
            });

            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Para o filtro

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                // Usa o índice original armazenado no item para o dataset do LI
                li.dataset.index = item.originalIndex;

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

                // Adiciona listener para abrir modal de edição ao clicar no item
                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                         // Pega o índice do dataset do LI
                         const indexParaEditar = parseInt(li.dataset.index, 10);
                         // Verifica se o índice é válido no array 'compras' atual
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar);
                         } else {
                              console.error("Índice original inválido ou não encontrado para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                              // Força atualização para tentar corrigir discrepâncias
                              atualizarLista();
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });

            listaComprasUL.appendChild(categoryGroup);
        });
    }

    // Remove o índice original temporário após a renderização
    compras.forEach(item => delete item.originalIndex);

    aplicarFiltroCategoria();

    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral);
}


// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');
    let algumGrupoVisivel = false;

    if (listaVaziaMsg && !todosGrupos.length) return; // Não faz nada se a lista estiver vazia

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden');
            algumGrupoVisivel = true;
        } else {
            grupo.classList.add('hidden');
        }
    });

    // Gerencia a mensagem de "sem resultados no filtro"
    let noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
    if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
        // Se não há grupos visíveis, um filtro está ativo e a lista não está vazia
        if (!noResultsMsg) { // Adiciona a mensagem se ela não existir
            const msg = document.createElement('li');
            msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
            msg.classList.add('filtro-sem-resultados');
            listaComprasUL.appendChild(msg);
        }
    } else if (noResultsMsg) {
        // Remove a mensagem se algum grupo ficou visível ou se o filtro foi removido
        noResultsMsg.remove();
    }
}


// Verificar orçamento e atualizar barra de progresso
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

// Abre o modal para editar um item específico pelo seu índice original
function editarItem(index) {
    // Validação crucial do índice recebido do dataset
    if (index === null || typeof index !== 'number' || isNaN(index) || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição. Tente atualizar a página.");
        return;
    }
    itemEditandoIndex = index; // Guarda o índice válido
    const item = compras[index]; // Acessa o item usando o índice validado

    // Preenche os campos do modal
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    modalEdicao.style.display = 'block'; // Mostra o modal

    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select();
    }, 350);
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Limpa o índice em edição
}

// Formata o campo de valor no modal de edição enquanto digita
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove não-dígitos
    if (value) {
        let numberValue = parseInt(value, 10) / 100;
        e.target.value = numberValue.toFixed(2).replace('.', ',');
    } else {
        e.target.value = '';
    }
});

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
                 targetInput.dispatchEvent(new Event('input')); // Dispara formatação
            }
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`);
            // if (targetInput === vozInput) processarEAdicionarItem(transcript); // Descomentado se quiser auto-processar
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento de voz: ';
        if (event.error == 'no-speech') { errorMsg += 'Nenhuma fala detectada.'; }
        else if (event.error == 'audio-capture') { errorMsg += 'Falha na captura de áudio (verifique permissão do microfone).'; }
        else if (event.error == 'not-allowed') { errorMsg += 'Permissão para usar o microfone negada.'; }
        else { errorMsg += event.error; }
        mostrarFeedbackErro(errorMsg);
        console.error('Speech recognition error:', event.error);
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onend = () => {
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    document.querySelectorAll('.mic-btn').forEach(btn => {
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado";
    });
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        mostrarFeedbackErro("Reconhecimento de voz não suportado ou inicializado.");
        return;
    }
    try { recognition.stop(); } catch(e) { /* Ignora */ }

    try {
        recognition.targetInputId = inputId; // Guarda o ID do input alvo
        recognition.start();
        mostrarFeedback("Ouvindo...", 'info');

        // Adiciona classe 'recording' ao botão de microfone correspondente
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], #ativarVoz`);
        if (clickedButton) {
            clickedButton.classList.add('recording');
        }
    } catch (e) {
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento de voz.");
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    }
}

// --- Funções de Importação/Exportação/Limpeza ---

// Função para importar dados de um arquivo XLSX
function importarDadosXLSX(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Ajuste: Se a planilha TIVER um cabeçalho, use header: 0 ou deixe default
            // Se NÃO tiver cabeçalho (só dados), use header: 1
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (jsonData.length < 1) { // Ajustado para < 1 se header: 1
                mostrarFeedbackErro("Planilha vazia ou sem dados válidos.");
                return;
            }

            // Se usou header:1, começa do 0. Se usou header:0, começa do 1 (jsonData.slice(1))
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

                    const quantidade = parseInt(quantidadeStr);
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

// Função para processar a lista de texto do modal de importação por texto
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


// Gera um relatório Excel (.xlsx) da lista de compras atual
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens para gerar o relatório.");
        return;
    }

    const dadosParaExportar = compras.map(item => ({
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario ? item.valorUnitario.toFixed(2).replace('.', ',') : '0,00',
        'Categoria': item.categoria || 'Outros',
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0)).toFixed(2).replace('.', ',')
    }));

    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Categoria', 'Valor Total (R$)']
    });

    XLSX.utils.sheet_add_aoa(worksheet, [
        [],
        ['', '', '', 'Total Geral:', totalGeral.toFixed(2).replace('.', ',')]
    ], { origin: -1 });

    const columnWidths = [
        { wch: Math.min(60, Math.max(40, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) },
        { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
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
        mostrarFeedbackErro("Ocorreu um erro ao gerar o relatório Excel.");
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

// Inserir Item pelo botão '+'
inserirItem.addEventListener('click', () => {
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    }, 50);
});

// Limpar Input principal
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    ocultarFeedback();
    awesompleteInstance.close();
    vozInput.focus();
});

// Delegação de eventos para excluir item (listener na UL pai)
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        if (!li || !li.dataset.index) { // Verifica se tem o dataset com índice
            console.warn("Botão excluir clicado, mas LI ou dataset.index não encontrado.", li);
            return;
        }

        const index = parseInt(li.dataset.index, 10); // Pega o índice do dataset

         // Validação crucial do índice antes de usá-lo
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

                 // Remove o item do array 'compras' usando o índice validado
                 compras.splice(index, 1);

                 // Aguarda a animação terminar antes de atualizar a lista
                 // É importante atualizar DEPOIS de remover do array
                 setTimeout(() => {
                      atualizarLista(); // Redesenha a lista (isso recalculará os índices)
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                 }, 400);
             }
         } else {
             // Se o índice do dataset for inválido (não corresponde a um item no array)
             console.error("Índice inválido ou dessincronizado para exclusão:", index, "Tamanho do array:", compras.length);
             mostrarFeedbackErro("Erro ao tentar excluir item. A lista será atualizada.");
             // Atualiza a lista para tentar corrigir a exibição
             atualizarLista();
         }
    }
});

// Filtro por categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    if (valorNumerico > 0) {
        orcamentoInput.value = valorNumerico.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = '';
    }
    salvarDados();
});

// --- Listeners para Botões de Ação Superiores e Modais de Importação ---

// Botão "Importar" principal
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block';
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error("Modal #modalImportChoice não encontrado no DOM.");
        mostrarFeedbackErro("Erro ao abrir opções de importação.");
    }
});

// Botão escolher importação XLSX
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

// Botão "Continuar" importação XLSX
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
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}

// Botão escolher importação por Texto
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

// Botão processar importação por Texto
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}

// Botão Limpar Lista
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

// Botão Gerar Relatório Excel
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição ---

// Botão Salvar Edição
salvarEdicaoBtn.addEventListener('click', () => {
     // Validação crucial do índice antes de usá-lo
     if (itemEditandoIndex === null || typeof itemEditandoIndex !== 'number' || isNaN(itemEditandoIndex) || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao();
         return;
     }

     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1;
     const novoValorUnitario = parseNumber(editarValor.value);

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

     // Atualiza o item no array usando o índice validado
     compras[itemEditandoIndex] = {
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
     };

     fecharModalEdicao();
     atualizarLista(); // Atualiza a interface
     salvarDados();
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`);
});

// Microfones dentro do modal de edição
document.querySelectorAll('#modalEdicao .modal-mic-btn').forEach(button => {
    const targetId = button.dataset.target;
    if (targetId && recognition) {
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition) {
         button.disabled = true;
    }
});

// --- Listeners Genéricos para Fechar Modais ---

// Botão 'X' genérico
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target;
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            targetModal.style.display = 'none';
        } else {
            const parentModal = btn.closest('.modal');
            if(parentModal) {
                parentModal.style.display = 'none';
            } else {
                 console.warn(`Modal com ID "${targetModalId}" não encontrado.`);
            }
        }
    });
});

// Clicar fora do modal
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Tecla ESC
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
         // Opcional: parar reconhecimento de voz se ativo
         if (recognition && document.querySelector('.mic-btn.recording')) {
             try { recognition.stop(); } catch(e) {}
             document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
             ocultarFeedback();
         }
    }
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();

    // Formata orçamento inicial
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    if (valorOrcamentoCarregado > 0) {
         orcamentoInput.value = valorOrcamentoCarregado.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = '';
    }

    atualizarLista(); // Exibe a lista e calcula totais/orçamento

});
