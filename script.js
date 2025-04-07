// --- START OF FILE script.js ---

// Seleção de elementos do DOM
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaCompras = document.querySelector('#listaCompras');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor');
const orcamentoInput = document.querySelector('#orcamento');
const categoriaFiltro = document.querySelector('#categoriaFiltro');
const modalEdicao = document.querySelector('#modalEdicao');
const fecharModalBtn = document.querySelector('#modalEdicao .fechar-modal'); // Mais específico
const editarDescricao = document.querySelector('#editarDescricao');
const editarQuantidade = document.querySelector('#editarQuantidade');
const editarValor = document.querySelector('#editarValor');
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');
const importarBtn = document.querySelector('#importar');
const limparListaBtn = document.querySelector('#limparLista');
const relatorioBtn = document.querySelector('#relatorio');
const barraProgresso = document.getElementById('barraProgresso');
const porcentagemProgresso = document.getElementById('porcentagemProgresso');

// Seletores para Importação por Texto (NOVO)
const abrirImportarTextoBtn = document.querySelector('#abrirImportarTexto');
const modalImportTexto = document.querySelector('#modalImportTexto');
const textoImportarArea = document.querySelector('#textoImportar');
const processarTextoImportBtn = document.querySelector('#processarTextoImport');
const fecharModalTextoBtn = modalImportTexto.querySelector('.fechar-modal');

// Seletores para Importação Excel Info Modal
const modalImportInfo = document.getElementById('modalImportInfo');
const continuarImport = document.getElementById('continuarImport');
const fecharModalInfoBtn = document.querySelector('#modalImportInfo .fechar-modal');

// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões para autocomplete (mantida)
const listaSugestoes = [
    "Água sanitária", "Detergente", "Vassoura", "Saco de lixo", "Sabão em pó", "Amaciante", "Esponja", "Papel toalha",
    "Arroz", "Feijão", "Macarrão", "Banana", "Tomate", "Biscoito", "Leite", "Queijo", "Manteiga", "Pão", "Café",
    "Açúcar", "Óleo de cozinha", "Farinha de trigo", "Ovos", "Carne bovina", "Frango", "Peixe", "Batata", "Cebola",
    "Alho", "Maçã", "Laranja", "Uva", "Morango", "Cenoura", "Beterraba", "Brócolis", "Espinafre", "Iogurte",
    "Refrigerante", "Suco", "Cerveja", "Vinho", "Sabonete", "Shampoo", "Desodorante", "Papel higiênico",
    "Escova de dente", "Creme dental", "Fio dental", "Absorvente", "Preservativo", "Pilhas", "Lâmpadas",
    "Fósforos", "Velas"
];

// Função para inferir categoria automaticamente (mantida)
function inferirCategoria(descricao) {
    const categorias = {
        Alimentos: ['arroz', 'feijão', 'macarrão', 'banana', 'tomate', 'biscoito', 'leite', 'queijo', 'manteiga', 'pão',
            'café', 'açúcar', 'óleo', 'farinha', 'ovos', 'carne', 'frango', 'peixe', 'batata', 'cebola', 'alho',
            'maçã', 'laranja', 'uva', 'morango', 'cenoura', 'beterraba', 'brócolis', 'espinafre', 'iogurte',
            'refrigerante', 'suco', 'cerveja', 'vinho'],
        Limpeza: ['água sanitária', 'detergente', 'vassoura', 'saco de lixo', 'sabão em pó', 'amaciante', 'esponja',
            'papel toalha'],
        'Higiene Pessoal': ['sabonete', 'shampoo', 'desodorante', 'papel higiênico', 'escova de dente', 'creme dental',
            'fio dental', 'absorvente', 'preservativo'],
        Outros: ['pilhas', 'lâmpadas', 'fósforos', 'velas']
    };
    descricao = descricao.toLowerCase();
    for (const [categoria, palavras] of Object.entries(categorias)) {
        if (palavras.some(palavra => descricao.includes(palavra))) {
            return categoria;
        }
    }
    return 'Outros';
}

// Configurar autocomplete com Awesomplete (mantido)
new Awesomplete(vozInput, {
    list: listaSugestoes,
    filter: function(text, input) {
        return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
    },
    replace: function(text) {
        const before = this.input.value.match(/^.+,\s*|/)[0];
        this.input.value = before ? before + text + ", " : text;
    },
    minChars: 1
});

