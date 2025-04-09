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

// ***** FUNÇÃO processarEAdicionarItem ATUALIZADA *****
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
        // ---> MELHORIA 1: Adicionado 'nome' como alternativa
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
    let quantidadeFoiFornecida = false; // Flag para saber se o usuário ditou/digitou quantidade
    let precoFoiFornecido = false;     // Flag para saber se o usuário ditou/digitou preço

    // Mapa de números por extenso (colocado aqui para ser local à função)
    const numerosPorExtenso = {
        'um': 1, 'uma': 1,
        'dois': 2, 'duas': 2,
        'três': 3, 'tres': 3,
        'quatro': 4,
        'cinco': 5,
        'seis': 6,
        'sete': 7,
        'oito': 8,
        'nove': 9,
        'dez': 10,
        // Adicione mais se necessário
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
                        quantidadeFoiFornecida = true; // Marca que a quantidade veio do input
                    } else {
                        console.warn(`Não foi possível parsear quantidade: "${parteAtual}".`);
                         // Não seta a flag quantidadeFoiFornecida = true se não parsear
                    }
                    break;

                case 'preco':
                    const valorParseado = parseNumber(parteAtual);
                    // Só considera fornecido se for maior que 0, para evitar R$ 0,00 como update intencional
                    if (valorParseado > 0) {
                        valorUnitario = valorParseado;
                        precoFoiFornecido = true; // Marca que o preço veio do input
                    } else if (parseNumber(parteAtual) === 0) { // Se explicitamente disse 0
                        valorUnitario = 0;
                        precoFoiFornecido = true;
                    } else {
                         console.warn(`Não foi possível parsear preço: "${parteAtual}".`);
                    }
                    break;
                case 'descricao':
                    descricaoColetada.push(parteAtual);
                    break;
                default:
                    // Se não identificou um tipo (marcador) antes, assume que é parte da descrição
                    if (!tipoAtual) {
                         descricaoColetada.push(parteAtual);
                    }
                    break;
            }
             // Reseta o tipo após ler o valor, exceto para descrição que pode ser multi-partes
             if (tipoAtual === 'quantidade' || tipoAtual === 'preco') {
                 tipoAtual = null;
             }
        }
    }

    // 4. Montar a descrição final
    descricao = descricaoColetada.join(' ').trim();

    // 5. Validação da Descrição
    if (!descricao) {
        // Se o texto original não contém marcadores e não é vazio, usa ele como descrição
        if (textoOriginal && partes.length <= 1 && !Object.values(marcadores).flat().includes(textoOriginal.toLowerCase())) {
            descricao = textoOriginal;
        } else {
            mostrarFeedbackErro('A descrição (ou nome) do item não foi identificada. Verifique o comando.');
            return; // Interrompe se não conseguiu extrair uma descrição
        }
    }

    // Garante que a quantidade seja pelo menos 1, mesmo que o padrão tenha sido sobrescrito por algo inválido
    if (quantidade <= 0) {
      quantidade = 1;
      // Não seta quantidadeFoiFornecida = true aqui, pois foi um ajuste, não input do usuário
    }

    // --- Lógica de Adicionar ou Atualizar Item ---
    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());

        if (itemExistenteIndex > -1) {
            // ---> MELHORIA 2: Lógica de Atualização Inteligente
            const itemExistente = compras[itemExistenteIndex];

            // Verifica se o usuário forneceu explicitamente uma nova quantidade ou preço
            if (quantidadeFoiFornecida || precoFoiFornecido) {
                let updates = [];
                if (quantidadeFoiFornecida && quantidade !== itemExistente.quantidade) {
                    updates.push(`Quantidade para ${quantidade}`);
                }
                // Atualiza o preço se foi fornecido (mesmo que seja 0, se fornecido explicitamente)
                if (precoFoiFornecido && valorUnitario !== itemExistente.valorUnitario) {
                    updates.push(`Preço para R$ ${valorUnitario.toFixed(2).replace('.', ',')}`);
                }

                // Só pede confirmação se houver de fato alguma alteração a ser feita
                if (updates.length > 0) {
                    const confirmMsg = `Atualizar "${descricao}" com: ${updates.join(' e ')}?`;
                    if (confirm(confirmMsg)) {
                        // Aplica as atualizações APENAS se foram fornecidas
                        if (quantidadeFoiFornecida) {
                            compras[itemExistenteIndex].quantidade = quantidade;
                        }
                        if (precoFoiFornecido) {
                            compras[itemExistenteIndex].valorUnitario = valorUnitario;
                        }
                        // Re-inferir categoria caso a descrição tenha mudado (embora o foco aqui seja qtd/preço)
                        // compras[itemExistenteIndex].categoria = inferirCategoria(descricao); // Descomentar se quiser re-categorizar

                        atualizarLista();
                        salvarDados();
                        vozInput.value = '';
                        ocultarFeedback(); // Limpa feedback anterior
                        mostrarFeedbackSucesso(`Item "${descricao}" atualizado!`);
                        vozInput.focus();
                    } else {
                        mostrarFeedbackErro("Atualização cancelada.");
                        vozInput.focus();
                    }
                } else {
                    // Forneceu nome/descrição existente, mas os valores de qtd/preço são os mesmos
                    mostrarFeedbackErro(`"${descricao}" já está na lista com os mesmos dados.`);
                    vozInput.value = ''; // Limpa o input mesmo assim
                    vozInput.focus();
                }
            } else {
                // O usuário apenas digitou/dito o nome de um item existente sem novos dados de qtd/preço
                mostrarFeedbackErro(`"${descricao}" já existe. Clique nele para editar ou forneça nova quantidade/preço.`);
                 // Mantem o valor no input para o usuário adicionar qtd/preço se quiser
                 vozInput.focus();
                 vozInput.select(); // Seleciona o texto para facilitar a edição
            }

        } else {
            // Item novo, adiciona normalmente
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);

            atualizarLista();
            salvarDados();
            vozInput.value = '';
            ocultarFeedback(); // Limpa feedback anterior
            mostrarFeedbackSucesso(`Item "${descricao}" adicionado! (Qtd: ${quantidade}, Preço: R$ ${valorUnitario.toFixed(2).replace('.', ',')})`);
            vozInput.focus();
        }

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro('Ocorreu um erro ao processar o item.');
    }
}
// ***** FIM DA FUNÇÃO processarEAdicionarItem ATUALIZADA *****


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

    // Recalcula os índices originais pois eles podem mudar após exclusão/edição que muda ordem
    // Adiciona um ID único temporário para garantir a referência correta
    compras.forEach((item, index) => item.tempId = `item-${index}-${Date.now()}`);


    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Sua lista de compras está vazia.</li>';
        if (tituloLista) tituloLista.style.display = 'none'; // Esconde "Itens no Carrinho"
    } else {
        if (tituloLista) tituloLista.style.display = 'inline-block'; // Mostra "Itens no Carrinho"

        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            // Guarda o tempId junto para referência no DOM
            acc[categoria].push({ ...item });
            return acc;
        }, {});

        // Ordena as categorias pela ordem definida
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            // Se ambas não estão na lista, ordem alfabética
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
             // Se A não está na lista, vai para o final
            if (indexA === -1) return 1;
            // Se B não está na lista, vai para o final
            if (indexB === -1) return -1;
            // Ordena pela posição na lista 'ordemCategorias'
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            // Ordena itens dentro da categoria: Pendentes primeiro, depois alfabeticamente
            itensDaCategoria.sort((a, b) => {
                const aPendente = !a.valorUnitario || a.valorUnitario <= 0;
                const bPendente = !b.valorUnitario || b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1; // a (pendente) vem antes de b (não pendente)
                if (!aPendente && bPendente) return 1;  // b (pendente) vem antes de a (não pendente)
                // Se ambos pendentes ou ambos não pendentes, ordena por descrição
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
                // Usa o tempId para identificar o item no array 'compras' original
                li.dataset.tempId = item.tempId;

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                if (isPendente) {
                    li.classList.add('item-pendente'); // Adiciona classe para estilo de item pendente
                }

                // Define a cor do botão excluir baseado se tem preço ou não
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

                // Adiciona listener para abrir modal de edição ao clicar no item (não no botão excluir)
                li.addEventListener('click', (event) => {
                    // Só edita se o clique NÃO foi no botão de excluir
                    if (!event.target.closest('.excluir-item')) {
                         // Encontra o índice real no array 'compras' usando o tempId
                         const indexParaEditar = compras.findIndex(compra => compra.tempId === li.dataset.tempId);
                         if (indexParaEditar !== -1) {
                             editarItem(indexParaEditar);
                         } else {
                              console.error("Erro: Não foi possível encontrar o item no array para edição usando tempId:", li.dataset.tempId);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                         }
                    }
                });
                categoryGroup.appendChild(li);
            });

            listaComprasUL.appendChild(categoryGroup); // Adiciona o grupo da categoria à lista principal
        });
    }

    // Limpa os tempIds após renderizar
    compras.forEach(item => delete item.tempId);

    // Aplica o filtro de categoria selecionado (caso haja um)
    aplicarFiltroCategoria();

    // Calcula totais gerais
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size; // Conta nomes únicos

    // Atualiza os painéis de total e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza o oculto também
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    // Atualiza a barra de progresso e verifica o orçamento
    verificarOrcamento(totalGeral);
}


// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');
    let algumGrupoVisivel = false;

    // Se a lista principal está vazia (mostrando a mensagem), não faz nada
    if (listaVaziaMsg && !todosGrupos.length) return;

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden'); // Mostra grupo
            algumGrupoVisivel = true;
        } else {
            grupo.classList.add('hidden'); // Esconde grupo
        }
    });

    // Verifica se existe a mensagem de "sem resultados" e a remove se necessário
    let noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }

    // Se nenhum grupo ficou visível após o filtro E a lista não está vazia E um filtro foi selecionado
    if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
        // Adiciona a mensagem de filtro sem resultados
        const msg = document.createElement('li');
        msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
        msg.classList.add('filtro-sem-resultados'); // Usa a classe para estilização
        listaComprasUL.appendChild(msg);
    }
}


// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        const porcentagemReal = (total / orcamento) * 100;
        // Limita a barra em 100%, mas o texto pode mostrar o valor real > 100%
        porcentagem = Math.min(porcentagemReal, 100);
        barraProgresso.value = porcentagem; // Atualiza o valor da barra

        if (total > orcamento) {
            // Orçamento estourado
            progressBarContainer.classList.add('over-budget'); // Adiciona classe para estilizar a barra (vermelha)
            // Mostra porcentagem real no texto, mesmo acima de 100%
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`;
            // Muda a cor do painel total para indicar alerta
            painelTotal.style.backgroundColor = '#f8d7da'; // Fundo vermelho claro
            painelTotal.style.color = '#721c24'; // Texto vermelho escuro
            painelTotal.style.borderColor = '#f5c6cb'; // Borda vermelha clara
        } else {
            // Dentro do orçamento
            progressBarContainer.classList.remove('over-budget'); // Remove classe de estouro
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`; // Mostra porcentagem normal
            // Restaura cores normais do painel total
            painelTotal.style.backgroundColor = '#e9f5e9'; // Fundo verde claro
            painelTotal.style.color = '#006400'; // Texto verde escuro
            painelTotal.style.borderColor = '#c8e6c9'; // Borda verde clara
        }
    } else {
        // Sem orçamento definido
        barraProgresso.value = 0; // Zera a barra
        porcentagemProgresso.textContent = '0%'; // Mostra 0%
        progressBarContainer.classList.remove('over-budget'); // Garante que não está como estourado
        // Cores normais do painel total
        painelTotal.style.backgroundColor = '#e9f5e9';
        painelTotal.style.color = '#006400';
        painelTotal.style.borderColor = '#c8e6c9';
    }
}

