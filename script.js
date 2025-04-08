// Seleção de elementos do DOM
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
const progressBarContainer = document.querySelector('.progress-bar-container'); // Container da barra
const painelTotal = document.querySelector('#painelTotal'); // Seleciona o painel total para estilização
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');
const modalImportInfo = document.getElementById('modalImportInfo');
const continuarImportBtn = document.getElementById('continuarImport');
const fecharModalInfoBtns = document.querySelectorAll('#modalImportInfo .fechar-modal');

// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões (Exemplo - Popule com itens comuns)
const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Açúcar", "Café", "Sal", "Farinha de Trigo", "Leite", "Ovos",
    "Pão de Forma", "Manteiga", "Queijo", "Presunto", "Frango", "Carne Moída", "Linguiça", "Peixe",
    "Alface", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Maçã", "Banana", "Laranja", "Limão",
    "Sabão em Pó", "Amaciante", "Detergente", "Água Sanitária", "Limpador Multiuso", "Esponja de Aço",
    "Papel Higiênico", "Sabonete", "Shampoo", "Condicionador", "Creme Dental", "Escova de Dentes",
    "Desodorante", "Biscoito", "Refrigerante", "Suco", "Água Mineral", "Iogurte", "Chocolate"
];
// Ordem desejada das categorias
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// --- Funções de Inicialização e Configuração ---
const awesompleteInstance = new Awesomplete(vozInput, {
    list: listaSugestoes,
    minChars: 1,
    maxItems: 7,
    autoFirst: true
});
// Evitar sugestões automáticas no foco inicial
vozInput.addEventListener('focus', () => {
    // setTimeout(() => awesompleteInstance.evaluate(), 1); // Pequeno delay se necessário
});

// --- Funções de Manipulação de Dados ---

