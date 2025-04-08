// Seleção de elementos do DOM (Inalterado)
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
const listaSugestoes = [ /* ... (mantida como antes) ... */
    "Água sanitária", "Detergente", "Vassoura", "Saco de lixo", "Sabão em pó", "Amaciante", "Esponja", "Papel toalha",
    "Arroz", "Feijão", "Macarrão", "Banana", "Tomate", "Biscoito", "Leite", "Queijo", "Manteiga", "Pão", "Café",
    "Açúcar", "Óleo de cozinha", "Farinha de trigo", "Ovos", "Carne bovina", "Frango", "Peixe", "Batata", "Cebola",
    "Alho", "Maçã", "Laranja", "Uva", "Morango", "Cenoura", "Beterraba", "Brócolis", "Espinafre", "Iogurte",
    "Refrigerante", "Suco", "Cerveja", "Vinho", "Sabonete", "Shampoo", "Desodorante", "Papel higiênico",
    "Escova de dente", "Creme dental", "Fio dental", "Absorvente", "Preservativo", "Pilhas", "Lâmpadas",
    "Fósforos", "Velas"
];

// --- Funções de Inicialização e Configuração --- (Inalteradas)
const awesompleteInstance = new Awesomplete(vozInput, { /* ... */ });
vozInput.addEventListener('focus', () => { /* ... */ });

// --- Funções de Manipulação de Dados --- (Inalteradas)
function inferirCategoria(descricao) { /* ... */ }
function parseNumber(texto) { /* ... */ }
function processarEAdicionarItem(texto) { /* ... */ }
function salvarDados() { /* ... */ }
function carregarDados() { /* ... */ }

// --- Funções de Atualização da Interface (UI) ---

// Funções de Feedback (Inalteradas)
function mostrarFeedback(mensagem, tipo = 'info') { /* ... */ }
function mostrarFeedbackSucesso(mensagem) { mostrarFeedback(mensagem, 'success'); }
function mostrarFeedbackErro(mensagem) { mostrarFeedback(mensagem, 'error'); }
function ocultarFeedback() { /* ... */ }

