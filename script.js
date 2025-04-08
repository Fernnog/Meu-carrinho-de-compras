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

// Processa o texto de entrada (voz ou digitação) e adiciona/atualiza o item
function processarEAdicionarItem(texto) {
    if (!texto || texto.trim() === '') {
        mostrarFeedbackErro('Digite ou dite alguma informação do item.');
        return;
    }

    texto = texto.trim();
    let quantidade = 1; // Padrão
    let descricao = texto; // Assume inicialmente que tudo é descrição
    let valorUnitario = 0; // Padrão

    // Tenta extrair usando REGEX (mais flexível)
    // Regex: (quantidade X)? (descrição) (preço/valor Y)?
    // Exemplo: "2 kg arroz 5,99", "maçã gala valor 3.50", "quantidade 3 detergente", "só nome do item"
    const regex = /(?:quantidade|qtd|qt)\s*(\d+)\s*|(?:pre[cç]o|valor|val)\s*([\d,\.]+)\s*/gi;
    let match;
    let extractedDesc = texto;

    // Primeiro extrai quantidade e preço e remove do texto original
    while ((match = regex.exec(texto)) !== null) {
        if (match[1]) { // Quantidade
            quantidade = parseInt(match[1], 10);
            extractedDesc = extractedDesc.replace(match[0], '').trim(); // Remove a parte da quantidade
        }
        if (match[2]) { // Preço
            valorUnitario = parseNumber(match[2]);
            extractedDesc = extractedDesc.replace(match[0], '').trim(); // Remove a parte do preço
        }
    }

    // O que sobrou é a descrição (tenta limpar um pouco)
    descricao = extractedDesc.replace(/descri[cç][aã]o/gi, '').replace(/^x\s+/i, '').trim(); // Remove "descrição" e "x " no início

    // Se a descrição ainda contiver números soltos no final, pode ser o preço
    const finalNumeroMatch = descricao.match(/([\d,\.]+)$/);
    if (!valorUnitario && finalNumeroMatch) {
        const possivelPreco = parseNumber(finalNumeroMatch[1]);
        if (possivelPreco > 0) {
            valorUnitario = possivelPreco;
            descricao = descricao.replace(finalNumeroMatch[0], '').trim(); // Remove o número do final
        }
    }

    // Se a descrição começar com número e 'x', pode ser quantidade
    const inicioQtdMatch = descricao.match(/^(\d+)\s*x\s+/i);
    if (quantidade === 1 && inicioQtdMatch) {
        quantidade = parseInt(inicioQtdMatch[1], 10);
        descricao = descricao.replace(inicioQtdMatch[0], '').trim(); // Remove "Nx " do início
    }

    // Remove múltiplos espaços
    descricao = descricao.replace(/\s+/g, ' ').trim();

    // VALIDAÇÕES
    if (!descricao) {
        mostrarFeedbackErro('A descrição não pode estar vazia.');
        return;
    }

    try {
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
        if (itemExistenteIndex > -1) {
            // Item já existe. Confirma atualização.
            if (confirm(`"${descricao}" já está na lista. Deseja somar a quantidade (${compras[itemExistenteIndex].quantidade} + ${quantidade}) e atualizar o valor unitário (para R$ ${valorUnitario.toFixed(2).replace('.', ',')})?`)) {
                compras[itemExistenteIndex].quantidade += quantidade;
                // Atualiza valor unitário se um novo foi fornecido (maior que zero) OU se o valor antigo era zero ou indefinido
                if (valorUnitario > 0 || !compras[itemExistenteIndex].valorUnitario || compras[itemExistenteIndex].valorUnitario <= 0) {
                    compras[itemExistenteIndex].valorUnitario = valorUnitario;
                }
                 // Não re-inferir categoria aqui, manter a original ou a que foi editada manualmente
            } else {
                mostrarFeedbackErro("Adição/Atualização cancelada.");
                vozInput.focus(); // Mantém o foco no input
                return; // Não faz nada se cancelar
            }
        } else {
            // Item novo
            const categoria = inferirCategoria(descricao);
            const novoItem = { descricao, quantidade, valorUnitario, categoria };
            compras.push(novoItem);
        }

        atualizarLista(); // Atualiza a exibição da lista
        salvarDados(); // Salva no localStorage
        vozInput.value = ''; // Limpa o input
        ocultarFeedback();
        mostrarFeedbackSucesso(`Item "${descricao}" adicionado/atualizado!`);
        vozInput.focus(); // Devolve o foco ao input

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
    // A chamada inicial de atualizarLista() em DOMContentLoaded cuidará de exibir os dados.
}

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback na área abaixo do input principal
function mostrarFeedback(mensagem, tipo = 'info') {
    vozFeedback.textContent = mensagem;
    vozFeedback.className = `voz-feedback show ${tipo}`; // Adiciona 'show' para transição CSS
    vozFeedback.style.display = 'block'; // Garante visibilidade
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() {
    vozFeedback.classList.remove('show'); // Remove 'show' para fade-out
    // Permite que a transição CSS ocorra antes de esconder completamente
    setTimeout(() => {
        if (!vozFeedback.classList.contains('show')) { // Verifica se ainda está oculto
            vozFeedback.style.display = 'none';
            vozFeedback.textContent = '';
            vozFeedback.className = 'voz-feedback'; // Reseta classe completamente
        }
    }, 300); // Tempo da transição de opacidade em styles.css
}

// Atualiza a exibição da lista de compras, agrupando por categoria
function atualizarLista() {
    listaComprasUL.innerHTML = ''; // Limpa apenas a UL de itens
    let totalGeral = 0;
    let totalUnidades = 0;
    const tituloLista = listaComprasContainer.querySelector('h2'); // Seleciona o H2 dentro do container

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Sua lista de compras está vazia.</li>'; // Mensagem se vazio
        if (tituloLista) tituloLista.style.display = 'none'; // Esconde o título "Itens no Carrinho"
    } else {
        if (tituloLista) tituloLista.style.display = 'inline-block'; // Garante que título aparece (e centralizado pelo CSS)

        // 1. Agrupar itens por categoria
        const itensAgrupados = compras.reduce((acc, item, index) => { // Adiciona index aqui
            const categoria = item.categoria || 'Outros'; // Garante categoria
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            // Adiciona o índice original ao item para referência posterior estável
            acc[categoria].push({ ...item, originalIndex: index });
            return acc;
        }, {});

        // 2. Ordenar categorias na ordem desejada
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            // Lógica de ordenação: categorias definidas primeiro, depois alfabética
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
                const aPendente = !a.valorUnitario || a.valorUnitario <= 0;
                const bPendente = !b.valorUnitario || b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1; // Pendente A vem antes
                if (!aPendente && bPendente) return 1;  // Pendente B vem antes
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' }); // Alfabética
            });

            // Criar o grupo visual para a categoria
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Para filtro

            // Criar o cabeçalho da categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader);

            // Renderizar itens da categoria
            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                li.dataset.index = item.originalIndex; // Usa o índice original salvo

                const isPendente = !item.valorUnitario || item.valorUnitario <= 0;
                if (isPendente) {
                    li.classList.add('item-pendente');
                }

                // Define a classe do botão de lixeira baseado no valor
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

                // Event listener para edição (clicar no LI, exceto no botão de excluir)
                li.addEventListener('click', (event) => {
                    // Verifica se o clique NÃO foi no botão ou seu ícone
                    if (!event.target.closest('.excluir-item')) {
                         const indexParaEditar = parseInt(li.dataset.index, 10); // Pega o índice do dataset
                         if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                             editarItem(indexParaEditar);
                         } else {
                              console.error("Índice original inválido ou não encontrado para edição:", indexParaEditar, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                         }
                    }
                });
                categoryGroup.appendChild(li); // Adiciona item ao grupo da categoria
            });

            listaComprasUL.appendChild(categoryGroup); // Adiciona o grupo completo à UL principal
        });
    }

    // Aplicar filtro de visibilidade inicial (caso um filtro esteja selecionado)
    aplicarFiltroCategoria();

    // Calcula totais GERAIS (usando a lista 'compras' completa)
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza painéis de totais e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza o oculto
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    // Atualiza a barra de progresso e o status do orçamento
    verificarOrcamento(totalGeral);
}

// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');
    let algumGrupoVisivel = false;

    // Se a lista original está vazia, não faz nada com os grupos
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

    // Opcional: Mostrar mensagem se o filtro não retornar resultados
    let noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
    if (!algumGrupoVisivel && categoriaSelecionada !== "" && !listaVaziaMsg) {
        if (!noResultsMsg) {
            const msg = document.createElement('li');
            msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
            msg.classList.add('filtro-sem-resultados');
            // Insere após o último grupo visível ou no início se nenhum for
            listaComprasUL.appendChild(msg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    const orcamento = parseNumber(orcamentoInput.value) || 0; // Usa parseNumber
    let porcentagem = 0;

    // --- Logs de Debug (Comentados) ---
    // console.log(`Verificando Orçamento: Total=R$${total.toFixed(2)}, Orçamento=R$${orcamento.toFixed(2)}`);
    // --- Fim do Log ---

    if (orcamento > 0) {
        const porcentagemReal = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagemReal, 100); // Barra não passa de 100% visualmente
        barraProgresso.value = porcentagem; // Define o valor da barra (0 a 100)

        // --- Log de Debug (Comentado) ---
        // console.log(`Calculado: PorcentagemReal=${porcentagemReal.toFixed(2)}%, PorcentagemBarra=${porcentagem.toFixed(2)}%`);
        // --- Fim do Log ---

        // Adiciona ou remove a classe para estilização do estouro
        if (total > orcamento) {
            progressBarContainer.classList.add('over-budget');
            porcentagemProgresso.textContent = `Estourado! (${Math.round(porcentagemReal)}%)`; // Mostra porcentagem real
            // Aplica estilo de alerta no painel total
            painelTotal.style.backgroundColor = '#f8d7da';
            painelTotal.style.color = '#721c24';
            painelTotal.style.borderColor = '#f5c6cb';
        } else {
            progressBarContainer.classList.remove('over-budget');
            porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`; // Mostra porcentagem até 100%
            // Reseta estilo do painel total
            painelTotal.style.backgroundColor = '#e9f5e9';
            painelTotal.style.color = '#006400';
            painelTotal.style.borderColor = '#c8e6c9';
        }
    } else {
         // --- Log de Debug (Comentado) ---
         // console.log("Orçamento zerado ou inválido, barra em 0%.");
         // --- Fim do Log ---
        barraProgresso.value = 0; // Barra zerada se não há orçamento
        porcentagemProgresso.textContent = '0%';
        progressBarContainer.classList.remove('over-budget'); // Garante que a classe seja removida
        // Reseta estilo do painel total
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
    itemEditandoIndex = index; // Guarda o índice do item sendo editado
    const item = compras[index];

    // Preenche os campos do modal com os dados do item
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata valor para exibição no input (com vírgula e duas casas decimais, ou vazio se zero)
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    modalEdicao.style.display = 'block'; // Mostra o modal

    // Scroll suave para o modal e foca no primeiro campo após um pequeno delay
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select(); // Seleciona o texto para facilitar a edição
    }, 350); // Ajuste o tempo se necessário
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Limpa o índice do item sendo editado
    // Limpar campos do modal é opcional, pode ser útil
    // editarDescricao.value = '';
    // editarQuantidade.value = '';
    // editarValor.value = '';
}

// Formata o campo de valor no modal de edição enquanto digita
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    // Remove tudo que não for dígito para simplificar
    value = value.replace(/\D/g, '');
    if (value) {
        // Converte para número e divide por 100
        let numberValue = parseInt(value, 10) / 100;
        // Formata de volta para string com vírgula e duas casas decimais
        e.target.value = numberValue.toFixed(2).replace('.', ',');
    } else {
        e.target.value = ''; // Limpa se não houver dígitos
    }
});

// --- Funções de Reconhecimento de Voz ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR'; // Define o idioma
    recognition.interimResults = false; // Retorna apenas resultados finais
    recognition.maxAlternatives = 1; // Apenas a melhor alternativa

    // Quando um resultado é obtido
    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const targetInputId = recognition.targetInputId; // Pega o ID do input alvo definido ao iniciar
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            targetInput.value = transcript; // Preenche o input alvo
            // Disparar evento 'input' para campos que precisam de formatação (como o valor no modal)
            if (targetInput === editarValor) {
                 targetInput.dispatchEvent(new Event('input'));
            }
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`);
            // Opcional: Tentar processar automaticamente após ditado no input principal?
            // if (targetInput === vozInput) processarEAdicionarItem(transcript);
        } else {
            console.warn("Input alvo para reconhecimento de voz não encontrado:", targetInputId);
        }
        // Remove classe 'recording' de todos os botões de microfone
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    // Em caso de erro
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

    // Quando o reconhecimento termina (naturalmente ou por stop())
    recognition.onend = () => {
        document.querySelectorAll('.mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    // Desabilitar botões de microfone se a API não existir
    document.querySelectorAll('.mic-btn').forEach(btn => {
        btn.disabled = true;
        btn.title = "Reconhecimento de voz não suportado"; // Informa o usuário
    });
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        mostrarFeedbackErro("Reconhecimento de voz não suportado ou inicializado.");
        return;
    }
    // Para o reconhecimento se já estiver ativo (evita erro 'already started')
    try { recognition.stop(); } catch(e) { /* Ignora erro se não estava ativo */ }

    try {
        recognition.targetInputId = inputId; // Armazena o ID do input que receberá o resultado
        recognition.start();
        mostrarFeedback("Ouvindo...", 'info');

        // Adiciona feedback visual no botão clicado
        const clickedButton = document.querySelector(`.mic-btn[data-target="${inputId}"], #ativarVoz`);
        if (clickedButton) {
            clickedButton.classList.add('recording');
        } else if (inputId === 'vozInput' && ativarVoz) { // Caso especial do botão principal sem data-target
            ativarVoz.classList.add('recording');
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
            // Converte para JSON, tratando cabeçalhos e pegando dados crus formatados como string
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (jsonData.length < 2) { // Precisa ter cabeçalho + pelo menos uma linha de dados
                mostrarFeedbackErro("Planilha vazia ou sem dados válidos.");
                return;
            }

            // Remove linha de cabeçalho (assumindo que a primeira linha é cabeçalho)
            const dadosItens = jsonData.slice(1);
            let itensImportados = 0;
            let errosImportacao = 0;
            let itensPulados = 0;

            dadosItens.forEach((row, index) => {
                // Verifica se a linha não está completamente vazia e tem pelo menos descrição
                if (row && row.length > 0 && row.some(cell => cell !== null && String(cell).trim() !== '')) {
                    const descricao = String(row[0] || '').trim(); // Coluna A (índice 0)
                    const quantidadeStr = String(row[1] || '1').trim(); // Coluna B (índice 1), padrão '1'
                    const valorUnitarioStr = String(row[2] || '0').trim(); // Coluna C (índice 2), padrão '0'
                    const categoria = String(row[3] || '').trim() || inferirCategoria(descricao); // Coluna D (índice 3) ou inferir

                    // Validação mais robusta
                    const quantidade = parseInt(quantidadeStr);
                    const valorUnitario = parseNumber(valorUnitarioStr); // Usa a função de parse

                    if (descricao && !isNaN(quantidade) && quantidade > 0) {
                        // Verifica se já existe para evitar duplicados diretos
                        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                        if (itemExistenteIndex === -1) {
                             compras.push({ descricao, quantidade, valorUnitario, categoria });
                             itensImportados++;
                        } else {
                             console.warn(`Item "${descricao}" já existe na lista, pulando importação da linha ${index + 2}.`);
                             itensPulados++;
                        }
                    } else {
                        console.warn(`Linha ${index + 2} inválida ou incompleta: Desc='${descricao}', Qtd='${quantidadeStr}', Valor='${valorUnitarioStr}'`);
                        errosImportacao++;
                    }
                } else {
                     // Linha completamente vazia ou sem dados relevantes, ignora silenciosamente ou loga
                     // console.log(`Linha ${index + 2} vazia, ignorando.`);
                }
            });

            let feedbackMsg = "";
            if (itensImportados > 0) {
                feedbackMsg += `${itensImportados} itens importados com sucesso! `;
            }
            if (itensPulados > 0) {
                feedbackMsg += `${itensPulados} itens ignorados (já existiam). `;
            }
             if (errosImportacao > 0) {
                feedbackMsg += `${errosImportacao} linhas continham erros ou estavam incompletas.`;
            }

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
            mostrarFeedbackErro("Erro ao importar planilha. Verifique o formato e o conteúdo do arquivo.");
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

    // Divide por vírgula, remove espaços e filtra itens vazios
    const nomesItens = texto.split(',')
                           .map(item => item.trim())
                           .filter(item => item !== '');

    if (nomesItens.length === 0) {
        mostrarFeedbackErro("Nenhum nome de item válido encontrado na lista.");
        textImportArea.focus();
        return;
    }

    let itensAdicionados = 0;
    let itensDuplicados = 0;

    nomesItens.forEach(nomeItem => {
        // Verifica se já existe (case-insensitive)
        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === nomeItem.toLowerCase());

        if (itemExistenteIndex === -1) {
            // Item não existe, adiciona com valores padrão
            const categoria = inferirCategoria(nomeItem);
            compras.push({
                descricao: nomeItem,
                quantidade: 1, // Padrão 1
                valorUnitario: 0, // Padrão 0
                categoria: categoria // Categoria inferida
            });
            itensAdicionados++;
        } else {
            // Item já existe, apenas informa e pula
            console.warn(`Item "${nomeItem}" já existe na lista, importação por texto pulada.`);
            itensDuplicados++;
        }
    });

    // Prepara mensagem de feedback
    let feedbackMsg = "";
     if (itensAdicionados > 0) {
        feedbackMsg += `${itensAdicionados} novo(s) item(ns) importado(s) da lista! `;
        atualizarLista(); // Atualiza a UI
        salvarDados(); // Salva os dados
    }
    if (itensDuplicados > 0) {
        feedbackMsg += `${itensDuplicados} ignorado(s) por já existirem.`;
    }

    // Exibe o feedback apropriado
    if (itensAdicionados > 0) {
        mostrarFeedbackSucesso(feedbackMsg.trim());
    } else if (itensDuplicados > 0) {
        mostrarFeedbackErro(feedbackMsg.trim());
    } else {
         // Caso não tenha adicionado nem duplicado (poderia acontecer se a lista inicial era vazia?)
         mostrarFeedbackErro("Não foi possível importar itens da lista fornecida.");
    }

    // Fecha o modal de importação de texto
    if (modalTextImport) modalTextImport.style.display = 'none';
}


// Gera um relatório Excel (.xlsx) da lista de compras atual
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista está vazia, não há relatório para gerar.");
        return;
    }

    // Mapeia os dados para o formato da planilha, formatando valores
    const dadosParaExportar = compras.map(item => ({
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario ? item.valorUnitario.toFixed(2).replace('.', ',') : '0,00',
        'Categoria': item.categoria || 'Outros',
        'Valor Total (R$)': (item.quantidade * (item.valorUnitario || 0)).toFixed(2).replace('.', ',')
    }));

    // Calcula o total geral para adicionar ao final
    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);

    // Cria a planilha a partir dos dados mapeados
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Categoria', 'Valor Total (R$)'] // Ordem das colunas
    });

    // Adiciona linha de total geral formatada
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco para separar
        ['', '', '', 'Total Geral:', totalGeral.toFixed(2).replace('.', ',')] // Células vazias para alinhar
    ], { origin: -1 }); // Adiciona ao final da planilha existente

    // Ajusta largura das colunas (estimativa)
    const columnWidths = [
        { wch: Math.max(40, ...dadosParaExportar.map(i => i.Descrição?.length || 0)) }, // Descrição (largura dinâmica)
        { wch: 12 }, // Quantidade
        { wch: 20 }, // Valor Unitário
        { wch: 20 }, // Categoria
        { wch: 20 }  // Valor Total
    ];
    // Limita largura máxima da descrição
    if (columnWidths[0].wch > 60) columnWidths[0].wch = 60;
    worksheet['!cols'] = columnWidths;

    // Cria o workbook e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    // Gera o arquivo e inicia o download
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
    ocultarFeedback(); // Limpa feedback antigo ao digitar
    awesompleteInstance.evaluate(); // Avalia sugestões do Awesomplete
});
vozInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !awesompleteInstance.opened) { // Processa com Enter SÓ se a lista de sugestões não estiver aberta
        processarEAdicionarItem(vozInput.value);
    }
});
// Listener para o botão de ativar voz principal
if (ativarVoz) {
     ativarVoz.addEventListener('click', () => {
         ativarVozParaInput('vozInput');
     });
}