// Função para inferir categoria baseado na descrição
function inferirCategoria(descricao) {
    const descLower = descricao.toLowerCase();
    // Palavras-chave para cada categoria (ajuste conforme necessário)
    const alimentosKeys = ['arroz', 'feijão', 'macarrão', 'óleo', 'açúcar', 'cafe', 'sal', 'farinha', 'leite', 'ovos', 'pão', 'manteiga', 'queijo', 'presunto', 'frango', 'carne', 'linguiça', 'peixe', 'alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'maçã', 'banana', 'laranja', 'limão', 'biscoito', 'refrigerante', 'suco', 'água', 'iogurte', 'chocolate', 'cerveja', 'vinho', 'legume', 'verdura', 'fruta', 'cereal', 'peito', 'sobrecoxa', 'patinho', 'acem', 'picanha', 'tilapia', 'sardinha', 'atum', 'mussarela', 'prato', 'mortadela', 'salame'];
    const limpezaKeys = ['sabão', 'amaciante', 'detergente', 'sanitária', 'multiuso', 'limpador', 'esponja', 'desinfetante', 'lustra', 'alcool', 'pano', 'vassoura', 'rodo', 'balde', 'inseticida', 'guardanapo', 'papel toalha'];
    const higieneKeys = ['papel higiênico', 'sabonete', 'shampoo', 'condicionador', 'creme dental', 'pasta de dente', 'escova de dente', 'desodorante', 'fio dental', 'absorvente', 'cotonete', 'barbeador', 'gilete', 'fralda'];

    if (alimentosKeys.some(key => descLower.includes(key))) return 'Alimentos';
    if (limpezaKeys.some(key => descLower.includes(key))) return 'Limpeza';
    if (higieneKeys.some(key => descLower.includes(key))) return 'Higiene Pessoal';
    return 'Outros';
}

// Função para converter texto com vírgula ou ponto para número
function parseNumber(texto) {
    if (!texto || typeof texto !== 'string') return 0;
    // Remove R$, espaços, pontos de milhar e substitui vírgula por ponto
    const numeroLimpo = texto.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
    const valor = parseFloat(numeroLimpo);
    return isNaN(valor) ? 0 : valor;
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
                if (valorUnitario > 0 || compras[itemExistenteIndex].valorUnitario <= 0) {
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
    // A chamada inicial de atualizarLista() e verificarOrcamento() em DOMContentLoaded cuidará de exibir os dados.
}

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback
function mostrarFeedback(mensagem, tipo = 'info') {
    vozFeedback.textContent = mensagem;
    vozFeedback.className = `voz-feedback ${tipo}`; // Remove classes antigas e adiciona a nova
    vozFeedback.style.display = 'block';
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() {
    vozFeedback.style.display = 'none';
    vozFeedback.textContent = '';
    vozFeedback.className = 'voz-feedback'; // Reseta classe
}

// ATUALIZAR LISTA COM GRUPOS DE CATEGORIA E ORDENAÇÃO INTERNA
function atualizarLista() {
    listaComprasUL.innerHTML = ''; // Limpa apenas a UL de itens
    let totalGeral = 0;
    let totalUnidades = 0;
    const tituloLista = listaComprasContainer.querySelector('h2');

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Sua lista de compras está vazia.</li>'; // Mensagem se vazio
        if (tituloLista) tituloLista.style.display = 'none'; // Esconde o título "Itens no Carrinho"
    } else {
        if (tituloLista) tituloLista.style.display = 'inline-block'; // Garante que título aparece (e centralizado pelo CSS)

        // 1. Agrupar itens por categoria
        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros'; // Garante categoria
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            // Adiciona o índice original ao item para referência posterior
            const originalIndex = compras.findIndex(originalItem => originalItem === item);
            acc[categoria].push({ ...item, originalIndex });
            return acc;
        }, {});

        // 2. Ordenar categorias na ordem desejada
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Ambas desconhecidas, ordena alfabeticamente
            if (indexA === -1) return 1; // Categoria A desconhecida vai pro final
            if (indexB === -1) return -1; // Categoria B desconhecida vai pro final
            return indexA - indexB; // Ordena pela ordem definida
        });

        // 3. Renderizar cada categoria e seus itens
        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            // Ordenar itens dentro da categoria (pendentes primeiro, depois alfabético)
            itensDaCategoria.sort((a, b) => {
                const aPendente = a.valorUnitario <= 0;
                const bPendente = b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1; // Pendente A vem antes
                if (!aPendente && bPendente) return 1;  // Pendente B vem antes
                // Se ambos pendentes ou ambos não pendentes, ordena alfabeticamente
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
            });

            // Criar o grupo visual para a categoria (header + itens)
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Associa a categoria ao grupo para o filtro

            // Criar o cabeçalho da categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader); // Adiciona header ao grupo

            // Renderizar itens da categoria
            itensDaCategoria.forEach(item => {
                const li = document.createElement('li');
                li.dataset.index = item.originalIndex; // Usa o índice original salvo

                if (item.valorUnitario <= 0) {
                    li.classList.add('item-pendente');
                }

                let buttonClass = "excluir-item";
                if (item.valorUnitario <= 0) {
                    buttonClass += " sem-valor"; // Adiciona classe se o valor for zero/nulo
                }

                li.innerHTML = `
                    <span class="item-info">
                        <span class="item-qtd">${item.quantidade}x</span>
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-preco">${item.valorUnitario > 0 ? `- R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                        <!-- <span class="item-cat">(${item.categoria})</span> Opcional -->
                    </span>
                    <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                // Event listener para edição (clicar no LI, exceto no botão de excluir)
                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) { // Verifica se o clique NÃO foi no botão ou seu ícone
                         if (item.originalIndex !== undefined && item.originalIndex >= 0 && item.originalIndex < compras.length) {
                             editarItem(item.originalIndex);
                         } else {
                              console.error("Índice original inválido ou não encontrado para edição:", item.originalIndex, item);
                              mostrarFeedbackErro("Erro ao tentar editar o item. Recarregue a página.");
                              // Poderia tentar re-encontrar o índice, mas é mais seguro pedir reload se a referência se perdeu.
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
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza painéis de totais e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    if (totalValor) totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Atualiza o oculto se existir
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    // Atualiza a barra de progresso (chamada movida para o final para garantir totais corretos)
    verificarOrcamento(totalGeral);
}

// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    const listaVaziaMsg = listaComprasUL.querySelector('.lista-vazia');

    if (listaVaziaMsg) return; // Não faz nada se a lista estiver vazia

    let algumGrupoVisivel = false;
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
    // const noResultsMsg = listaComprasUL.querySelector('.filtro-sem-resultados');
    // if (!algumGrupoVisivel && categoriaSelecionada !== "") {
    //     if (!noResultsMsg) {
    //         const msg = document.createElement('li');
    //         msg.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
    //         msg.classList.add('filtro-sem-resultados');
    //         listaComprasUL.appendChild(msg);
    //     }
    // } else if (noResultsMsg) {
    //     noResultsMsg.remove();
    // }
}


// Verificar orçamento e atualizar barra de progresso
function verificarOrcamento(total) {
    // Usa parseNumber para tratar o valor do input de orçamento
    const orcamento = parseNumber(orcamentoInput.value) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        const porcentagemReal = (total / orcamento) * 100;
        porcentagem = Math.min(porcentagemReal, 100); // Barra não passa de 100% visualmente
        barraProgresso.value = porcentagem; // Define o valor da barra (0 a 100)

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

// Abre o modal para editar um item específico
function editarItem(index) {
    if (index === null || index < 0 || index >= compras.length) {
        console.error("Índice inválido para edição:", index);
        mostrarFeedbackErro("Não foi possível encontrar o item para edição.");
        return;
    }
    itemEditandoIndex = index;
    const item = compras[index];

    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    // Formata valor para exibição no input (com vírgula e duas casas decimais)
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : '';

    modalEdicao.style.display = 'block';

    // Scroll suave para o modal e foca no primeiro campo após um pequeno delay
    modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        editarDescricao.focus();
        editarDescricao.select(); // Seleciona o texto para facilitar a edição
    }, 350); // Ajuste o tempo se o scroll for lento ou o foco falhar
}