// --- Funções de Edição e Modal ---

// Abre o modal para editar um item específico pelo seu índice original
function editarItem(index) {
    if (index === null || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição.");
        return;
    }
    itemEditandoIndex = index; // Guarda o índice do item que está sendo editado
    const item = compras[index];

    // Preenche os campos do modal com os dados atuais do item
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata o valor para exibição (com vírgula), ou deixa vazio se for 0
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    modalEdicao.style.display = 'block'; // Mostra o modal

    // Rola a view para o modal e foca no primeiro campo após um pequeno delay
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select(); // Seleciona o texto para facilitar a edição
    }, 350); // Delay para garantir que o modal esteja visível e a rolagem completa
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none'; // Esconde o modal
    itemEditandoIndex = null; // Limpa o índice do item em edição
}

// Formata o campo de valor no modal de edição enquanto digita
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    if (value) {
        // Converte para número, divide por 100 para ter os centavos e formata com 2 casas decimais e vírgula
        let numberValue = parseInt(value, 10) / 100;
        e.target.value = numberValue.toFixed(2).replace('.', ',');
    } else {
        // Se apagar tudo, deixa o campo vazio
        e.target.value = '';
    }
});

// --- Funções de Reconhecimento de Voz ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR'; // Define o idioma
    recognition.interimResults = false; // Não retorna resultados parciais
    recognition.maxAlternatives = 1; // Retorna apenas a melhor alternativa

    // Quando um resultado é obtido
    recognition.onresult = (event) => {
        // Pega a transcrição da última fala detectada
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        // Identifica qual input deve receber o texto (armazenado em targetInputId)
        const targetInputId = recognition.targetInputId;
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript; // Coloca o texto transcrito no input
            // Se for o input de valor, dispara o evento 'input' para re-formatar
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('input'));
            }
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`);
            // Poderia auto-processar o input principal aqui, se desejado:
            // if (targetInput === vozInput) processarEAdicionarItem(transcript);
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        // Remove o estilo de "gravando" dos botões de microfone
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Em caso de erro no reconhecimento
    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento de voz: ';
        if (event.error == 'no-speech') { errorMsg += 'Nenhuma fala detectada.'; }
        else if (event.error == 'audio-capture') { errorMsg += 'Falha na captura de áudio (verifique permissão do microfone).'; }
        else if (event.error == 'not-allowed') { errorMsg += 'Permissão para usar o microfone negada.'; }
        else { errorMsg += event.error; }
        mostrarFeedbackErro(errorMsg);
        console.error('Speech recognition error:', event.error);
        // Remove o estilo de "gravando"
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Quando o reconhecimento termina (mesmo sem resultado)
    recognition.onend = () => {
        // Garante a remoção do estilo de "gravando"
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    // Se a API não for suportada pelo navegador
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    // Desabilita todos os botões de microfone
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
    // Para qualquer reconhecimento anterior em andamento
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estiver rodando */ }

    try {
        recognition.targetInputId = inputId; // Guarda qual input receberá o resultado
        recognition.start(); // Inicia o reconhecimento
        mostrarFeedback("Ouvindo...", 'info'); // Dá feedback ao usuário

        // Adiciona a classe 'recording' ao botão clicado para dar feedback visual
        // Procura o botão pelo data-target ou pelo ID #ativarVoz (caso do input principal)
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], #ativarVoz`);
        if (clickedButton) {
            clickedButton.classList.add('recording');
        }
        /* // Lógica alternativa se o botão principal não tiver data-target
           else if (inputId === 'vozInput' && ativarVoz) {
               ativarVoz.classList.add('recording');
           }
        */
    } catch (e) {
        // Captura erros ao tentar iniciar (ex: reconhecimento já ativo)
        console.error("Erro ao iniciar reconhecimento de voz:", e);
        mostrarFeedbackErro("Não foi possível iniciar o reconhecimento de voz.");
        // Garante a remoção da classe 'recording' em caso de falha
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
            // Converte a planilha para JSON (array de arrays)
            // header: 1 -> Trata a primeira linha como dados, não cabeçalho
            // defval: "" -> Células vazias viram string vazia
            // raw: false -> Tenta formatar valores (datas, números)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            // Verifica se há pelo menos uma linha de dados (além do possível cabeçalho)
            if (jsonData.length < 1) { // Ajustado para < 1 pois header:1 significa que não há header real
                mostrarFeedbackErro("Planilha vazia ou sem dados válidos.");
                return;
            }

            // Considera todas as linhas como dados (se usar header:1)
            const dadosItens = jsonData; // Se tinha cabeçalho, ajuste para jsonData.slice(1);
            let itensImportados = 0;
            let errosImportacao = 0;
            let itensPulados = 0;

            dadosItens.forEach((row, index) => {
                 // Pula linhas completamente vazias ou inválidas
                if (row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== '')) {
                    // Assume ordem: Descrição, Quantidade, Valor Unitário, Categoria
                    const descricao = String(row[0] || '').trim();
                    const quantidadeStr = String(row[1] || '1').trim(); // Padrão 1 se vazio
                    const valorUnitarioStr = String(row[2] || '0').trim(); // Padrão 0 se vazio
                    // Pega categoria da planilha ou infere se vazia
                    const categoria = String(row[3] || '').trim() || inferirCategoria(descricao);

                    // Tenta converter quantidade e valor
                    const quantidade = parseInt(quantidadeStr);
                    const valorUnitario = parseNumber(valorUnitarioStr);

                    // Validação básica: Descrição não vazia e Quantidade válida > 0
                    if (descricao && !isNaN(quantidade) && quantidade > 0) {
                        // Verifica se item já existe (ignorando maiúsculas/minúsculas)
                        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                        if (itemExistenteIndex === -1) {
                             // Adiciona novo item
                             compras.push({ descricao, quantidade, valorUnitario, categoria });
                             itensImportados++;
                        } else {
                             // Item duplicado, ignora
                             console.warn(`Item "${descricao}" já existe na lista, pulando importação da linha ${index + 1}.`);
                             itensPulados++;
                        }
                    } else {
                        // Linha inválida
                        console.warn(`Linha ${index + 1} inválida ou incompleta: Desc='${descricao}', Qtd='${quantidadeStr}', Valor='${valorUnitarioStr}'`);
                        errosImportacao++;
                    }
                }
            });

            // Monta mensagem de feedback
            let feedbackMsg = "";
            if (itensImportados > 0) feedbackMsg += `${itensImportados} itens importados! `;
            if (itensPulados > 0) feedbackMsg += `${itensPulados} ignorados (já existiam). `;
            if (errosImportacao > 0) feedbackMsg += `${errosImportacao} linhas com erros.`;

            // Exibe feedback e atualiza a lista se algo foi importado
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
    // Handler para erro de leitura do arquivo
    reader.onerror = (error) => {
        console.error("Erro ao ler o arquivo:", error);
        mostrarFeedbackErro("Não foi possível ler o arquivo selecionado.");
    };
    // Inicia a leitura do arquivo como ArrayBuffer
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

    // Divide o texto por vírgulas, remove espaços extras e filtra itens vazios
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
        // Verifica se o item já existe na lista
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) {
            // Item não existe, adiciona com qtd 1, valor 0 e categoria inferida
            const categoria = inferirCategoria(nomeItem);
            compras.push({
                descricao: nomeItem,
                quantidade: 1,
                valorUnitario: 0,
                categoria: categoria
            });
            itensAdicionados++;
        } else {
            // Item duplicado
            console.warn(`Item "${nomeItem}" já existe, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    // Monta mensagem de feedback
    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) importado(s)! `;
        atualizarLista(); // Atualiza a interface
        salvarDados(); // Salva no localStorage
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) (já existiam).`;
    }

    // Exibe o feedback apropriado
    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        // Se só houve duplicados, mostra como erro/aviso
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         // Se não adicionou nem duplicou (ex: texto inválido que passou filtro inicial)
         mostrarFeedbackErro("Não foi possível importar itens da lista.");
    }

    // Fecha o modal de importação por texto
    if (modalTextImport) modalTextImport.style.display = 'none';
}


// Gera um relatório Excel (.xlsx) da lista de compras atual
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista de compras está vazia. Adicione itens para gerar o relatório.");
        return;
    }

    // Mapeia os dados da lista para o formato desejado no Excel
    const dadosParaExportar = compras.map(item => ({
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        // Formata valor unitário com vírgula ou como '0,00'
        'Valor Unitário (R$)': item.valorUnitario ? item.valorUnitario.toFixed(2).replace('.', ',') : '0,00',
        'Categoria': item.categoria || 'Outros', // Usa 'Outros' se não houver categoria
        // Calcula e formata valor total do item
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0)).toFixed(2).replace('.', ',')
    }));

    // Calcula o total geral da compra
    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Cria a worksheet a partir dos dados JSON
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Categoria', 'Valor Total (R$)'] // Define a ordem e nome das colunas
    });

    // Adiciona linhas extras no final para o Total Geral
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco para separar
        ['', '', '', 'Total Geral:', totalGeral.toFixed(2).replace('.', ',')] // Linha com o total
    ], { origin: -1 }); // origin: -1 adiciona ao final da planilha

    // Define larguras aproximadas para as colunas (opcional, mas melhora visualização)
    const columnWidths = [
        // Pega o maior tamanho entre o header e os dados (limitado a 60)
        { wch: Math.min(60, Math.max(40, ...dadosParaExportar.map(i => i.Descrição?.length || 0))) },
        { wch: 12 }, // Largura fixa para Quantidade
        { wch: 20 }, // Largura fixa para Valor Unitário
        { wch: 20 }, // Largura fixa para Categoria
        { wch: 20 }  // Largura fixa para Valor Total
    ];
    worksheet['!cols'] = columnWidths;

    // Cria o workbook (arquivo Excel)
    const workbook = XLSX.utils.book_new();
    // Adiciona a worksheet ao workbook com o nome "Lista de Compras"
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    // Gera o nome do arquivo com a data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;

    // Tenta fazer o download do arquivo
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
    ocultarFeedback(); // Limpa feedback ao digitar
    awesompleteInstance.evaluate(); // Avalia sugestões do Awesomplete
});
vozInput.addEventListener('keypress', (e) => {
    // Processa o item ao pressionar Enter, SE o Awesomplete não estiver aberto
    if (e.key === 'Enter' && !awesompleteInstance.opened) {
        processarEAdicionarItem(vozInput.value);
    }
});
// Botão principal de ativar voz
if (ativarVoz) {
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput'); // Chama a função de voz para o input principal
     });
}

// Inserir Item pelo botão '+'
inserirItem.addEventListener('click', () => {
    // Rola a view para o input (útil em mobile se teclado virtual estiver aberto)
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Pequeno delay para garantir que a rolagem ocorra antes de processar
    setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    }, 50);
});

// Limpar Input principal
limparInput.addEventListener('click', () => {
    vozInput.value = ''; // Limpa o campo
    ocultarFeedback(); // Esconde feedback
    awesompleteInstance.close(); // Fecha sugestões do Awesomplete
    vozInput.focus(); // Devolve o foco ao campo
});

// Delegação de eventos para excluir item (listener na UL pai)
listaComprasUL.addEventListener('click', (event) => {
    // Verifica se o clique foi no botão de excluir ou em seu ícone interno
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li'); // Encontra o <li> pai
        if (!li || !li.dataset.tempId) return; // Se não encontrar o LI ou o ID, ignora

        // Encontra o índice real do item no array usando o tempId
        const index = compras.findIndex(item => item.tempId === li.dataset.tempId);

         if (index !== -1) { // Verifica se encontrou o índice
             const itemParaExcluir = compras[index];
             // Confirmação com o usuário
             if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                 // Animação de saída (fade out e encolhimento)
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-50px)'; // Desliza para a esquerda
                 li.style.maxHeight = '0'; // Encolhe a altura
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.borderWidth = '0'; // Remove bordas durante a animação

                 // Remove o item do array 'compras'
                 compras.splice(index, 1);

                 // Aguarda a animação terminar antes de atualizar a lista completamente
                 setTimeout(() => {
                      atualizarLista(); // Redesenha a lista
                      salvarDados(); // Salva as mudanças
                      mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                 }, 400); // Tempo um pouco maior que a animação mais longa
             }
         } else {
             // Se não encontrou o índice (erro inesperado)
             console.error("Erro: Índice não encontrado para exclusão usando tempId:", li.dataset.tempId);
             mostrarFeedbackErro("Erro ao tentar excluir item.");
             atualizarLista(); // Atualiza a lista para garantir consistência visual
         }
    }
});

// Filtro por categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    // Salva e verifica o orçamento dinamicamente enquanto digita (ou cola)
    salvarDados();
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
// Formata o valor do orçamento quando o campo perde o foco (blur)
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    if (valorNumerico > 0) {
        // Formata para R$ XX,XX se for um valor válido > 0
        orcamentoInput.value = valorNumerico.toFixed(2).replace('.', ',');
    } else {
        // Limpa o campo se for 0 ou inválido
         orcamentoInput.value = '';
    }
    // Salva o valor formatado (ou vazio)
    salvarDados();
});

// --- Listeners para Botões de Ação Superiores e Modais de Importação ---

// Botão "Importar" principal -> Abre modal de escolha
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block'; // Mostra o modal de escolha
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Rola para ele
    } else {
        console.error("Modal #modalImportChoice não encontrado no DOM.");
        mostrarFeedbackErro("Erro ao abrir opções de importação.");
    }
});

// Botão escolher importação XLSX -> Abre modal de info XLSX
if (importChoiceXlsxBtn) {
    importChoiceXlsxBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        if (modalImportInfo) {
            modalImportInfo.style.display = 'block'; // Mostra modal de info XLSX
            modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             console.error("Modal #modalImportInfo não encontrado no DOM.");
             mostrarFeedbackErro("Erro ao abrir informações de importação XLSX.");
        }
    });
}

// Botão "Continuar" importação XLSX (dentro do modal de info) -> Abre seletor de arquivo
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none'; // Fecha modal de info
        // Cria um input de arquivo dinamicamente
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        // Define os tipos de arquivo aceitos
        fileInput.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
        fileInput.style.display = 'none'; // Esconde o input
        // Listener para quando um arquivo é selecionado
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0]; // Pega o primeiro arquivo selecionado
            if (file) {
                importarDadosXLSX(file); // Chama a função de importação
            }
            document.body.removeChild(fileInput); // Remove o input dinâmico após uso
        });
        document.body.appendChild(fileInput); // Adiciona o input ao corpo do documento
        fileInput.click(); // Simula um clique no input para abrir o seletor de arquivos
    });
}

// Botão escolher importação por Texto -> Abre modal de importação de texto
if (importChoiceTextBtn) {
    importChoiceTextBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        if (modalTextImport) {
            textImportArea.value = ''; // Limpa a área de texto
            modalTextImport.style.display = 'block'; // Mostra o modal de texto
            modalTextImport.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Foca na área de texto após um pequeno delay
            setTimeout(() => textImportArea.focus(), 300);
        } else {
             console.error("Modal #modalTextImport não encontrado no DOM.");
             mostrarFeedbackErro("Erro ao abrir importação por texto.");
        }
    });
}

// Botão processar importação por Texto (dentro do modal de texto)
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}

// Botão Limpar Lista
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    // Confirmação dupla para evitar limpeza acidental
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras?')) {
        if(confirm('Esta ação não pode ser desfeita. Confirma a limpeza da lista e do orçamento?')){
            compras = []; // Esvazia o array de compras
            orcamentoInput.value = ''; // Limpa o campo de orçamento
            salvarDados(); // Salva o estado vazio no localStorage
            atualizarLista(); // Atualiza a interface para mostrar lista vazia
            mostrarFeedbackSucesso('Lista e orçamento limpos!');
            categoriaFiltro.value = ""; // Reseta o filtro de categoria
        }
    }
});

// Botão Gerar Relatório Excel
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição ---

// Botão Salvar Edição (dentro do modal de edição)
salvarEdicaoBtn.addEventListener('click', () => {
     // Verifica se há um item sendo editado
     if (itemEditandoIndex === null || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao();
         return;
     }

     // Pega os novos valores dos campos do modal
     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1; // Padrão 1 se inválido
     const novoValorUnitario = parseNumber(editarValor.value); // Usa a função parseNumber

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

     // Re-infere a categoria baseada na nova descrição (pode ter mudado)
     const novaCategoria = inferirCategoria(novaDescricao);

     // Atualiza o item no array 'compras' com os novos dados
     compras[itemEditandoIndex] = {
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria
         // Mantém outras propriedades se houver, ex: tempId, se necessário
     };

     fecharModalEdicao(); // Fecha o modal
     atualizarLista(); // Atualiza a interface
     salvarDados(); // Salva no localStorage
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`);
});