// Tradução mensagem Awesomplete (mantida)
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const message = document.querySelector('.awesomplete > ul:empty::before');
        if (message && message.textContent !== 'Digite 1 ou mais caracteres para resultados.') {
            message.textContent = 'Digite 1 ou mais caracteres para resultados.';
        }
        // Não desconectar para caso o elemento seja recriado dinamicamente
    });
    observer.observe(document.body, { childList: true, subtree: true });
});


// Feedback visual em tempo real (mantido)
vozInput.addEventListener('input', () => {
    vozFeedback.textContent = vozInput.value || '';
    const hasValue = !!vozInput.value;
    vozFeedback.style.display = hasValue ? 'block' : 'none';
    vozFeedback.style.opacity = hasValue ? '1' : '0';
    // Toggle pode não funcionar bem com display none/block, melhor definir diretamente
});

// Função auxiliar para converter números escritos (mantida)
function parseNumber(texto) {
    const numerosEscritos = {
        'um': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
        'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
    };
    texto = texto.toLowerCase().trim();
    return numerosEscritos[texto] || parseInt(texto) || 1;
}

// Função para processar e adicionar item (mantida, com pequenas melhorias)
function processarEAdicionarItem(texto) {
    texto = texto.toLowerCase().trim();

    const regexMarcadores = /^\s*quantidade\s+(.+?)\s+descri[cç][aã]o\s+(.+?)\s+pre[cç]o\s+([\d,\.\s]+?)(?:\s*(reais|real))?\s*$/i;
    const matchMarcadores = texto.match(regexMarcadores);

    const regexNatural = /^(\d+|um|dois|três|quatro|cinco|seis|sete|oito|nove|dez)\s*([\w\sÀ-ú]+(?:de\s[\w\sÀ-ú]+)?)(?:\s*(kg|quilos?|unidades?|caixas?|pacotes?|latas?))?\s*(?:a|por)\s*([\d,\.]+)(?:\s*(reais|real))?(?:\s*cada)?$/i;
    const matchNatural = texto.match(regexNatural);

    let quantidade, descricao, valorUnitario;

    try {
        if (matchMarcadores) {
            quantidade = parseNumber(matchMarcadores[1]);
            descricao = matchMarcadores[2].trim();
            valorUnitario = parseFloat(matchMarcadores[3].replace(/\s/g, '').replace(',', '.')) || 0;
            console.log("Marcadores:", quantidade, descricao, valorUnitario);

        } else if (matchNatural) {
            quantidade = parseNumber(matchNatural[1]);
            // Remover unidades do final da descrição de forma mais segura
            let descTemp = matchNatural[2].trim();
            const unidadeRegex = /\s+(kg|quilos?|unidades?|caixas?|pacotes?|latas?)$/i;
            if (unidadeRegex.test(descTemp)) {
                 descTemp = descTemp.replace(unidadeRegex, '');
            }
            descricao = descTemp.replace(/^de\s/, '').trim();
            valorUnitario = parseFloat(matchNatural[4].replace(/\s/g, '').replace(',', '.')) || 0;
            console.log("Natural:", quantidade, descricao, valorUnitario);

        } else {
            // Tentar um formato mais simples: Descrição[, Quantidade][, Valor]
            const partes = texto.split(',').map(p => p.trim());
            descricao = partes[0];
            quantidade = partes.length > 1 ? (parseInt(partes[1]) || 1) : 1;
            valorUnitario = partes.length > 2 ? (parseFloat(partes[2].replace(',', '.')) || 0) : 0;

            if (!descricao) { // Se nem a descrição foi encontrada
                 mostrarFeedbackErro('Formato não reconhecido. Use "quantidade X descrição Y preço Z", "X Produto por Z" ou "Produto, Quantidade, Valor".');
                 return;
            }
             console.log("Simples:", quantidade, descricao, valorUnitario);
        }

        if (!descricao) {
            mostrarFeedbackErro('A descrição não pode estar vazia.');
            return;
        }
        if (quantidade <= 0) { // Validação adicionada
            mostrarFeedbackErro('A quantidade deve ser maior que zero.');
            return;
        }
        // Permitir valor zero, mas validar negativo? Decisão: Permitir zero.
        if (valorUnitario < 0) {
            mostrarFeedbackErro('Valor unitário não pode ser negativo.');
             return;
        }

        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
        // Re-renderizar a lista APLICANDO o filtro atual
        const categoriaSelecionada = categoriaFiltro.value;
        const filtradosAtuais = categoriaSelecionada ? compras.filter(item => item.categoria === categoriaSelecionada) : compras;
        atualizarLista(filtradosAtuais);
        salvarDados();
        vozInput.value = ''; // Limpa input
        vozFeedback.style.display = 'none'; // Esconde feedback
        mostrarFeedbackSucesso('Item adicionado!');

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro("Ocorreu um erro ao adicionar o item.");
    }
}

