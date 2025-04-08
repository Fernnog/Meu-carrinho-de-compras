// Seleção de elementos do DOM (Adicionar referência ao voice-input container)
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaComprasUL = document.querySelector('#listaCompras');
const listaComprasContainer = document.querySelector('#listaComprasContainer');
const totalValorPainel = document.querySelector('#totalValorPainel');
const totalValor = document.querySelector('#totalValor');
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
const contagemNomesSpan = document.querySelector('#contagemNomes');
const contagemUnidadesSpan = document.querySelector('#contagemUnidades');
const voiceInputContainer = document.querySelector('.voice-input'); // Adicionado para scroll

// Lista de compras e índice do item sendo editado (Inalterado)
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões (Inalterado)
const listaSugestoes = [
    "Arroz", "Feijão", "Macarrão", "Óleo", "Sal", "Açúcar", "Café", "Leite", "Pão", "Manteiga", "Queijo", "Presunto",
    "Frango", "Carne Bovina", "Peixe", "Ovos", "Tomate", "Cebola", "Alho", "Batata", "Cenoura", "Alface", "Maçã", "Banana", "Laranja",
    "Sabão em pó", "Detergente", "Amaciante", "Água sanitária", "Limpador Multiuso", "Desinfetante", "Esponja", "Saco de lixo",
    "Shampoo", "Condicionador", "Sabonete", "Pasta de dente", "Escova de dente", "Papel higiênico",
    "Biscoito", "Bolacha", "Refrigerante", "Suco", "Cerveja", "Vinho", "Iogurte", "Chocolate"
];
// Ordem desejada das categorias (Inalterado)
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];

// --- Funções de Inicialização e Configuração ---
const awesompleteInstance = new Awesomplete(vozInput, { list: listaSugestoes, minChars: 1 });
vozInput.addEventListener('focus', () => { /* Mantido */ });

// --- Funções de Manipulação de Dados ---
function inferirCategoria(descricao) {
    const descLower = descricao.toLowerCase().trim();
    // Palavras-chave para categorias
    const alimentosKeys = ['arroz', 'feijão', 'macarrão', 'óleo', 'sal', 'açúcar', 'café', 'leite', 'pão', 'manteiga', 'queijo', 'presunto', 'frango', 'carne', 'peixe', 'ovos', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'alface', 'maçã', 'banana', 'laranja', 'iogurte', 'biscoito', 'bolacha', 'chocolate', 'refrigerante', 'suco', 'cerveja', 'vinho', 'legume', 'verdura', 'fruta', 'cereal', 'farinha', 'massa'];
    const limpezaKeys = ['sabão', 'detergente', 'amaciante', 'água sanitária', 'multiuso', 'desinfetante', 'esponja', 'saco de lixo', 'limpador', 'limpa vidro', 'lustra móveis'];
    const higieneKeys = ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'escova de dente', 'papel higiênico', 'fio dental', 'absorvente', 'desodorante', 'barbeador', 'cotonete'];

    if (alimentosKeys.some(key => descLower.includes(key))) return 'Alimentos';
    if (limpezaKeys.some(key => descLower.includes(key))) return 'Limpeza';
    if (higieneKeys.some(key => descLower.includes(key))) return 'Higiene Pessoal';
    return 'Outros';
}

function parseNumber(texto) {
    if (!texto || typeof texto !== 'string') return 0;
    // Remove "R$", pontos de milhar, substitui vírgula por ponto
    const numeroLimpo = texto.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim();
    const numero = parseFloat(numeroLimpo);
    return isNaN(numero) ? 0 : numero;
}