// Inserir Item pelo botão '+' (com scroll)
inserirItem.addEventListener('click', () => {
    // Scroll suave para a área de input ANTES de processar
    vozInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Processa o item após um pequeno delay (opcional, pode ajudar com o scroll)
    setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    }, 50);
});

// Limpar Input principal pelo botão 'X'
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    ocultarFeedback();
    awesompleteInstance.close(); // Fecha sugestões se estiverem abertas
    vozInput.focus();
});

// Delegação de eventos para botões de excluir na lista (UL)
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        if (!li || !li.dataset.index) return; // Segurança extra

        const index = parseInt(li.dataset.index, 10); // Pega o índice original do dataset

         if (!isNaN(index) && index >= 0 && index < compras.length) {
             const itemParaExcluir = compras[index]; // Guarda referência antes de remover
             // Confirmação
             if (confirm(`Tem certeza que deseja excluir "${itemParaExcluir.descricao}"?`)) {
                 // Animação de remoção (direto no LI)
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out, border 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-50px)'; // Desliza para esquerda (ou direita: '50px')
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.borderWidth = '0'; // Anima a borda também

                 // Remove o item do array DEPOIS de iniciar a animação
                 compras.splice(index, 1);

                 // Re-renderiza a lista APÓS a animação para ajustar índices e totais
                 setTimeout(() => {
                      atualizarLista(); // Renderiza novamente SEM o item e com índices recalculados
                      salvarDados(); // Salva a lista modificada
                      mostrarFeedbackSucesso(`"${itemParaExcluir.descricao}" excluído!`);
                 }, 400); // Tempo um pouco maior para animação completa
             }
         } else {
             console.error("Índice inválido ou item não encontrado para exclusão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item. Recarregue a página.");
             atualizarLista(); // Força atualização em caso de erro de índice
         }
    }
    // A edição é tratada no listener do LI dentro de atualizarLista()
});