// Funções auxiliares para feedback (mantidas)
function mostrarFeedbackSucesso(mensagem) {
    vozFeedback.textContent = mensagem;
    vozFeedback.className = 'voz-feedback success-fade fade-in'; // Usar classes
    vozFeedback.style.display = 'block'; // Garantir visibilidade
    setTimeout(() => {
        vozFeedback.classList.remove('success-fade', 'fade-in');
        if (!vozInput.value) vozFeedback.style.display = 'none'; // Esconder se input estiver vazio
    }, 2000);
}

function mostrarFeedbackErro(mensagem) {
    vozFeedback.textContent = mensagem;
    vozFeedback.className = 'voz-feedback error-fade fade-in'; // Usar classes
    vozFeedback.style.display = 'block'; // Garantir visibilidade
    setTimeout(() => {
        vozFeedback.classList.remove('error-fade', 'fade-in');
         if (!vozInput.value) vozFeedback.style.display = 'none'; // Esconder se input estiver vazio
    }, 3000); // Mais tempo para erros
}

// Botão de microfone (mantido)
ativarVoz.addEventListener('click', () => {
    vozInput.focus();
    // Implementação do reconhecimento de voz (se necessário usar API Web Speech)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            mostrarFeedbackSucesso('Fale agora...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            vozInput.value = transcript;
            vozFeedback.textContent = transcript; // Atualiza feedback com o texto falado
            vozFeedback.style.display = 'block';
            vozFeedback.style.opacity = '1';
            // Tentar adicionar o item automaticamente após a fala? (Opcional)
            // processarEAdicionarItem(transcript);
        };

        recognition.onerror = (event) => {
            mostrarFeedbackErro('Erro no reconhecimento: ' + event.error);
        };

        recognition.onend = () => {
            // Nada específico ao terminar, o feedback já foi dado
        };

        recognition.start();
    } else {
        mostrarFeedbackErro('Reconhecimento de voz não suportado neste navegador.');
    }
});

// Botão para inserir item (mantido)
inserirItem.addEventListener('click', () => {
    if (vozInput.value.trim()) {
        processarEAdicionarItem(vozInput.value);
    } else {
        mostrarFeedbackErro('Digite ou dite algo primeiro!');
    }
});

// Botão para limpar o campo de input (mantido)
limparInput.addEventListener('click', () => {
    vozInput.value = '';
    vozFeedback.style.display = 'none'; // Esconde o feedback
    // mostrarFeedbackSucesso('Campo limpo!'); // Feedback talvez não seja necessário aqui
});

// ** Atualizar lista de compras (REFORMULADA CONFORME SOLICITADO) **
function atualizarLista(filtrados = compras) {
    listaCompras.innerHTML = '';
    let total = 0;

    // 1. Agrupar por Categoria
    const itensPorCategoria = filtrados.reduce((acc, item) => {
        const categoria = item.categoria || 'Outros'; // Garante uma categoria
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(item);
        return acc;
    }, {});

    // Obter as categorias ordenadas alfabeticamente
    const categoriasOrdenadas = Object.keys(itensPorCategoria).sort();

    // 2. Iterar sobre cada categoria
    categoriasOrdenadas.forEach(categoria => {
        // Criar cabeçalho da categoria
        const h3 = document.createElement('h3'); // Usar H3 para semântica
        h3.textContent = categoria;
        h3.classList.add('categoria-header');
        listaCompras.appendChild(h3);

        // 3. Ordenar itens DENTRO da categoria
        const itensCategoria = itensPorCategoria[categoria];
        itensCategoria.sort((a, b) => {
            // Prioridade: Itens sem valor (> 0) vêm DEPOIS dos com valor zerado
            const valorA = a.valorUnitario || 0;
            const valorB = b.valorUnitario || 0;
            if (valorA <= 0 && valorB > 0) return -1; // a (zerado/sem valor) vem antes de b (com valor)
            if (valorA > 0 && valorB <= 0) return 1;  // b (zerado/sem valor) vem antes de a (com valor)

            // Se ambos têm ou não têm valor, ordenar por descrição
            return a.descricao.localeCompare(b.descricao);
        });

        // 4. Renderizar itens da categoria ordenada
        itensCategoria.forEach(item => {
            // Encontrar o índice ORIGINAL do item na lista 'compras'
            const indexOriginal = compras.findIndex(originalItem =>
                originalItem.descricao === item.descricao &&
                originalItem.quantidade === item.quantidade &&
                originalItem.valorUnitario === item.valorUnitario &&
                originalItem.categoria === item.categoria
                // Adicionar mais verificações se necessário para garantir unicidade,
                // ou idealmente, cada item deveria ter um ID único.
                // Por simplicidade, assumimos que a combinação acima é suficiente por agora.
            );


            const li = document.createElement('li');
            li.classList.add('item-lista'); // Adiciona classe para estilo geral do item

            // 5. Lógica da cor da lixeira (Verde se > 0, padrão se <= 0)
            let buttonClass = "excluir-item";
            if (item.valorUnitario > 0) {
               buttonClass += " com-valor"; // Adiciona classe se TEM valor > 0
            }

            li.innerHTML = `
                <span class="item-info">${item.quantidade}x ${item.descricao} - R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}</span>
                <button class="${buttonClass}" data-index="${indexOriginal}" aria-label="Excluir ${item.descricao}">🗑️</button>
            `;

            li.classList.add('fade-in');

            // Adiciona evento de clique para edição (somente no span de informações)
            li.querySelector('.item-info').addEventListener('click', () => {
                if (indexOriginal !== -1) { // Garante que o índice foi encontrado
                    editarItem(indexOriginal);
                } else {
                    console.error("Não foi possível encontrar o índice original para editar:", item);
                    mostrarFeedbackErro("Erro ao tentar editar o item.");
                }
            });

            listaCompras.appendChild(li);
            total += item.quantidade * item.valorUnitario;
            setTimeout(() => li.style.opacity = 1, 10); // Animação fade-in
        });
    });

    // Atualizar totais e orçamento
    totalValorPainel.textContent = total.toFixed(2).replace('.', ',');
    totalValor.textContent = total.toFixed(2).replace('.', ',');
    verificarOrcamento(total);
}


