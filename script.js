// Seleção de elementos do DOM
const vozInput = document.querySelector('#vozInput');
const vozFeedback = document.querySelector('.voz-feedback');
const listaCompras = document.querySelector('#listaCompras'); // Correctly selected now
const painelTotal = document.querySelector('#painelTotal');   // Correctly selected now
const orcamentoInput = document.querySelector('#orcamento');   // Correctly selected now
const categoriaFiltro = document.querySelector('#categoriaFiltro'); // Correctly selected now
const modal = document.querySelector('.modal');                 // Correctly selected now
const editarDescricao = document.querySelector('#editarDescricao'); // Correctly selected now
const editarQuantidade = document.querySelector('#editarQuantidade'); // Correctly selected now
const editarValor = document.querySelector('#editarValor');     // Correctly selected now
const adicionarItemBtn = document.querySelector('#adicionarItem'); // Not used in provided HTML
const salvarEdicaoBtn = document.querySelector('#salvarEdicao');   // Correctly selected now
const fecharModalBtn = document.querySelector('.fechar-modal');   // Correctly selected now
const coins = document.querySelectorAll('.coin');

// Lista de compras e índice do item sendo editado
let compras = JSON.parse(localStorage.getItem('compras')) || [];
let itemEditandoIndex = null;

// Função para inferir categoria automaticamente com base na descrição
function inferirCategoria(descricao) {
  const categorias = {
    Alimentos: ['arroz', 'feijão', 'macarrão', 'frutas', 'verduras', 'legumes', 'carne', 'leite', 'pão', 'ovo'], // Added more food examples
    Limpeza: ['detergente', 'vassoura', 'saco de lixo', 'sabão', 'desinfetante', 'água sanitária', 'esponja'], // Added more cleaning examples
    Higiene: ['shampoo', 'condicionador', 'sabonete', 'pasta de dente', 'papel higiênico'], // Added hygiene category
    Bebidas: ['refrigerante', 'cerveja', 'vinho', 'água', 'suco'], // Added beverages category
    Outros: [] // Keep 'Outros' as a fallback
  };
  for (const [categoria, palavras] of Object.entries(categorias)) {
    if (palavras.some(palavra => descricao.toLowerCase().includes(palavra))) {
      return categoria;
    }
  }
  return 'Outros';
}

// Feedback visual no input de voz
vozInput.addEventListener('input', () => {
  vozFeedback.textContent = vozInput.value;
  if (vozInput.value) {
    vozFeedback.style.display = 'block';
    setTimeout(() => {
      vozFeedback.style.opacity = '1';
    }, 10);
  } else {
    vozFeedback.style.opacity = '0';
    setTimeout(() => {
      vozFeedback.style.display = 'none';
    }, 300);
  }
});

// Processar texto ditado e adicionar item
vozInput.addEventListener('change', () => {
  const texto = vozInput.value.toLowerCase();
  const regex = /(\d+)\s*(?:quilos?|kg|unidades?|un)?\s*(?:de\s*)?([\w\sçãõ]+)\s*(?:por|a|@)\s*([\d.,]+)\s*(?:reais?|r\$)?(?:cada|unidade|kg)?/; // More flexible regex
  const match = texto.match(regex);
  if (match) {
    const quantidade = parseInt(match[1]);
    const descricao = match[2].trim();
    const valorText = match[3].replace(',', '.'); // Ensure decimal point
    const valor = parseFloat(valorText);
    const categoria = inferirCategoria(descricao);
    compras.push({ descricao, quantidade, valor, categoria });
    atualizarLista();
    salvarDados();
    vozInput.value = '';
    vozFeedback.textContent = '';
    animarMoedas(); // Animação ao adicionar item
  } else {
    alert('Ditado não reconhecido. Tente novamente, por exemplo: "2 kg de arroz por 5.50 reais".');
    vozFeedback.textContent = 'Ditado não reconhecido. Tente novamente.'; // Provide feedback in vozFeedback too
    vozFeedback.style.display = 'block';
    vozFeedback.style.opacity = '1';
    setTimeout(() => {
      vozFeedback.style.opacity = '0';
      setTimeout(() => {
        vozFeedback.style.display = 'none';
      }, 300);
    }, 2000); // Keep feedback visible for a short time
  }
});

// Atualizar a lista de compras na tela
function atualizarLista() {
  listaCompras.innerHTML = '';
  let total = 0;
  compras.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.quantidade}x ${item.descricao} - R$ ${item.valor.toFixed(2)} (${item.categoria})`;

    // Create edit and delete buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('button-gold', 'list-button'); // Add styling classes
    editButton.onclick = () => editarItem(index);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.classList.add('button-red', 'list-button'); // Add styling classes
    deleteButton.onclick = () => removerItem(index);


    li.appendChild(editButton);
    li.appendChild(deleteButton);

    li.classList.add('fade-in'); // Animação de entrada
    listaCompras.appendChild(li);
    total += item.quantidade * item.valor;
  });
  painelTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
  verificarOrcamento(total);
}

// Function to remove item
function removerItem(index) {
    compras.splice(index, 1);
    atualizarLista();
    salvarDados();
}


// Verificar se o total excede o orçamento
function verificarOrcamento(total) {
  const orcamento = parseFloat(orcamentoInput.value) || 0;
  if (total > orcamento && orcamento > 0) {
    alert('Orçamento excedido!');
  }
}

// Salvar os dados no localStorage
function salvarDados() {
  localStorage.setItem('compras', JSON.stringify(compras));
}

// Filtrar lista por categoria
categoriaFiltro.addEventListener('change', () => {
  const categoria = categoriaFiltro.value;
  const filtrados = categoria ? compras.filter(item => item.categoria === categoria) : compras;
  atualizarListaFiltrada(filtrados);
});

// Atualizar lista filtrada
function atualizarListaFiltrada(filtrados) {
  listaCompras.innerHTML = '';
  filtrados.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.quantidade}x ${item.descricao} - R$ ${item.valor.toFixed(2)} (${item.categoria})`;
    li.classList.add('fade-in');
    listaCompras.appendChild(li);
  });
}

// Abrir modal para editar item
function editarItem(index) {
  itemEditandoIndex = index;
  const item = compras[index];
  editarDescricao.value = item.descricao;
  editarQuantidade.value = item.quantidade;
  editarValor.value = item.valor.toFixed(2);
  modal.style.display = 'block';
}

// Salvar edição do item
salvarEdicaoBtn.addEventListener('click', () => {
  if (itemEditandoIndex !== null) {
    const novaDescricao = editarDescricao.value;
    const novaQuantidade = parseInt(editarQuantidade.value) || 1;
    const novoValor = parseFloat(editarValor.value) || 0;
    const novaCategoria = inferirCategoria(novaDescricao);
    compras[itemEditandoIndex] = { descricao: novaDescricao, quantidade: novaQuantidade, valor: novoValor, categoria: novaCategoria };
    modal.style.display = 'none';
    atualizarLista();
    salvarDados();
  }
});

// Fechar modal
fecharModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Animação das moedas ao adicionar item
function animarMoedas() {
  coins.forEach((coin, index) => {
    coin.style.opacity = 0;
    setTimeout(() => {
      coin.style.transition = 'opacity 0.5s';
      coin.style.opacity = 1;
    }, index * 200);
  });
}

// Carregar a lista ao iniciar a página
atualizarLista();