function processarEAdicionarItem(texto) {
    texto = texto.trim();
    if (!texto) return; // Sai se o input estiver vazio

    ocultarFeedback(); // Limpa feedback anterior

    // Tentar identificar padrões: "qtd desc preco X.XX", "desc qtd X.XX", "desc X.XX qtd", etc.
    let quantidade = 1;
    let descricao = '';
    let valorUnitario = 0;

    // Regex mais flexível (ainda pode precisar de ajustes)
    // 1. Quantidade (número) + Descrição (texto) + Preço (número com vírgula/ponto)
    let match = texto.match(/^quantidade\s+(\d+)\s+descri(?:ç|c)ão\s+(.+?)(?:\s+pre(?:ç|c)o\s+([\d.,]+))?$/i);
    if (match) {
        quantidade = parseInt(match[1], 10);
        descricao = match[2].trim();
        valorUnitario = parseNumber(match[3]);
    } else {
        // 2. Tentativa mais simples: Primeiro número é qtd, último é preço?
        const partes = texto.split(/\s+/);
        const numeros = partes.map(p => parseNumber(p.replace(',', '.'))).filter(n => !isNaN(n) && n > 0); // Pega só números válidos
        const palavras = partes.filter(p => isNaN(parseNumber(p.replace(',', '.')))); // Pega o que não é número (descrição)

        if (palavras.length > 0) {
            descricao = palavras.join(' ').trim();
            if (numeros.length === 1) { // Só um número: pode ser qtd ou preço
                 // Heurística: Se o número for inteiro e pequeno (<=10?), provavelmente é qtd. Se tiver decimal ou for maior, é preço.
                 if (Number.isInteger(numeros[0]) && numeros[0] <= 15) { // Ajuste o limite se necessário
                    quantidade = numeros[0];
                 } else {
                    valorUnitario = numeros[0];
                 }
            } else if (numeros.length >= 2) { // Pelo menos dois números
                // Suposição: o primeiro é quantidade, o último é preço
                quantidade = Math.round(numeros[0]); // Arredonda quantidade se alguém digitar 1.5x
                valorUnitario = numeros[numeros.length - 1];
            }
             // Se não houver números, quantidade = 1, valor = 0
        } else if (numeros.length > 0) {
            // Só números? Estranho. Assume como descrição.
             descricao = texto;
        } else {
            // Só texto? Assume como descrição.
            descricao = texto;
        }
    }

    // Ajustes finais
    descricao = descricao.replace(/^descri(?:ç|c)ão\s+/i, '').replace(/\s+pre(?:ç|c)o$/i, '').trim(); // Limpa palavras-chave restantes
    quantidade = isNaN(quantidade) || quantidade <= 0 ? 1 : quantidade; // Garante quantidade mínima 1
    valorUnitario = isNaN(valorUnitario) || valorUnitario < 0 ? 0 : valorUnitario; // Garante valor não negativo

    if (!descricao) {
        mostrarFeedbackErro('Não foi possível identificar a descrição do item.');
        return;
    }

    // Verificar item existente (lógica mantida)
    const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
    if (itemExistenteIndex > -1) {
        // Usar confirm para decisão do usuário (mantido)
        if (confirm(`"${descricao}" já está na lista. Deseja ATUALIZAR a quantidade para ${compras[itemExistenteIndex].quantidade + quantidade} e o valor unitário para R$ ${valorUnitario.toFixed(2).replace('.', ',')} (se > 0)?\n\n(Cancelar adicionará como novo item, se possível)`)) {
             compras[itemExistenteIndex].quantidade += quantidade;
             if (valorUnitario > 0) { // Só atualiza valor se um novo > 0 for fornecido
                  compras[itemExistenteIndex].valorUnitario = valorUnitario;
             }
             // Re-inferir categoria pode ser útil, mas mantemos a original por padrão
             // compras[itemExistenteIndex].categoria = inferirCategoria(descricao);
              mostrarFeedbackSucesso(`Item "${descricao}" atualizado!`);
        } else {
            // Decidiu não atualizar, talvez adicionar como novo? Por ora, apenas cancelamos.
            mostrarFeedbackInfo("Atualização cancelada.");
            vozInput.focus(); // Mantém o foco para possível correção
            return; // Não faz nada
        }
    } else {
        // Adicionar novo item (lógica mantida)
        const categoria = inferirCategoria(descricao);
        const novoItem = { descricao, quantidade, valorUnitario, categoria };
        compras.push(novoItem);
         mostrarFeedbackSucesso(`Item "${descricao}" adicionado!`);
    }

    atualizarLista(); // Renderiza a lista
    salvarDados(); // Salva no localStorage
    vozInput.value = ''; // Limpa o input principal
    // ocultarFeedback(); // Oculta após um tempo (já definido em mostrarFeedback)
}