// Event listener para o botão de excluir (DELEGAÇÃO - CORRIGIDO)
listaCompras.addEventListener('click', (event) => {
    // Verifica se o clique foi no botão de excluir E se o botão tem a classe 'excluir-item'
    if (event.target.tagName === 'BUTTON' && event.target.classList.contains('excluir-item')) {
        const index = parseInt(event.target.dataset.index);

        // Verifica se o índice é válido antes de prosseguir
        if (index >= 0 && index < compras.length) {
            // Confirmação usa o item correto da lista 'compras'
            if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                compras.splice(index, 1); // Remove da lista original 'compras'

                // Ao remover, é preciso ATUALIZAR a lista baseada na categoria FILTRADA atual
                const categoriaSelecionada = categoriaFiltro.value;
                const filtradosAtuais = categoriaSelecionada ? compras.filter(item => item.categoria === categoriaSelecionada) : compras;
                atualizarLista(filtradosAtuais); // Re-renderiza com a lista atualizada e filtro aplicado

                salvarDados();
                mostrarFeedbackSucesso('Item excluído!');
            }
        } else {
            console.error("Índice inválido ou item não encontrado para exclusão:", index);
            mostrarFeedbackErro("Erro ao tentar excluir item. Recarregue a página se o problema persistir.");
        }
    }
});


// Verificar orçamento e atualizar barra de progresso (mantido, com checagem de estilo)
function verificarOrcamento(total) {
    const orcamento = parseFloat(orcamentoInput.value.replace(',', '.')) || 0;
    let porcentagem = 0;

    if (orcamento > 0) {
        porcentagem = (total / orcamento) * 100;
        // Não limita mais a 100% visualmente na barra, permite ultrapassar
        barraProgresso.value = Math.min(porcentagem, 100); // Mantém o value limitado a 100 para compatibilidade
        porcentagemProgresso.textContent = `${porcentagem.toFixed(1)}%`;

        // Usa classes CSS para controlar a cor da barra para melhor manutenção
        barraProgresso.classList.remove('orcamento-ok', 'orcamento-apertado', 'orcamento-estourado');
        if (porcentagem >= 100) {
            barraProgresso.classList.add('orcamento-estourado'); // Vermelho
        } else if (porcentagem > 80) {
            barraProgresso.classList.add('orcamento-apertado'); // Laranja
        } else {
            barraProgresso.classList.add('orcamento-ok'); // Verde
        }

    } else {
        barraProgresso.value = 0;
        porcentagemProgresso.textContent = "0%";
        barraProgresso.classList.remove('orcamento-apertado', 'orcamento-estourado');
        barraProgresso.classList.add('orcamento-ok'); // Verde padrão
    }

    // Feedback visual no painel total
    const painelTotalElement = document.querySelector('#painelTotal');
    if (total > orcamento && orcamento > 0) {
        painelTotalElement.classList.add('estourado');
        setTimeout(() => painelTotalElement.classList.remove('estourado'), 2000);
    } else {
        painelTotalElement.classList.remove('estourado');
    }
}