// Fecha o modal de edição
function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Limpa o índice do item sendo editado
    // Limpar campos do modal (opcional)
    // editarDescricao.value = '';
    // editarQuantidade.value = '';
    // editarValor.value = '';
}

// Formata o campo de valor no modal enquanto digita (opcional, mas útil)
editarValor.addEventListener('input', function(e) {
    let value = e.target.value;
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    // Converte para número e divide por 100
    let numberValue = parseInt(value, 10) / 100;
    if (isNaN(numberValue)) {
        e.target.value = ''; // Limpa se não for um número válido
    } else {
        // Formata de volta para string com vírgula e duas casas decimais
        e.target.value = numberValue.toFixed(2).replace('.', ',');
    }
});

// Salva as alterações feitas no modal
salvarEdicaoBtn.addEventListener('click', () => {
     if (itemEditandoIndex === null || itemEditandoIndex < 0 || itemEditandoIndex >= compras.length) {
         mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
         fecharModalEdicao(); // Fecha o modal em caso de erro
         return;
     }

     const novaDescricao = editarDescricao.value.trim();
     const novaQuantidade = parseInt(editarQuantidade.value, 10) || 1; // Padrão 1 se inválido
     const novoValorUnitario = parseNumber(editarValor.value); // Usa a função parseNumber

     // Validações
     if (!novaDescricao) {
         mostrarFeedbackErro("A descrição não pode ficar vazia.");
         editarDescricao.focus();
         return;
     }
     if (novaQuantidade <= 0) {
         mostrarFeedbackErro("A quantidade deve ser maior que zero.");
         editarQuantidade.focus();
         return;
     }

     // Re-inferir categoria ao editar pode ser útil se a descrição mudar significativamente
     const novaCategoria = inferirCategoria(novaDescricao);

     // Atualiza o item na lista 'compras'
     compras[itemEditandoIndex] = {
         descricao: novaDescricao,
         quantidade: novaQuantidade,
         valorUnitario: novoValorUnitario,
         categoria: novaCategoria // Atualiza a categoria inferida
     };

     fecharModalEdicao();
     atualizarLista(); // Renderiza a lista com as alterações
     salvarDados(); // Salva os dados atualizados
     mostrarFeedbackSucesso(`"${novaDescricao}" editado com sucesso!`);
});

