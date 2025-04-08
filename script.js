// Seleção de elementos do DOM (Inalterado)
const vozInput = document.querySelector('#vozInput');
const ativarVoz = document.querySelector('#ativarVoz');
const inserirItem = document.querySelector('#inserirItem');
const limparInput = document.querySelector('#limparInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaComprasUL = document.querySelector('#listaCompras'); // Seleciona a UL especificamente
const listaComprasContainer = document.querySelector('#listaComprasContainer'); // Container geral da lista
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

// Lista de compras e índice do item sendo editado (Inalterado)
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Lista de sugestões (Inalterado)
const listaSugestoes = [ /* ... */ ];
// Ordem desejada das categorias
const ordemCategorias = ['Alimentos', 'Limpeza', 'Higiene Pessoal', 'Outros'];


// --- Funções de Inicialização e Configuração --- (Inalteradas)
const awesompleteInstance = new Awesomplete(vozInput, { /* ... */ });
vozInput.addEventListener('focus', () => { /* ... */ });

// --- Funções de Manipulação de Dados --- (Inalteradas)
function inferirCategoria(descricao) { /* ... */ }
function parseNumber(texto) { /* ... */ }
function processarEAdicionarItem(texto) {
    // Mantém a lógica anterior, mas garante que atualizarLista() seja chamado no final
    // ... (lógica de processamento e adição/atualização em 'compras') ...
    try {
        // ... (código existente para processar texto e encontrar/criar item) ...

        // VALIDAÇÕES
        if (!descricao) {
            mostrarFeedbackErro('A descrição não pode estar vazia.');
            return;
        }

        const itemExistenteIndex = compras.findIndex(item => item.descricao.toLowerCase() === descricao.toLowerCase());
         if (itemExistenteIndex > -1) {
              if (confirm(`"${descricao}" já está na lista. Deseja atualizar a quantidade e o valor?`)) {
                  compras[itemExistenteIndex].quantidade += quantidade;
                  if (valorUnitario > 0 || compras[itemExistenteIndex].valorUnitario <= 0) { // Atualiza valor se um novo foi dado OU se o antigo era zero
                       compras[itemExistenteIndex].valorUnitario = valorUnitario;
                  }
                   // Re-inferir categoria pode ser útil se a descrição mudar muito, mas vamos manter a original por padrão
                   // compras[itemExistenteIndex].categoria = inferirCategoria(descricao);
              } else {
                  mostrarFeedbackErro("Adição cancelada.");
                  return;
              }
         } else {
              const categoria = inferirCategoria(descricao);
              const novoItem = { descricao, quantidade, valorUnitario, categoria };
              compras.push(novoItem);
         }

        atualizarLista(); // Chama a nova função de renderização
        salvarDados();
        vozInput.value = '';
        ocultarFeedback();
        mostrarFeedbackSucesso('Item adicionado/atualizado!');

    } catch (error) {
        console.error("Erro ao processar item:", error);
        mostrarFeedbackErro('Ocorreu um erro ao processar o item.');
    }
}
function salvarDados() { /* ... */ }
function carregarDados() { /* ... */ }

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback (Inalteradas)
function mostrarFeedback(mensagem, tipo = 'info') { /* ... */ }
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() { /* ... */ }


// ATUALIZAR LISTA COM GRUPOS DE CATEGORIA E ORDENAÇÃO INTERNA
function atualizarLista() {
    listaComprasUL.innerHTML = ''; // Limpa apenas a UL de itens
    let totalGeral = 0;
    let totalUnidades = 0;

    if (compras.length === 0) {
        listaComprasUL.innerHTML = '<li>Nenhum item na lista.</li>'; // Mensagem se vazio
        // Esconde o container do título se não houver itens? Opcional.
        listaComprasContainer.querySelector('h2').style.display = 'none';
    } else {
         listaComprasContainer.querySelector('h2').style.display = 'block'; // Garante que título aparece

        // 1. Agrupar itens por categoria
        const itensAgrupados = compras.reduce((acc, item) => {
            const categoria = item.categoria || 'Outros'; // Garante categoria
            if (!acc[categoria]) {
                acc[categoria] = [];
            }
            acc[categoria].push(item);
            return acc;
        }, {});

        // 2. Ordenar categorias na ordem desejada
        const categoriasOrdenadas = Object.keys(itensAgrupados).sort((a, b) => {
            const indexA = ordemCategorias.indexOf(a);
            const indexB = ordemCategorias.indexOf(b);
            // Coloca categorias desconhecidas no final
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
                const aPendente = a.valorUnitario <= 0;
                const bPendente = b.valorUnitario <= 0;
                if (aPendente && !bPendente) return -1;
                if (!aPendente && bPendente) return 1;
                return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
            });

            // Criar o grupo visual para a categoria (header + itens)
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('category-group');
            categoryGroup.dataset.category = categoria; // Associa a categoria ao grupo

            // Criar o cabeçalho da categoria
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.textContent = categoria;
            categoryGroup.appendChild(categoryHeader); // Adiciona header ao grupo

            // Renderizar itens da categoria
            itensDaCategoria.forEach(item => {
                const originalIndex = compras.findIndex(originalItem => originalItem === item);
                const li = document.createElement('li');
                li.dataset.index = originalIndex;

                if (item.valorUnitario <= 0) {
                    li.classList.add('item-pendente');
                }

                let buttonClass = "excluir-item";
                if (item.valorUnitario <= 0) {
                    buttonClass += " sem-valor";
                }

                li.innerHTML = `
                    <span class="item-info">
                        <span class="item-qtd">${item.quantidade}x</span>
                        <span class="item-desc">${item.descricao}</span>
                        <span class="item-preco">${item.valorUnitario > 0 ? `- R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}` : ''}</span>
                        <!-- <span class="item-cat">(${item.categoria})</span> Opcional, já que está sob o header -->
                    </span>
                    <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                         <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                li.addEventListener('click', (event) => {
                    if (!event.target.closest('.excluir-item')) {
                        if (originalIndex !== -1) {
                            editarItem(originalIndex);
                        } else {
                             console.error("Índice original não encontrado para edição:", item);
                             mostrarFeedbackErro("Erro ao tentar editar o item.");
                        }
                    }
                });
                categoryGroup.appendChild(li); // Adiciona item ao grupo da categoria
            });

            listaComprasUL.appendChild(categoryGroup); // Adiciona o grupo completo à UL principal
        });
    }

    // Aplicar filtro de visibilidade inicial
    aplicarFiltroCategoria();

    // Calcula totais GERAIS (usando a lista 'compras' completa)
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza painéis
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral); // Atualiza barra de progresso
}

// Função para aplicar o filtro de categoria (mostrar/ocultar grupos)
function aplicarFiltroCategoria() {
    const categoriaSelecionada = categoriaFiltro.value;
    const todosGrupos = listaComprasUL.querySelectorAll('.category-group');

    todosGrupos.forEach(grupo => {
        const grupoCategoria = grupo.dataset.category;
        if (categoriaSelecionada === "" || grupoCategoria === categoriaSelecionada) {
            grupo.classList.remove('hidden');
        } else {
            grupo.classList.add('hidden');
        }
    });
}


// Verificar orçamento e atualizar barra de progresso (Inalterado)
function verificarOrcamento(total) { /* ... */ }

// --- Funções de Edição e Modal --- (Inalteradas)
function editarItem(index) { /* ... */ }
function fecharModalEdicao() { /* ... */ }
editarValor.addEventListener('input', function() { /* ... */ });
salvarEdicaoBtn.addEventListener('click', () => {
     // Mantém a lógica anterior, mas garante que atualizarLista() seja chamado no final
     if (itemEditandoIndex === null || itemEditandoIndex >= compras.length) { /* ... */ return; }
     // ... (validações e obtenção de novos valores) ...
     const novaCategoria = inferirCategoria(novaDescricao);
     compras[itemEditandoIndex] = { /* ... */ };

     fecharModalEdicao();
     atualizarLista(); // Chama a nova renderização
     salvarDados();
     mostrarFeedbackSucesso('Item editado com sucesso!');
});

// --- Funções de Reconhecimento de Voz --- (Inalteradas)
function ativarVozParaInput(inputId) { /* ... */ }
function editarCampoComVoz(campoId) { ativarVozParaInput(campoId); }

// --- Funções de Importação/Exportação/Limpeza --- (Inalteradas)
function importarDadosXLSX(file) { /* ... Lógica mantida, chama atualizarLista() no final */ }
function gerarRelatorioExcel() { /* ... */ }

// --- Event Listeners ---

// Input principal e botões associados (Inalterados)
vozInput.addEventListener('input', () => { /* ... */ });
vozInput.addEventListener('keypress', (e) => { /* ... */ });
ativarVoz.addEventListener('click', () => { ativarVozParaInput('vozInput'); });
inserirItem.addEventListener('click', () => { /* ... */ });
limparInput.addEventListener('click', () => { /* ... */ });

// Delegação de eventos para botões de excluir na lista
listaComprasUL.addEventListener('click', (event) => { // Listener agora na UL
    const excluirBtn = event.target.closest('.excluir-item');
    if (excluirBtn) {
        const li = excluirBtn.closest('li');
        const index = parseInt(li.dataset.index);
         if (!isNaN(index) && index >= 0 && index < compras.length) {
             if (confirm(`Tem certeza que deseja excluir "${compras[index].descricao}"?`)) {
                 const itemRemovido = compras.splice(index, 1)[0];
                 // Animação de remoção (direto no LI)
                 li.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.3s ease-out'; // Adiciona max-height
                 li.style.opacity = '0';
                 li.style.transform = 'translateX(-20px)';
                 li.style.paddingTop = '0'; // Encolhe padding
                 li.style.paddingBottom = '0';
                 li.style.marginTop = '0';
                 li.style.marginBottom = '0';
                 li.style.maxHeight = '0'; // Encolhe altura
                 li.style.border = 'none'; // Remove borda

                 setTimeout(() => {
                      atualizarLista(); // Renderiza novamente SEM o item
                      salvarDados();
                      mostrarFeedbackSucesso(`"${itemRemovido.descricao}" excluído!`);
                 }, 350); // Tempo um pouco maior para animação completa
             }
         } else {
             console.error("Índice inválido ou item não encontrado para exclusão:", index);
             mostrarFeedbackErro("Erro ao tentar excluir o item.");
             atualizarLista(); // Força atualização em caso de erro
         }
    }
});


// Filtro por categoria (AGORA SÓ CONTROLA VISIBILIDADE)
categoriaFiltro.addEventListener('change', aplicarFiltroCategoria);

// Orçamento Input (Inalterado)
orcamentoInput.addEventListener('input', () => { /* ... */ });

// Botões de ação superiores (Listeners Inalterados)
importarBtn.addEventListener('click', () => { /* ... Lógica mantida, chama atualizarLista() se importar */ });
limparListaBtn.addEventListener('click', () => {
    if (compras.length === 0) { /* ... */ return; }
    if (confirm('Tem certeza que...')) {
        compras = [];
        // Não precisa limpar localStorage aqui, salvarDados faz isso
        salvarDados(); // Salva a lista vazia
        atualizarLista(); // Renderiza a lista vazia (mostrará "Nenhum item")
        mostrarFeedbackSucesso('Lista de compras limpa!');
        orcamentoInput.value = '';
        localStorage.removeItem('orcamento');
        verificarOrcamento(0);
    }
});
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// Modal de Edição (Fechar) - Listeners Inalterados
fecharModalBtn.addEventListener('click', fecharModalEdicao);
window.addEventListener('click', (event) => { /* ... */ });
window.addEventListener('keydown', (event) => { /* ... */ });

// --- Inicialização --- (Inalterado)
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarLista(); // Chama a nova função que agrupa, ordena e renderiza
});