// Salvar dados no localStorage (mantido)
function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    localStorage.setItem('orcamento', orcamentoInput.value);
}

// Filtrar por categoria (AJUSTADO para usar a nova atualizarLista)
categoriaFiltro.addEventListener('change', () => {
    const categoria = categoriaFiltro.value;
    const filtrados = categoria ? compras.filter(item => item.categoria === categoria) : compras;
    atualizarLista(filtrados); // Chama a função atualizada com os itens filtrados
});

// Editar item (mantido, mas verificar se microfone no modal funciona)
function editarItem(index) {
    itemEditandoIndex = index;
    const item = compras[index];
    if (!item) {
        console.error("Item não encontrado para edição no índice:", index);
        mostrarFeedbackErro("Erro ao carregar item para edição.");
        return;
    }
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario.toFixed(2).replace('.', ',');
    modalEdicao.style.display = 'block';
    modalEdicao.classList.add('slide-in');

    // Adiciona listeners de clique aos botões de microfone no modal de edição
    // (Certifique-se que os IDs dos botões mic no HTML estão corretos)
    const micBtnDescricao = modalEdicao.querySelector('#micEditarDescricao'); // Exemplo de ID
    const micBtnQuantidade = modalEdicao.querySelector('#micEditarQuantidade'); // Exemplo de ID
    const micBtnValor = modalEdicao.querySelector('#micEditarValor'); // Exemplo de ID

    // Remover listeners antigos para evitar duplicação se o modal for reaberto
    if (micBtnDescricao) micBtnDescricao.onclick = null;
    if (micBtnQuantidade) micBtnQuantidade.onclick = null;
    if (micBtnValor) micBtnValor.onclick = null;

    // Adicionar novos listeners
    if (micBtnDescricao) micBtnDescricao.onclick = () => editarCampoComVoz('editarDescricao');
    if (micBtnQuantidade) micBtnQuantidade.onclick = () => editarCampoComVoz('editarQuantidade');
    if (micBtnValor) micBtnValor.onclick = () => editarCampoComVoz('editarValor');
}


// Função para editar campo com voz dentro do modal (mantida)
function editarCampoComVoz(campoId) {
    const inputElement = document.getElementById(campoId);
    if (!inputElement) return;
    inputElement.focus();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            mostrarFeedbackSucesso(`Fale para editar ${campoId.replace('editar', '').toLowerCase()}...`);
        };

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            // Tratamento especial para quantidade e valor
            if (campoId === 'editarQuantidade') {
                inputElement.value = parseNumber(result); // Tenta converter 'dois' para 2
            } else if (campoId === 'editarValor') {
                // Tenta extrair número, aceitando "reais" etc.
                const valorNumerico = result.match(/[\d,\.]+/);
                if (valorNumerico) {
                    inputElement.value = valorNumerico[0].replace('.', ','); // Formata com vírgula
                    formatarValorEdicao(); // Aplica formatação R$
                } else {
                    inputElement.value = result; // Mantém o texto se não achar número
                }
            } else {
                inputElement.value = result;
            }
             // Feedback removido daqui para não ser muito verboso
            // mostrarFeedbackSucesso(`${campoId.replace('editar', '').toLowerCase()} alterado para: ${inputElement.value}`);
        };

        recognition.onerror = (event) => {
            mostrarFeedbackErro('Erro no reconhecimento de voz: ' + event.error);
        };

        recognition.onend = () => {
            // Nada específico ao terminar
        };

        recognition.start();
    } else {
         mostrarFeedbackErro('Reconhecimento de voz não suportado.');
    }
}