// Microfones dentro do modal de edição
document.querySelectorAll('#modalEdicao .modal-mic-btn').forEach(button => {
    const targetId = button.dataset.target; // Pega o ID do input alvo (editarDescricao, etc.)
    if (targetId && recognition) {
        // Adiciona listener de clique para ativar a voz para o input correspondente
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition) {
         // Desabilita o botão se o reconhecimento de voz não for suportado
         button.disabled = true;
    }
});

// --- Listeners Genéricos para Fechar Modais ---

// Botão 'X' genérico (usando data-target para saber qual modal fechar)
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target; // Pega o ID do modal alvo do atributo data-target
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            targetModal.style.display = 'none'; // Esconde o modal específico
        } else {
            // Fallback: tenta fechar o modal pai mais próximo (menos específico)
            const parentModal = btn.closest('.modal');
            if(parentModal) {
                parentModal.style.display = 'none';
            } else {
                 console.warn(`Modal com ID "${targetModalId}" não encontrado para fechar.`);
            }
        }
    });
});

// Clicar fora do conteúdo do modal (no fundo escuro) para fechar
window.addEventListener('click', (event) => {
    // Verifica se o clique foi diretamente no elemento com a classe 'modal' (o fundo)
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none'; // Esconde o modal clicado
    }
});

// Tecla ESC para fechar qualquer modal aberto
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        // Seleciona TODOS os modais que estão visíveis e os esconde
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
         // Opcional: Se o reconhecimento de voz estiver ativo, pará-lo
         if (recognition && document.querySelector('.mic-btn.recording')) {
              try { recognition.stop(); } catch(e) {}
              document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
              ocultarFeedback();
         }
    }
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega dados salvos do localStorage

    // Formata o valor do orçamento carregado ao iniciar
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    if (valorOrcamentoCarregado > 0) {
         orcamentoInput.value = valorOrcamentoCarregado.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = ''; // Limpa se for inválido ou zero
    }

    atualizarLista(); // Exibe a lista inicial e calcula totais/orçamento

});