function salvarDados() {
    localStorage.setItem('compras', JSON.stringify(compras));
    // Salva orçamento separadamente
    const orcamentoValor = parseNumber(orcamentoInput.value);
    if (orcamentoValor > 0) {
        localStorage.setItem('orcamento', orcamentoValor.toFixed(2));
    } else {
        localStorage.removeItem('orcamento'); // Remove se for zero ou inválido
    }
}

function carregarDados() {
    compras = JSON.parse(localStorage.getItem('compras')) || [];
    const orcamentoSalvo = localStorage.getItem('orcamento');
    if (orcamentoSalvo) {
        orcamentoInput.value = parseFloat(orcamentoSalvo).toFixed(2).replace('.', ',');
    }
    // atualizarLista será chamado no DOMContentLoaded
}

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback (Adicionado timeout para ocultar)
let feedbackTimeout;
function mostrarFeedback(mensagem, tipo = 'info') {
    clearTimeout(feedbackTimeout); // Limpa timeout anterior, se houver
    vozFeedback.textContent = mensagem;
    vozFeedback.className = `voz-feedback ${tipo}`; // Aplica a classe de estilo
    vozFeedback.style.opacity = '1';
    vozFeedback.style.display = 'block'; // Garante visibilidade

    // Ocultar após alguns segundos
    feedbackTimeout = setTimeout(() => {
        ocultarFeedback();
    }, 4000); // Oculta após 4 segundos
}
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function mostrarFeedbackInfo(mensagem) { mostrarFeedback(mensagem, 'info'); }
function ocultarFeedback() {
     clearTimeout(feedbackTimeout);
     vozFeedback.style.opacity = '0';
     // Espera a transição terminar para esconder completamente
     setTimeout(() => {
          if (vozFeedback.style.opacity === '0') { // Verifica se não foi reaberto
             vozFeedback.textContent = '';
             vozFeedback.className = 'voz-feedback';
             vozFeedback.style.display = 'none';
          }
     }, 300); // Tempo da transição de opacidade
}