// Filtro por categoria (Select)
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    // Permite digitar livremente, mas salva o valor atual
    salvarDados();
    // Recalcula o total atual e atualiza a barra imediatamente
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * (item.valorUnitario || 0)), 0);
    verificarOrcamento(totalAtual);
});
// Formatação ao perder o foco (blur) - Garante formato R$ 0,00 ou vazio
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    if (valorNumerico > 0) {
        orcamentoInput.value = valorNumerico.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = ''; // Limpa se for zero ou inválido
    }
    salvarDados(); // Salva o valor formatado (ou vazio)
});

// --- Listeners para Botões de Ação Superiores e Modais de Importação ---

// Botão "Importar" principal - Abre o modal de ESCOLHA
importarBtn.addEventListener('click', () => {
    if (modalImportChoice) {
        modalImportChoice.style.display = 'block';
        modalImportChoice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error("Modal de escolha de importação (#modalImportChoice) não encontrado no HTML.");
        mostrarFeedbackErro("Erro ao iniciar processo de importação.");
    }
});

// Botão para escolher importação XLSX (dentro do modal de escolha)
if (importChoiceXlsxBtn) {
    importChoiceXlsxBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        // Abre o modal de informação do XLSX
        if (modalImportInfo) {
            modalImportInfo.style.display = 'block';
            modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             console.error("Modal de informação XLSX (#modalImportInfo) não encontrado.");
             mostrarFeedbackErro("Erro ao tentar iniciar importação XLSX.");
        }
    });
}