// --- Funções de Reconhecimento de Voz ---
// (Supondo que a API Web Speech esteja disponível no navegador do usuário)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false; // Retorna apenas resultados finais
    recognition.maxAlternatives = 1; // Apenas a melhor alternativa

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const targetInputId = recognition.targetInputId; // Pega o ID do input alvo
        const targetInput = document.getElementById(targetInputId);

        if (targetInput) {
            if (targetInput === vozInput) {
                targetInput.value = transcript; // Preenche o input principal
                // Opcional: Tentar processar automaticamente após ditado?
                // processarEAdicionarItem(transcript);
            } else if (targetInput === editarDescricao || targetInput === editarQuantidade || targetInput === editarValor) {
                // Preenche campo do modal
                targetInput.value = transcript;
                 // Disparar evento input para formatação (se aplicável, como no valor)
                 targetInput.dispatchEvent(new Event('input'));
            }
            mostrarFeedbackSucesso(`Texto ditado: "${transcript}"`);
        }
        ativarVoz.classList.remove('recording'); // Desliga visualmente o botão principal
        // Remove classe 'recording' de botões do modal se houver
        document.querySelectorAll('.modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onerror = (event) => {
        let errorMsg = 'Erro no reconhecimento de voz: ';
        if (event.error == 'no-speech') { errorMsg += 'Nenhuma fala detectada.'; }
        else if (event.error == 'audio-capture') { errorMsg += 'Falha na captura de áudio (verifique permissão do microfone).'; }
        else if (event.error == 'not-allowed') { errorMsg += 'Permissão para usar o microfone negada.'; }
        else { errorMsg += event.error; }
        mostrarFeedbackErro(errorMsg);
        console.error('Speech recognition error:', event.error);
        ativarVoz.classList.remove('recording');
        document.querySelectorAll('.modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

    recognition.onend = () => {
        // Chamado quando o reconhecimento termina (naturalmente ou por stop())
        ativarVoz.classList.remove('recording');
        document.querySelectorAll('.modal-mic-btn.recording').forEach(btn => btn.classList.remove('recording'));
    };

} else {
    console.warn("API de Reconhecimento de Voz não suportada neste navegador.");
    // Desabilitar botões de microfone se a API não existir
    if (ativarVoz) ativarVoz.disabled = true;
    document.querySelectorAll('.mic-btn').forEach(btn => btn.disabled = true);
}

// Função genérica para iniciar o reconhecimento para um input específico
function ativarVozParaInput(inputId) {
    if (!recognition) {
        mostrarFeedbackErro("Reconhecimento de voz não suportado ou inicializado.");
        return;
    }
    try {
        recognition.targetInputId = inputId; // Armazena o ID do input que receberá o resultado
        recognition.start();
        mostrarFeedback("Ouvindo...", 'info');
        // Adiciona feedback visual no botão principal se for ele
        if (inputId === 'vozInput') {
             ativarVoz.classList.add('recording');
        }
        // Adiciona feedback no botão do modal (se for um deles)
        const modalMicBtn = document.querySelector(`.modal-mic-btn[data-target="${inputId}"]`);
        if (modalMicBtn) {
            modalMicBtn.classList.add('recording');
        }
    } catch (e) {
        // Pode ocorrer se já estiver rodando
        console.warn("Erro ao iniciar reconhecimento (pode já estar ativo):", e);
        // Tentar parar e iniciar de novo? Ou apenas ignorar.
        // recognition.stop(); // Para forçar parada se necessário
    }
}

// Função específica para botões de microfone no modal
function editarCampoComVoz(campoId) {
    ativarVozParaInput(campoId);
}

// --- Funções de Importação/Exportação/Limpeza ---

// Importa dados de um arquivo XLSX
function importarDadosXLSX(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Converte para JSON, tratando cabeçalhos vazios e pegando dados crus
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: false });

            if (jsonData.length < 2) { // Precisa ter cabeçalho + pelo menos uma linha de dados
                mostrarFeedbackErro("Planilha vazia ou sem dados.");
                return;
            }

            // Remove linha de cabeçalho (assumindo que a primeira linha é cabeçalho)
            const dadosItens = jsonData.slice(1);
            let itensImportados = 0;
            let errosImportacao = 0;

            dadosItens.forEach((row, index) => {
                if (row && row.length > 0 && row[0] && String(row[0]).trim() !== '') { // Pelo menos a descrição deve existir
                    const descricao = String(row[0]).trim();
                    const quantidade = parseInt(row[1]) || 1; // Coluna B (índice 1), padrão 1
                    const valorUnitario = parseNumber(String(row[2] || '0')); // Coluna C (índice 2), padrão 0
                    const categoria = String(row[3] || '').trim() || inferirCategoria(descricao); // Coluna D (índice 3) ou inferir

                    // Validação básica
                    if (descricao && quantidade > 0) {
                        // Verifica se já existe para evitar duplicados diretos (poderia perguntar se atualiza)
                        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
                        if (itemExistenteIndex === -1) {
                             compras.push({ descricao, quantidade, valorUnitario, categoria });
                             itensImportados++;
                        } else {
                             console.warn(`Item "${descricao}" já existe na lista, pulando importação da linha ${index + 2}.`);
                             // Ou: Atualizar item existente?
                             // compras[itemExistenteIndex].quantidade += quantidade;
                             // compras[itemExistenteIndex].valorUnitario = valorUnitario;
                             // compras[itemExistenteIndex].categoria = categoria;
                             // itensImportados++; // Contar como importado/atualizado
                        }
                    } else {
                        console.warn(`Linha ${index + 2} inválida ou incompleta:`, row);
                        errosImportacao++;
                    }
                }
            });

            if (itensImportados > 0) {
                atualizarLista();
                salvarDados();
                mostrarFeedbackSucesso(`${itensImportados} itens importados com sucesso! ${errosImportacao > 0 ? `(${errosImportacao} linhas ignoradas por erro/incompletude)` : ''}`);
            } else if (errosImportacao > 0) {
                 mostrarFeedbackErro(`Nenhum item novo importado. ${errosImportacao} linhas continham erros ou estavam incompletas.`);
            } else {
                 mostrarFeedbackErro("Nenhum item novo encontrado para importar ou todos já existiam na lista.");
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

// Gera um relatório Excel da lista atual
function gerarRelatorioExcel() {
    if (compras.length === 0) {
        mostrarFeedbackErro("A lista está vazia, não há relatório para gerar.");
        return;
    }

    // Mapeia os dados para o formato da planilha
    const dadosParaExportar = compras.map(item => ({
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário (R$)': item.valorUnitario.toFixed(2).replace('.', ','), // Formata com vírgula
        'Categoria': item.categoria || 'Outros',
        'Valor Total (R$)': (item.quantidade * item.valorUnitario).toFixed(2).replace('.', ',') // Adiciona coluna de total por item
    }));

    // Calcula o total geral para adicionar ao final
    const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);

    // Cria a planilha a partir dos dados mapeados
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar, {
        header: ['Descrição', 'Quantidade', 'Valor Unitário (R$)', 'Categoria', 'Valor Total (R$)'] // Ordem das colunas
    });

    // Adiciona linha de total geral
    XLSX.utils.sheet_add_aoa(worksheet, [
        [], // Linha em branco
        ['', '', '', 'Total Geral:', totalGeral.toFixed(2).replace('.', ',')]
    ], { origin: -1 }); // Adiciona ao final

    // Ajusta largura das colunas (aproximado)
    const columnWidths = [
        { wch: 40 }, // Descrição
        { wch: 12 }, // Quantidade
        { wch: 20 }, // Valor Unitário
        { wch: 20 }, // Categoria
        { wch: 20 }  // Valor Total
    ];
    worksheet['!cols'] = columnWidths;

    // Cria o workbook e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista de Compras");

    // Gera o arquivo e inicia o download
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_Compras_${dataAtual}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);

    mostrarFeedbackSucesso("Relatório Excel gerado com sucesso!");
}