// ATUALIZAR LISTA COM GRUPOS DE CATEGORIA E ORDENAÇÃO INTERNA (Lógica mantida)
function atualizarLista() {
    listaComprasUL.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;
    const h2Titulo = listaComprasContainer.querySelector('h2');

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li class="lista-vazia">Nenhum item na lista. Adicione algo!</li>';
        if(h2Titulo) h2Titulo.style.display = 'none'; // Esconde título "Itens no Carrinho"
    } else {
        if(h2Titulo) h2Titulo.style.display = 'block'; // Mostra título

        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros';
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(item);
            return acc;
        }, {});

        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        categoriasOrdenadas.forEach(categoria => {
            const itensDaCategoria = itensAgrupados[categoria];

            itensDaCategoria.sort((a, b) => {
                const aPendente = a.valorUnitario <= 0;
                const bPendente = b.valorUnitario <= 0;
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
                const originalIndex = compras.findIndex(originalItem => originalItem === item); // Encontra índice na lista original
                if (originalIndex === -1) {
                     console.warn("Item renderizado não encontrado na lista original:", item); // Avisa se algo der errado
                     return; // Pula este item se não achar o índice
                }
                const li = document.createElement('li');
                li.dataset.index = originalIndex; // USA ÍNDICE DA LISTA ORIGINAL 'compras'

                if (item.valorUnitario <= 0) {
                    li.classList.add('item-pendente');
                }

                 // Adiciona classe 'sem-valor' ao BOTÃO se necessário
                let buttonClass = "excluir-item";
                if (item.valorUnitario <= 0) {
                    buttonClass += " sem-valor";
                }

                li.innerHTML = `
                    <span class="item-info">
                        <span class="item-qtd">${item.quantidade}x</span>
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-preco">${item.valorUnitario > 0 ? `R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                        <!-- <span class="item-cat">(${item.categoria})</span> Opcional -->
                    </span>
                    <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                // Listener para editar (no LI, exceto no botão de excluir)
                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                         // Pega o índice do dataset, que é o índice correto na lista 'compras'
                        const indexParaEditar = parseInt(li.dataset.index);
                        if (!isNaN(indexParaEditar) && indexParaEditar >= 0 && indexParaEditar < compras.length) {
                            editarItem(indexParaEditar);
                        } else {
                            console.error("Índice inválido no dataset para edição:", li.dataset.index);
                            mostrarFeedbackErro("Erro ao tentar editar o item.");
                        }
                    }
                });
                categoryGroup.appendChild(li);
            });

            listaComprasUL.appendChild(categoryGroup);
        });
    }

    // Aplicar filtro de visibilidade inicial (mantido)
    aplicarFiltroCategoria();

    // Calcula totais GERAIS (usando 'compras') e atualiza painéis (mantido)
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    totalValor.textContent = totalGeral.toFixed(2).replace('.', ','); // Total oculto
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral); // Atualiza barra de progresso
}

// Função para aplicar o filtro de categoria (mantido)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');
    let algumItemVisivel = false;

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden');
            algumItemVisivel = true;
        } else {
            grupo.classList.add('hidden');
        }
    });

     // Mostra mensagem se filtro escondeu tudo, mas a lista não está vazia
    const msgListaVazia = listaComprasUL.querySelector('.lista-vazia');
    if (!algumItemVisivel && compras.length > 0 && !msgListaVazia) {
         // Adiciona uma mensagem temporária de filtro vazio
         const liFiltroVazio = document.createElement('li');
         liFiltroVazio.textContent = `Nenhum item na categoria "${categoriaSelecionada}".`;
         liFiltroVazio.classList.add('filtro-vazio-msg'); // Classe para estilo opcional
         listaComprasUL.appendChild(liFiltroVazio);
    } else {
         // Remove mensagem de filtro vazio se houver
         const msgFiltroVazio = listaComprasUL.querySelector('.filtro-vazio-msg');
         if (msgFiltroVazio) msgFiltroVazio.remove();
    }
}


// Verificar orçamento e atualizar barra de progresso (Lógica Reforçada)
function verificarOrcamento(total) {
    const orcamentoValor = parseNumber(orcamentoInput.value);
    let porcentagem = 0;

    if (orcamentoValor > 0) {
        porcentagem = Math.min((total / orcamentoValor) * 100, 100); // Calcula e limita a 100%
    } else {
        porcentagem = 0; // Se orçamento for 0 ou inválido, progresso é 0
    }

    barraProgresso.value = porcentagem;
    porcentagemProgresso.textContent = `${Math.round(porcentagem)}%`;

    // Feedback visual de estouro (já presente no CSS pelo gradiente, mas pode adicionar classe se quiser)
    if (total > orcamentoValor && orcamentoValor > 0) {
        barraProgresso.classList.add('estourado'); // Adiciona classe para estilização extra (opcional)
        painelTotal.style.backgroundColor = '#f8d7da'; // Fundo vermelho claro no painel total
        painelTotal.style.borderColor = '#f5c6cb';
        painelTotal.style.color = '#721c24'; // Texto vermelho escuro
    } else {
        barraProgresso.classList.remove('estourado');
        // Restaura estilo normal do painel total
        painelTotal.style.backgroundColor = '#e9f5e9';
        painelTotal.style.borderColor = '#c8e6c9';
        painelTotal.style.color = '#006400';
    }
}