// Botão "Continuar" dentro do modal de informação XLSX (inicia seleção de arquivo)
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none'; // Esconde o modal de info
        // Cria e clica no input de arquivo escondido
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // Mime types para Excel
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file); // Chama a função de processamento
            }
            document.body.removeChild(fileInput); // Limpa o input do DOM após uso
        });
        document.body.appendChild(fileInput);
        fileInput.click(); // Abre a janela de seleção de arquivo
    });
}

// Botão para escolher importação por Texto (dentro do modal de escolha)
if (importChoiceTextBtn) {
    importChoiceTextBtn.addEventListener('click', () => {
        if (modalImportChoice) modalImportChoice.style.display = 'none'; // Fecha modal de escolha
        // Abre o modal de importação por texto
        if (modalTextImport) {
            textImportArea.value = ''; // Limpa a área de texto
            modalTextImport.style.display = 'block';
            modalTextImport.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => textImportArea.focus(), 300); // Foca na textarea após abrir
        } else {
             console.error("Modal de importação por texto (#modalTextImport) não encontrado.");
             mostrarFeedbackErro("Erro ao tentar iniciar importação por texto.");
        }
    });
}

// Botão para processar a lista de texto inserida no modal
if (processTextImportBtn) {
    processTextImportBtn.addEventListener('click', processarImportacaoTexto);
}