// Salvar edição (mantido, com validações)
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex !== null && itemEditandoIndex >= 0 && itemEditandoIndex < compras.length) {
        const novaDescricao = editarDescricao.value.trim();
        const novaQuantidade = parseInt(editarQuantidade.value) || 1; // Padrão 1
        const novoValorUnitario = parseFloat(editarValor.value.replace(',', '.')) || 0; // Padrão 0

        if (!novaDescricao) {
            alert('A descrição não pode estar vazia.');
            return;
        }
        if (novaQuantidade <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }
        if (novoValorUnitario < 0) {
            alert('O valor unitário não pode ser negativo.');
            return;
        }

        const novaCategoria = inferirCategoria(novaDescricao);
        compras[itemEditandoIndex] = {
            descricao: novaDescricao,
            quantidade: novaQuantidade,
            valorUnitario: novoValorUnitario,
            categoria: novaCategoria
        };

        modalEdicao.style.display = 'none';
        modalEdicao.classList.remove('slide-in');

        // Re-renderizar APLICANDO o filtro atual
        const categoriaSelecionada = categoriaFiltro.value;
        const filtradosAtuais = categoriaSelecionada ? compras.filter(item => item.categoria === categoriaSelecionada) : compras;
        atualizarLista(filtradosAtuais);

        salvarDados();
        mostrarFeedbackSucesso('Item editado!');
        itemEditandoIndex = null; // Reseta o índice
    } else {
        mostrarFeedbackErro("Erro ao salvar edição. Índice inválido.");
        modalEdicao.style.display = 'none'; // Fecha o modal mesmo com erro
        modalEdicao.classList.remove('slide-in');
        itemEditandoIndex = null; // Reseta o índice
    }
});

// Fechar modais (Edição, Info Excel, Texto)
fecharModalBtn.addEventListener('click', () => {
    modalEdicao.style.display = 'none';
    modalEdicao.classList.remove('slide-in');
});

fecharModalInfoBtn.addEventListener('click', () => {
    modalImportInfo.style.display = 'none';
});

fecharModalTextoBtn.addEventListener('click', () => {
    modalImportTexto.style.display = 'none';
    modalImportTexto.classList.remove('slide-in');
});

// Fechar modal clicando fora
window.addEventListener('click', (event) => {
    if (event.target === modalEdicao) {
        modalEdicao.style.display = 'none';
        modalEdicao.classList.remove('slide-in');
    }
    if (event.target === modalImportInfo) {
        modalImportInfo.style.display = 'none';
    }
    if (event.target === modalImportTexto) {
        modalImportTexto.style.display = 'none';
        modalImportTexto.classList.remove('slide-in');
    }
});

// Formatar valor em tempo real no input de edição de valor (mantido)
function formatarValorEdicao() {
    let valor = editarValor.value;
    valor = valor.replace(/\D/g, ''); // Remove tudo que não for dígito
    valor = valor.replace(/^0+/, ''); // Remove zeros à esquerda
    if (valor.length === 0) valor = '0';
    if (valor.length === 1) valor = '00' + valor; // Adiciona zeros para centavos
    if (valor.length === 2) valor = '0' + valor;  // Adiciona zero para centavos
    valor = valor.replace(/(\d{1,})(\d{2})$/, "$1,$2"); // Adiciona vírgula antes dos últimos 2 dígitos
    editarValor.value = valor;
}
editarValor.addEventListener('input', formatarValorEdicao);


// Importar dados de XLSX (mantido, com aviso)
importarBtn.addEventListener('click', () => {
    modalImportInfo.style.display = 'block'; // Mostra aviso
});

continuarImport.addEventListener('click', () => {
    modalImportInfo.style.display = 'none'; // Esconde aviso

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Lê como array de arrays

                // Validar cabeçalhos esperados (ajuste as colunas conforme o modelo)
                const expectedHeaders = ["Descrição", "Quantidade", "Valor Unitário (R$)", "Categoria"];
                const actualHeaders = excelData[0].map(h => String(h).trim()); // Linha 0 são os cabeçalhos

                if (JSON.stringify(expectedHeaders) !== JSON.stringify(actualHeaders)) {
                    mostrarFeedbackErro(`Cabeçalhos inválidos. Esperado: ${expectedHeaders.join(', ')}. Encontrado: ${actualHeaders.join(', ')}.`);
                    return;
                }

                // Processar linhas de dados (começando da linha 1)
                const novosItensImportados = [];
                for (let i = 1; i < excelData.length; i++) {
                    const row = excelData[i];
                    if (!row || row.length === 0 || !row[0]) continue; // Pula linhas vazias ou sem descrição

                    const descricao = String(row[0]).trim() || 'Sem descrição';
                    const quantidade = Number(row[1]) || 1;
                    const valorTexto = String(row[2] || '0').replace(',', '.');
                    const valorUnitario = Number(valorTexto) || 0;
                    const categoria = String(row[3]).trim() || inferirCategoria(descricao);

                     if (quantidade <= 0) continue; // Ignora quantidade inválida
                     if (valorUnitario < 0) continue; // Ignora valor negativo

                    novosItensImportados.push({
                        descricao,
                        quantidade,
                        valorUnitario,
                        categoria
                    });
                }

                if (novosItensImportados.length > 0) {
                    compras = [...compras, ...novosItensImportados]; // Adiciona sem sobrescrever
                    atualizarLista(); // Atualiza com a lista completa
                    salvarDados();
                    mostrarFeedbackSucesso(`${novosItensImportados.length} item(ns) importado(s) do Excel!`);
                } else {
                    mostrarFeedbackErro("Nenhum item válido encontrado no arquivo Excel.");
                }

            } catch (error) {
                console.error("Erro ao importar XLSX:", error);
                mostrarFeedbackErro('Erro ao ler ou processar o arquivo XLSX.');
            }
        };
        reader.readAsBinaryString(file);
    };
    input.click();
});