// --- Funções de Edição e Modal ---

// Função Editar com Scroll para o Modal
function editarItem(index) {
    if (index < 0 || index >= compras.length) {
        mostrarFeedbackErro("Índice de item inválido para edição.");
        return;
    }
    itemEditandoIndex = index;
    const item = compras[index];

    // Preenche o modal (mantido)
    editarDescricao.value = item.descricao;
    editarQuantidade.value = item.quantidade;
    editarValor.value = item.valorUnitario > 0 ? item.valorUnitario.toFixed(2).replace('.', ',') : ''; // Mostra vazio se for 0

    // Mostra o modal (mantido)
    modalEdicao.style.display = 'block';

    // --- SCROLL --- Leva o modal para a vista
    setTimeout(() => { // Pequeno delay para garantir que o modal está 'block'
         modalEdicao.scrollIntoView({ behavior: 'smooth', block: 'center' });
         editarDescricao.focus(); // Foca no primeiro campo
    }, 50); // Delay mínimo
}

function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditandoIndex = null; // Limpa o índice ao fechar
    // Limpa campos do modal
    editarDescricao.value = '';
    editarQuantidade.value = '';
    editarValor.value = '';
}
// Listener para formatar valor no modal (mantido)
editarValor.addEventListener('input', function() {
     let valor = this.value.replace(/\D/g, ''); // Remove tudo não dígito
     if (valor.length > 2) {
         valor = valor.slice(0, -2) + ',' + valor.slice(-2); // Insere vírgula
     } else if (valor.length > 0) {
         valor = '0,' + ('0' + valor).slice(-2); // Adiciona zero à esquerda se necessário
     } else {
         valor = ''; // Vazio se não houver dígitos
     }
      // Adicionar ponto de milhar (opcional, pode poluir em mobile)
     // if (valor.length > 6) { // Ex: 1.234,56
     //     let [inteiro, decimal] = valor.split(',');
     //     inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
     //     valor = inteiro + ',' + decimal;
     // }
     this.value = valor;
});

// Listener Salvar Edição (lógica mantida, chama atualizarLista)
salvarEdicaoBtn.addEventListener('click', () => {
    if (itemEditandoIndex === null || itemEditandoIndex >= compras.length) {
        mostrarFeedbackErro("Nenhum item selecionado para salvar ou índice inválido.");
        return;
    }

    const novaDescricao = editarDescricao.value.trim();
    const novaQuantidade = parseInt(editarQuantidade.value, 10);
    const novoValorUnitario = parseNumber(editarValor.value); // Usa a função parseNumber

    // Validações
    if (!novaDescricao) {
        mostrarFeedbackErro('A descrição não pode ficar vazia.');
        editarDescricao.focus();
        return;
    }
    if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
        mostrarFeedbackErro('A quantidade deve ser um número maior que zero.');
        editarQuantidade.focus();
        return;
    }
     // Valor pode ser zero, não precisa validar > 0 aqui

    const novaCategoria = inferirCategoria(novaDescricao); // Re-inferir categoria

    // Atualiza o item na lista 'compras'
    compras[itemEditandoIndex] = {
        descricao: novaDescricao,
        quantidade: novaQuantidade,
        valorUnitario: novoValorUnitario,
        categoria: novaCategoria
    };

    fecharModalEdicao();
    atualizarLista(); // Re-renderiza a lista completa com as categorias
    salvarDados();
    mostrarFeedbackSucesso('Item editado com sucesso!');
});

// --- Funções de Reconhecimento de Voz (Inalteradas) ---
function ativarVozParaInput(inputId) {
     // ... (código existente)
}
function editarCampoComVoz(campoId) { ativarVozParaInput(campoId); }
// Adicionar listeners para os microfones do modal (se ainda não existirem)
document.querySelectorAll('.modal-mic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetInputId = btn.dataset.target;
        if (targetInputId) {
            editarCampoComVoz(targetInputId);
        }
    });
});