// Botão Limpar Lista
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras e o orçamento? Esta ação não pode ser desfeita.')) {
        compras = []; // Limpa a array em memória
        orcamentoInput.value = ''; // Limpa o campo de orçamento
        salvarDados(); // Salva a lista vazia e orçamento vazio no localStorage
        atualizarLista(); // Re-renderiza a lista (mostrará mensagem de vazio)
        // verificarOrcamento(0); // Já é chamado dentro de atualizarLista()
        mostrarFeedbackSucesso('Lista de compras e orçamento limpos!');
        categoriaFiltro.value = ""; // Reseta o filtro
    }
});

// Botão Gerar Relatório Excel
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// --- Listeners para Modal de Edição ---

// Botão Salvar Edição
salvarEdicaoBtn.addEventListener('click', () => {
     if (itemEditandoIndex === null || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao(); // Fecha o modal em caso de erro
         return;
     }

     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1; // Padrão 1 se inválido
     const novoValorUnitario = parseNumber(editarValor.value); // Usa a função parseNumber

     // Validações básicas dentro do modal
     if (!novaDescricao) {
         alert("A descrição não pode ficar vazia."); // Usar alert aqui ou feedback dentro do modal
         editarDescricao.focus();
         return;
     }
     if (novaQuantidade <= 0) {
         alert("A quantidade deve ser maior que zero.");
         editarQuantidade.focus();
         return;
     }

     // Re-inferir categoria ao editar pode ser útil se a descrição mudar significativamente
     const novaCategoria = inferirCategoria(novaDescricao);

     // Atualiza o item na lista 'compras' no índice correto
     compras[itemEditandoIndex] = {
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria // Atualiza a categoria inferida
     };

     fecharModalEdicao();
     atualizarLista(); // Renderiza a lista com as alterações
     salvarDados(); // Salva os dados atualizados
     mostrarFeedbackSucesso(`"${novaDescricao}" atualizado com sucesso!`);
});