// Limpar lista (mantido)
limparListaBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar TODA a lista de compras?')) {
        compras = [];
        atualizarLista(); // Limpa a interface
        salvarDados(); // Salva a lista vazia
        mostrarFeedbackSucesso('Lista limpa!');
    }
});

// Gerar relatório Excel (mantido)
relatorioBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackErro('Não há itens na lista para gerar o relatório.');
        return;
    }
    try {
        const wb = XLSX.utils.book_new();
        const wsName = "RelatorioCompras";

        // Ordenar por categoria e depois descrição para o relatório
        const comprasOrdenadasRelatorio = [...compras].sort((a, b) => {
             const catCompare = (a.categoria || 'Outros').localeCompare(b.categoria || 'Outros');
             if (catCompare !== 0) return catCompare;
             return a.descricao.localeCompare(b.descricao);
        });

        const wsData = [
            ["Categoria", "Descrição", "Quantidade", "Valor Unitário (R$)", "Valor Total Item (R$)"], // Cabeçalhos
            ...comprasOrdenadasRelatorio.map(item => [
                item.categoria || 'Outros',
                item.descricao,
                item.quantidade,
                item.valorUnitario, //.toFixed(2).replace('.',','), // Manter como número para Excel
                item.quantidade * item.valorUnitario //.toFixed(2).replace('.',',') // Manter como número
             ])
        ];

        // Adicionar linha de Total Geral
         const totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
         wsData.push([]); // Linha em branco
         wsData.push(["", "", "", "Total Geral:", totalGeral]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

         // Formatação de colunas (Opcional, mas melhora a visualização no Excel)
         ws['!cols'] = [
             { wch: 15 }, // Categoria
             { wch: 30 }, // Descrição
             { wch: 10 }, // Quantidade
             { wch: 20 }, // Valor Unitário
             { wch: 20 }  // Valor Total Item
         ];
         // Aplicar formato de moeda (Exemplo: Colunas D e E - Valor Unitário e Total)
         const range = XLSX.utils.decode_range(ws['!ref']);
         for (let R = 1; R <= range.e.r; ++R) { // Começa da linha 1 (depois do cabeçalho)
             for (let C = 3; C <= 4; ++C) { // Colunas D (3) e E (4)
                 const cell_address = { c: C, r: R };
                 const cell_ref = XLSX.utils.encode_cell(cell_address);
                 if (ws[cell_ref] && typeof ws[cell_ref].v === 'number') { // Só formata se for número
                     ws[cell_ref].z = 'R$ #,##0.00'; // Formato de moeda BRL
                 }
             }
         }
         // Formatar Total Geral
         const totalCellRef = XLSX.utils.encode_cell({c: 4, r: range.e.r}); // Última linha, coluna E
         if (ws[totalCellRef]) ws[totalCellRef].z = 'R$ #,##0.00';


        XLSX.utils.book_append_sheet(wb, ws, wsName);
        const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const nomeArquivo = `${dataAtual}_RelatorioCompras.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
        mostrarFeedbackSucesso('Relatório gerado!');
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        mostrarFeedbackErro("Ocorreu um erro ao gerar o relatório Excel.");
    }
});


// ** NOVO: Abrir Modal de Importação por Texto **
abrirImportarTextoBtn.addEventListener('click', () => {
    textoImportarArea.value = ''; // Limpa a área ao abrir
    modalImportTexto.style.display = 'block';
    modalImportTexto.classList.add('slide-in');
});

// ** NOVO: Processar Texto Importado **
function processarTextoImportado() {
    const texto = textoImportarArea.value.trim();
    if (!texto) {
        mostrarFeedbackErro('Nenhum texto para importar.');
        return;
    }

    const linhas = texto.split('\n');
    let itensAdicionados = 0;
    const novosItens = [];
    const erros = [];

    linhas.forEach((linha, index) => {
        linha = linha.trim();
        if (!linha) return; // Pula linhas vazias

        const partes = linha.split(',').map(p => p.trim());

        const descricao = partes[0];
        if (!descricao) {
             erros.push(`Linha ${index + 1}: Descrição ausente.`);
             return;
        }

        let quantidade = 1;
        if (partes.length > 1) {
            quantidade = parseInt(partes[1]);
            if (isNaN(quantidade) || quantidade <= 0) {
                // Se não for número válido ou <= 0, assume 1 mas avisa
                 erros.push(`Linha ${index + 1} ('${descricao}'): Quantidade inválida ('${partes[1]}'), assumindo 1.`);
                quantidade = 1;
            }
        }

        let valorUnitario = 0;
        if (partes.length > 2) {
            const valorTexto = partes[2].replace(',', '.');
            valorUnitario = parseFloat(valorTexto);
            if (isNaN(valorUnitario) || valorUnitario < 0) {
                 erros.push(`Linha ${index + 1} ('${descricao}'): Valor inválido ('${partes[2]}'), assumindo 0.`);
                valorUnitario = 0;
            }
        }

        const categoria = inferirCategoria(descricao);
        novosItens.push({ descricao, quantidade, valorUnitario, categoria });
        itensAdicionados++;
    });

    if (itensAdicionados > 0) {
        compras.push(...novosItens); // Adiciona os novos itens
         // Re-renderizar APLICANDO o filtro atual
         const categoriaSelecionada = categoriaFiltro.value;
         const filtradosAtuais = categoriaSelecionada ? compras.filter(item => item.categoria === categoriaSelecionada) : compras;
         atualizarLista(filtradosAtuais);
        salvarDados();
        modalImportTexto.style.display = 'none';
        modalImportTexto.classList.remove('slide-in');
        let msgSucesso = `${itensAdicionados} item(ns) importado(s) do texto!`;
        if (erros.length > 0) {
            msgSucesso += ` ${erros.length} linha(s) com avisos. Verifique o console para detalhes.`;
            console.warn("Avisos na importação por texto:", erros);
        }
        mostrarFeedbackSucesso(msgSucesso);
    } else {
        let msgErro = 'Nenhum item válido encontrado no texto.';
         if (erros.length > 0) {
             msgErro += ` ${erros.length} linha(s) com erros. Verifique o console para detalhes.`;
             console.error("Erros na importação por texto:", erros);
         }
        mostrarFeedbackErro(msgErro);
    }
}
processarTextoImportBtn.addEventListener('click', processarTextoImportado);


// Carregar dados ao iniciar (mantido, com conversão legada)
function carregarDados() {
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (orcamentoSalvo) {
         // Tenta formatar como moeda ao carregar, mas mantém o formato do usuário se já tiver vírgula
         if (orcamentoSalvo.includes(',')) {
             orcamentoInput.value = orcamentoSalvo;
         } else {
             const num = parseFloat(orcamentoSalvo);
             if (!isNaN(num)) {
                 orcamentoInput.value = num.toFixed(2).replace('.', ',');
             } else {
                 orcamentoInput.value = orcamentoSalvo; // Mantém se não for número
             }
         }
    }

    const comprasSalvas = JSON.parse(localStorage.getItem('compras')) || [];
    // Garante que todos os itens tenham as propriedades esperadas
    compras = comprasSalvas.map(item => ({
        descricao: item.descricao || 'Sem descrição',
        quantidade: Number(item.quantidade) || 1,
        valorUnitario: Number(item.valorUnitario) || (item.valor ? Number(item.valor / (item.quantidade || 1)) : 0), // Conversão legada
        categoria: item.categoria || inferirCategoria(item.descricao || '')
    }));
    // Remover a propriedade 'valor' legada se existir
    compras.forEach(item => delete item.valor);

    salvarDados(); // Salva novamente para garantir formato consistente
}

// Event listener para carregar e atualizar na inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarLista(); // Chama a função atualizada
    // A barra de progresso é atualizada dentro de atualizarLista via verificarOrcamento
});

// Atualiza a barra de progresso sempre que o orçamento for alterado (mantido)
orcamentoInput.addEventListener('input', () => {
    // Formatar como moeda enquanto digita
     let valor = orcamentoInput.value;
     valor = valor.replace(/\D/g, '');
     valor = valor.replace(/^0+/, '');
     if (valor.length === 0) valor = '0';
     if (valor.length === 1) valor = '00' + valor;
     if (valor.length === 2) valor = '0' + valor;
     valor = valor.replace(/(\d{1,})(\d{2})$/, "$1,$2");
     orcamentoInput.value = valor;

    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    verificarOrcamento(totalAtual);
    salvarDados(); // Salva o orçamento formatado
});

// --- END OF FILE script.js ---