// --- Funções de Importação/Exportação/Limpeza ---

// Importar com scroll no final (Scroll opcional, talvez confuso)
function importarDadosXLSX(file) {
     // ... (lógica existente de leitura do XLSX) ...
     // DENTRO DO 'reader.onload':
     reader.onload = (e) => {
         try {
             // ... (processamento da planilha) ...

             // Adiciona/Atualiza itens na lista 'compras'
             data.slice(1).forEach(row => { // Pula cabeçalho
                 if (row && row.length >= 1 && row[0]) { // Precisa pelo menos da descrição
                     const descricao = String(row[0]).trim();
                     const quantidade = parseInt(row[1], 10) || 1;
                     const valorUnitario = parseNumber(String(row[2] || '0'));
                     let categoria = String(row[3] || '').trim();

                     if (!categoria) { // Inferir se não fornecida
                         categoria = inferirCategoria(descricao);
                     }

                     const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());

                     if(itemExistenteIndex > -1) {
                         // Opção: Apenas atualizar ou perguntar? Por simplicidade, vamos atualizar.
                         compras[itemExistenteIndex].quantidade = quantidade; // Substitui qtd
                         compras[itemExistenteIndex].valorUnitario = valorUnitario; // Substitui valor
                         if(categoria && categoria !== 'Outros') compras[itemExistenteIndex].categoria = categoria; // Atualiza categoria se fornecida e válida
                     } else {
                         compras.push({ descricao, quantidade, valorUnitario, categoria });
                     }
                 }
             });

             atualizarLista();
             salvarDados();
             mostrarFeedbackSucesso(`${data.length - 1} linhas processadas do arquivo.`);

             // --- SCROLL OPCIONAL --- Leva para o input de adicionar item após importar
             // voiceInputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

         } catch (error) {
             console.error("Erro ao processar arquivo XLSX:", error);
             mostrarFeedbackErro('Erro ao ler o arquivo. Verifique o formato.');
         }
     };
     // ... (resto da função)
}

// Gerar Relatório (Lógica mantida)
function gerarRelatorioExcel() { /* ... */ }

// --- Event Listeners ---

// Input principal e botões associados (Mantidos)
vozInput.addEventListener('input', () => { awesompleteInstance.evaluate(); });
vozInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processarEAdicionarItem(vozInput.value); });
ativarVoz.addEventListener('click', () => { ativarVozParaInput('vozInput'); });
inserirItem.addEventListener('click', () => { processarEAdicionarItem(vozInput.value); });
limparInput.addEventListener('click', () => { vozInput.value = ''; ocultarFeedback(); vozInput.focus(); });

// Delegação de eventos para botões de excluir na lista (Lógica de remoção mantida)
listaComprasUL.addEventListener('click', (event) => {
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        const index = parseInt(li.dataset.index); // Pega o índice correto
         if (!isNaN(index) && index >= 0 && index < compras.length) {
             if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                 const itemRemovido = compras.splice(index, 1)[0]; // Remove da lista 'compras'

                 // Animação de remoção (mantida e aplicada ao LI)
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.4s ease-out, padding 0.3s ease-out, margin 0.3s ease-out';
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(50px)'; // Desliza para direita
                 li.style.maxHeight = '0';
                 li.style.paddingTop = '0';
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 // li.style.border = 'none'; // Borda já foi removida no CSS

                 setTimeout(() => {
                      // A lista já foi atualizada no 'splice', só precisa re-renderizar
                      atualizarLista(); // Re-renderiza a UL com base na lista 'compras' atualizada
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemRemovido.descricao}" excluído!`);
                 }, 400); // Tempo para animação
             }
         } else {
             console.error("Índice inválido ou item não encontrado para exclusão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item. Recarregando lista.");
             atualizarLista(); // Força atualização em caso de erro
         }
    }
});