// Adiciona listeners aos botões de microfone dentro do modal de edição
document.querySelectorAll('#modalEdicao .modal-mic-btn').forEach(button => {
    const targetId = button.dataset.target; // Pega o ID do input alvo do atributo data-target
    if (targetId && recognition) { // Só adiciona se a API de voz existir
        button.addEventListener('click', () => ativarVozParaInput(targetId));
    } else if (!recognition) {
         button.disabled = true; // Desabilita microfone do modal se API não existe
    }
});

// --- Listeners Genéricos para Fechar Modais ---

// Função para fechar qualquer modal pelo botão 'X' (usando data-target no botão)
document.querySelectorAll('.fechar-modal[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetModalId = btn.dataset.target;
        const targetModal = document.getElementById(targetModalId);
        if (targetModal) {
            targetModal.style.display = 'none';
        } else {
            // Tenta fechar pelo ID do modal pai se data-target não for o ID
            const parentModal = btn.closest('.modal');
            if(parentModal) {
                parentModal.style.display = 'none';
            } else {
                 console.warn(`Modal com ID "${targetModalId}" não encontrado para fechar via botão X.`);
            }
        }
    });
});

// Fechar modais clicando fora da área de conteúdo
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) { // Verifica se o clique foi no fundo do modal
        event.target.style.display = 'none';
    }
});

// Fechar modais com a tecla ESC
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega compras e orçamento do localStorage

    // Formata o orçamento carregado ao iniciar a página
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    if (valorOrcamentoCarregado > 0) {
         orcamentoInput.value = valorOrcamentoCarregado.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = ''; // Limpa se for zero, inválido ou vazio
    }

    atualizarLista(); // Renderiza a lista inicial com os dados carregados e calcula totais/progresso

    // Foco no input principal ao carregar a página (melhora UX em Desktop/Tablet)
    // Considerar não focar automaticamente em mobile para evitar teclado abrindo sem querer
    // if (window.innerWidth > 768) { // Exemplo: Foca só se tela > 768px
    //     vozInput.focus();
    // }
});