// --- Event Listeners ---

// Input principal e botões associados
vozInput.addEventListener('input', () => { awesompleteInstance.evaluate(); ocultarFeedback(); }); // Avalia sugestões e limpa feedback antigo ao digitar
vozInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { processarEAdicionarItem(vozInput.value); } });
if (ativarVoz) ativarVoz.addEventListener('click', () => { ativarVozParaInput('vozInput'); }); // Ativa voz para input principal

// Inserir Item (com scroll)
inserirItem.addEventListener('click', () => {
    // Scroll suave para a área de input ANTES de processar
    const inputContainer = document.querySelector('.voice-input'); // Ou o elemento pai que contém o input e botões
    if (inputContainer) {
        inputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    // Aguarda um pouco para o scroll acontecer antes de processar (pode não ser necessário)
    // setTimeout(() => {
        processarEAdicionarItem(vozInput.value);
    // }, 50);
});

// Limpar Input
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    ocultarFeedback();
    awesompleteInstance.close(); // Fecha sugestões se estiverem abertas
    vozInput.focus();
});

// Delegação de eventos para botões de excluir na lista
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        const index = parseInt(li.dataset.index); // Pega o índice original do dataset

         if (!isNaN(index) && index >= 0 && index < compras.length) {
             // Confirmação
             if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                 const itemRemovido = compras.splice(index, 1)[0]; // Remove o item da lista 'compras'

                 // Animação de remoção (direto no LI) - Tenta animar antes de re-renderizar
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, margin 0.3s ease-out, padding 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(50px)'; // Desliza para direita
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.border = 'none'; // Remove bordas durante animação

                 // Re-renderiza a lista APÓS a animação
                 setTimeout(() => {
                      atualizarLista(); // Renderiza novamente SEM o item e com índices atualizados
                      salvarDados(); // Salva a lista modificada
                      mostrarFeedbackSucesso(`"${itemRemovido.descricao}" excluído!`);
                 }, 400); // Tempo um pouco maior para animação completa
             }
         } else {
             console.error("Índice inválido ou item não encontrado para exclusão ao clicar no botão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item. Ele pode já ter sido removido.");
             atualizarLista(); // Força atualização em caso de erro de índice
         }
    }
    // A edição é tratada no listener do LI dentro de atualizarLista()
});