// Atualizar lista de compras (COM NOVA ORDENAÇÃO e destaque suave)
function atualizarLista() { // Removido argumento 'filtrados' pois a filtragem é feita aqui dentro
    listaCompras.innerHTML = '';
    let totalGeral = 0;
    let totalUnidades = 0;

    // 1. Filtrar pela categoria selecionada
    const categoriaSelecionada = categoriaFiltro.value;
    const listaFiltrada = categoriaSelecionada
        ? compras.filter(item => item.categoria === categoriaSelecionada)
        : [...compras]; // Cria cópia da lista completa se 'Todas' estiver selecionado

    // 2. Ordenar a lista filtrada (ou completa)
    listaFiltrada.sort((a, b) => {
        const aPendente = a.valorUnitario <= 0;
        const bPendente = b.valorUnitario <= 0;

        // Critério 1: Itens pendentes (valor 0) vêm primeiro
        if (aPendente && !bPendente) {
            return -1; // a (pendente) vem antes de b (não pendente)
        }
        if (!aPendente && bPendente) {
            return 1; // b (pendente) vem antes de a (não pendente)
        }

        // Critério 2: Se ambos têm o mesmo status (pendente ou não), ordenar alfabeticamente
        // Usa localeCompare para ordenação correta de acentos e caracteres especiais
        return a.descricao.localeCompare(b.descricao, 'pt-BR', { sensitivity: 'base' });
    });

    // 3. Renderizar a lista ordenada
    listaFiltrada.forEach((item) => {
        // Encontra o índice original na lista 'compras' para edição/exclusão corretas
        const originalIndex = compras.findIndex(originalItem => originalItem === item); // Busca pelo objeto exato

        const li = document.createElement('li');
        li.dataset.index = originalIndex; // Usa o índice DA LISTA ORIGINAL 'compras'

        // Adiciona classe para item pendente (valor 0) - Estilo suavizado no CSS
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
                <span class="item-cat">(${item.categoria})</span>
            </span>
            <button class="${buttonClass}" aria-label="Excluir ${item.descricao}">
                 <i class="fas fa-trash-alt"></i>
            </button>
        `;

        listaCompras.appendChild(li);

        // Adiciona evento de clique para edição (exceto no botão de excluir)
        li.addEventListener('click', (event) => {
             if (!event.target.closest('.excluir-item')) {
                 // Certifica-se de que o índice é válido antes de chamar editarItem
                 if (originalIndex !== -1) {
                     editarItem(originalIndex);
                 } else {
                     console.error("Não foi possível encontrar o índice original do item:", item);
                     mostrarFeedbackErro("Erro ao tentar editar o item.");
                 }
             }
        });
    });

    // Calcula totais GERAIS (usando a lista 'compras' original, não a filtrada/ordenada)
    totalGeral = compras.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    totalUnidades = compras.reduce((sum, item) => sum + item.quantidade, 0);
    const nomesUnicosCount = new Set(compras.map(item => item.descricao.toLowerCase().trim())).size;

    // Atualiza painéis de total e contagem
    totalValorPainel.textContent = totalGeral.toFixed(2).replace('.', ',');
    totalValor.textContent = totalGeral.toFixed(2).replace('.', ',');
    contagemNomesSpan.textContent = nomesUnicosCount;
    contagemUnidadesSpan.textContent = totalUnidades;

    verificarOrcamento(totalGeral); // Atualiza a barra de progresso
}

// Verificar orçamento e atualizar barra de progresso (Inalterado)
function verificarOrcamento(total) { /* ... */ }

// --- Funções de Edição e Modal --- (Inalteradas)
function editarItem(index) { /* ... */ }
function fecharModalEdicao() { /* ... */ }
editarValor.addEventListener('input', function() { /* ... */ });
salvarEdicaoBtn.addEventListener('click', () => { /* ... */ });

// --- Funções de Reconhecimento de Voz --- (Inalteradas)
function ativarVozParaInput(inputId) { /* ... */ }
function editarCampoComVoz(campoId) { ativarVozParaInput(campoId); }

// --- Funções de Importação/Exportação/Limpeza --- (Inalteradas)
function importarDadosXLSX(file) { /* ... */ }
function gerarRelatorioExcel() { /* ... */ }

// --- Event Listeners --- (Lógica principal inalterada, apenas a chamada a atualizarLista no filtro)

// Input principal e botões associados (Inalterados)
vozInput.addEventListener('input', () => { /* ... */ });
vozInput.addEventListener('keypress', (e) => { /* ... */ });
ativarVoz.addEventListener('click', () => { ativarVozParaInput('vozInput'); });
inserirItem.addEventListener('click', () => { /* ... */ });
limparInput.addEventListener('click', () => { /* ... */ });

// Delegação de eventos para botões de excluir na lista (Inalterado)
listaCompras.addEventListener('click', (event) => { /* ... Animação de remoção mantida */ });

// Filtro por categoria (Chama atualizarLista sem argumentos)
categoriaFiltro.addEventListener('change', () => {
    atualizarLista(); // A função agora lê o filtro e ordena internamente
});

// Orçamento Input (Inalterado)
orcamentoInput.addEventListener('input', () => { /* ... */ });

// Botões de ação superiores (Importar, Limpar, Relatório) - Listeners Inalterados
importarBtn.addEventListener('click', () => { /* ... */ });
limparListaBtn.addEventListener('click', () => { /* ... */ });
relatorioBtn.addEventListener('click', gerarRelatorioExcel);

// Modal de Edição (Fechar) - Listeners Inalterados
fecharModalBtn.addEventListener('click', fecharModalEdicao);
window.addEventListener('click', (event) => { /* ... */ });
window.addEventListener('keydown', (event) => { /* ... */ });

// --- Inicialização --- (Inalterado)
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarLista();
});