// Filtro por categoria (Mantido, chama aplicarFiltroCategoria)
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input (Atualiza barra ao digitar e salva)
orcamentoInput.addEventListener('input', () => {
    const totalAtual = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    verificarOrcamento(totalAtual); // Atualiza barra imediatamente
    salvarDados(); // Salva orçamento ao digitar
});
// Formata o valor do orçamento ao perder o foco
orcamentoInput.addEventListener('blur', () => {
     const valor = parseNumber(orcamentoInput.value);
     orcamentoInput.value = valor > 0 ? valor.toFixed(2).replace('.', ',') : '';
     // A barra já foi atualizada no input, salvar dados também.
});

// --- SCROLL EM BOTÕES SUPERIORES ---
function scrollParaInputPrincipal() {
    if (voiceInputContainer) {
        voiceInputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Opcional: focar no input após o scroll
        // setTimeout(() => vozInput.focus(), 300); // Delay para esperar scroll
    }
}

// Listener para Importar (Mostra Modal, depois scroll)
importarBtn.addEventListener('click', () => {
    // Mostra modal de informação primeiro
    const modalInfo = document.getElementById('modalImportInfo');
    const fecharInfoModal = modalInfo.querySelector('.fechar-modal');
    const continuarBtn = document.getElementById('continuarImport');
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = ".xlsx";

    function fecharE limpar() {
        modalInfo.style.display = 'none';
        continuarBtn.removeEventListener('click', handleContinuar);
        fecharInfoModal.removeEventListener('click', fecharE limpar);
    }

    function handleContinuar() {
        fecharE limpar();
        inputFile.click(); // Abre seleção de arquivo
        scrollParaInputPrincipal(); // Rola para input após fechar modal info
    }

    inputFile.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            importarDadosXLSX(file);
        }
    };

    modalInfo.style.display = 'block';
    continuarBtn.addEventListener('click', handleContinuar);
    fecharInfoModal.addEventListener('click', fecharE limpar);

    // Rola para o input principal *imediatamente* ao clicar em Importar?
    // Ou só depois de clicar em Continuar? Decidi fazer após Continuar.
    // scrollParaInputPrincipal(); // Descomente se quiser scroll imediato
});

// Listener para Relatório (Gera e depois scroll)
relatorioBtn.addEventListener('click', () => {
    gerarRelatorioExcel();
    scrollParaInputPrincipal(); // Rola para input após gerar relatório
});

// Listener para Limpar Tudo (Confirma, limpa e depois scroll)
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) {
        mostrarFeedbackInfo('A lista já está vazia.');
        scrollParaInputPrincipal(); // Rola mesmo se vazia
        return;
    }
    if (confirm('Tem certeza que deseja limpar TODA a lista de compras e o orçamento? Esta ação não pode ser desfeita.')) {
        compras = [];
        orcamentoInput.value = '';
        salvarDados(); // Salva lista vazia e remove orçamento do localStorage
        atualizarLista();
        mostrarFeedbackSucesso('Lista de compras e orçamento limpos!');
        verificarOrcamento(0); // Reseta barra de progresso
        scrollParaInputPrincipal(); // Rola para input após limpar
    }
});


// Modal de Edição (Fechar) - Listeners Mantidos
fecharModalBtn.addEventListener('click', fecharModalEdicao);
window.addEventListener('click', (event) => {
    if (event.target == modalEdicao) {
        fecharModalEdicao();
    }
    // Fecha modal de info se clicar fora
    const modalInfo = document.getElementById('modalImportInfo');
    if (modalInfo && event.target == modalInfo) {
         modalInfo.style.display = 'none';
    }
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (modalEdicao.style.display === 'block') {
            fecharModalEdicao();
        }
        const modalInfo = document.getElementById('modalImportInfo');
         if (modalInfo && modalInfo.style.display === 'block') {
             modalInfo.style.display = 'none';
         }
    }
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Iniciando aplicação...");
    carregarDados(); // Carrega dados do localStorage
    atualizarLista(); // Renderiza a lista inicial com categorias
    console.log("Aplicação inicializada.");
});