// Filtro por categoria
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input
orcamentoInput.addEventListener('input', () => {
    // Salva o valor como está (a formatação é feita ao carregar/exibir)
    salvarDados();
    // Recalcula o total atual e atualiza a barra imediatamente
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    verificarOrcamento(totalAtual);
});
// Formatação ao perder o foco (blur) - Garante formato R$ 0,00
orcamentoInput.addEventListener('blur', () => {
    const valorNumerico = parseNumber(orcamentoInput.value);
    if (valorNumerico > 0) {
        orcamentoInput.value = valorNumerico.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = ''; // Limpa se for zero ou inválido
    }
    salvarDados(); // Salva o valor formatado (ou vazio)
});


// Botões de ação superiores
importarBtn.addEventListener('click', () => {
    if (modalImportInfo) {
        modalImportInfo.style.display = 'block';
        // Scroll suave para o modal de informação
        modalImportInfo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // Fallback se o modal não existir: iniciar importação diretamente
        console.warn("Modal de informação de importação não encontrado. Iniciando importação direta.");
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx"; // Apenas arquivos Excel
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file);
            }
            document.body.removeChild(fileInput); // Limpa o input do DOM
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    }
});

// Botão "Continuar" dentro do modal de importação
if (continuarImportBtn) {
    continuarImportBtn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none'; // Esconde o modal de info
        // Cria e clica no input de arquivo escondido para o usuário selecionar
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".xlsx";
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                importarDadosXLSX(file);
            }
            document.body.removeChild(fileInput); // Limpa o input após uso
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}

// Botões "Fechar" (X) dentro do modal de importação
fecharModalInfoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (modalImportInfo) modalImportInfo.style.display = 'none';
    });
});


limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('A lista já está vazia.');
        return;
    }
    if (confirm('Tem certeza que deseja LIMPAR TODA a lista de compras e o orçamento? Esta ação não pode ser desfeita.')) {
        compras = []; // Limpa a array em memória
        orcamentoInput.value = ''; // Limpa o campo de orçamento
        salvarDados(); // Salva a lista vazia e orçamento vazio no localStorage
        atualizarLista(); // Re-renderiza a lista (mostrará "Nenhum item")
        verificarOrcamento(0); // Zera a barra de progresso
        mostrarFeedbackSucesso('Lista de compras e orçamento limpos!');
    }
});

relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// Modal de Edição (Fechar e Microfone)
fecharModalBtn.addEventListener('click', fecharModalEdicao);
// Fechar modal clicando fora dele
window.addEventListener('click', (event) => {
    if (event.target == modalEdicao) {
        fecharModalEdicao();
    }
    // Fechar modal de info clicando fora (opcional)
    if (modalImportInfo && event.target == modalImportInfo) {
         modalImportInfo.style.display = 'none';
    }
});
// Fechar modal com a tecla ESC
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (modalEdicao.style.display === 'block') {
            fecharModalEdicao();
        }
        if (modalImportInfo && modalImportInfo.style.display === 'block') {
            modalImportInfo.style.display = 'none';
        }
    }
});

// Adiciona listeners aos botões de microfone dentro do modal
document.querySelectorAll('.modal-mic-btn').forEach(button => {
    const targetId = button.dataset.target; // Pega o ID do input alvo do atributo data-target
    if (targetId) {
        button.addEventListener('click', () => editarCampoComVoz(targetId));
    }
});


// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDados(); // Carrega compras e orçamento do localStorage
    // Formata o orçamento carregado, se houver
    const valorOrcamentoCarregado = parseNumber(orcamentoInput.value);
    if (valorOrcamentoCarregado > 0) {
         orcamentoInput.value = valorOrcamentoCarregado.toFixed(2).replace('.', ',');
    } else {
         orcamentoInput.value = ''; // Limpa se for zero ou inválido
    }

    atualizarLista(); // Renderiza a lista inicial com os dados carregados

    // Garante que a barra de progresso seja calculada e exibida corretamente no carregamento inicial
    // A chamada para verificarOrcamento() já está no final de atualizarLista(),
    // então não precisa recalcular o total aqui novamente.

    // Foca no input principal ao carregar a página (melhora UX)
    // vozInput.focus(); // Descomente se desejar foco automático
});