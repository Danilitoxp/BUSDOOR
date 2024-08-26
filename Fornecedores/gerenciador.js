//////////////////////////////// CODIGOS FIREBASE /////////////////////////////////////

// Importa Firebase e Firestore
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';


// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQliXWvsQMpEz1sO-a65QK86hN1DYsq08",
  authDomain: "busdoor-carflax-13923.firebaseapp.com",
  projectId: "busdoor-carflax-13923",
  storageBucket: "busdoor-carflax-13923.appspot.com",
  messagingSenderId: "703413532189",
  appId: "1:703413532189:web:3ba01774b2d8ffd4a178f4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let currentFornecedorId;

// Obtém todos os fornecedores do Firestore
async function getFornecedores() {
  try {
    const querySnapshot = await getDocs(collection(db, "fornecedores"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao obter fornecedores: ", error);
    return [];
  }
}

// Adiciona um fornecedor ao Firestore
async function addFornecedor(fornecedor) {
  try {
    const docRef = await addDoc(collection(db, "fornecedores"), fornecedor);
    console.log("Fornecedor adicionado com ID: ", docRef.id);
  } catch (error) {
    console.error("Erro ao adicionar fornecedor: ", error);
  }
}

// Atualiza um fornecedor no Firestore
async function updateFornecedor(id, fornecedor) {
  try {
    const fornecedorRef = doc(db, "fornecedores", id);
    const pagamentos = fornecedor.pagamentos || [];
    await updateDoc(fornecedorRef, { ...fornecedor, pagamentos });
    console.log("Fornecedor atualizado com ID: ", id);
  } catch (error) {
    console.error("Erro ao atualizar fornecedor: ", error);
  }
}


// Exclui um fornecedor do Firestore
async function deleteFornecedor(id) {
  try {
    const fornecedorRef = doc(db, "fornecedores", id);
    await deleteDoc(fornecedorRef);
    console.log("Fornecedor excluído com ID: ", id);
  } catch (error) {
    console.error("Erro ao excluir fornecedor: ", error);
  }
}

//////////////////////////////// CODIGOS E FUNÇÕES JAVASCRIPT //////////////////////////


document.addEventListener("DOMContentLoaded", () => {
  // Elementos da página
  const elements = {
    searchInput: document.getElementById("search"),
    addButton: document.getElementById("adicionarfornecedor"),
    modal: document.getElementById("modal"),
    closeModal: document.querySelector("#modal .close"),
    formFornecedor: document.getElementById("form-fornecedor"),
    modalTitle: document.getElementById("modal-title"),
    deleteButton: document.getElementById("delete-fornecedor"),
    paymentsModal: document.getElementById("payments-modal"),
    paymentsClose: document.getElementById("payments-close"),
    paymentsContent: document.getElementById("payments-content"),
    paymentFormModal: document.getElementById("payment-form-modal"),
    paymentFormClose: document.getElementById("payment-form-close"),
    paymentForm: document.getElementById("payment-form"),
    fornecedoresContainer: document.querySelector(".fornecedores")
  };

  ///////////////////////////////////// FORNECEDORES ///////////////////////////////////

  // Evento de adição de fornecedor
  elements.addButton.addEventListener("click", () => {
    elements.modalTitle.textContent = "Adicionar Fornecedor";
    elements.formFornecedor.reset();
    elements.formFornecedor.dataset.id = "";
    elements.deleteButton.style.display = "none";
    elements.modal.style.display = "block";
    elements.modal.style.display = "block";
  });

  // Evento de formulário de fornecedor
  elements.formFornecedor.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = elements.formFornecedor.dataset.id;
    const name = elements.formFornecedor.nome.value;
    const ativo = elements.formFornecedor.status.value === "true";
    const pagamento = elements.formFornecedor.pagamento.value;

    // Verifica se o fornecedor já existe
    if (!id && await checkFornecedorDuplicado(name)) {
      alert(`Já existe um fornecedor com esse o nome ${name}!`);
      return;
    }

    const fornecedor = { name, ativo, pagamento };

    if (id) {
      // Atualiza um fornecedor existente
      const fornecedorAtual = (await getFornecedores()).find(f => f.id === id);
      await updateFornecedor(id, { ...fornecedor, pagamentos: fornecedorAtual.pagamentos || [] });
      console.log(`Fornecedor ${name} Atualizado com sucesso! ✔`);
    } else {
      // Adiciona um novo fornecedor
      await addFornecedor(fornecedor);
      console.log(`Fornecedor ${name} Adicionado com sucesso! ✔`);
    }

    const fornecedores = await getFornecedores();
    renderFornecedores(fornecedores);
    closeModals();
  });



  // Renderiza a lista de fornecedores
  function renderFornecedores(list) {
    elements.fornecedoresContainer.innerHTML = "";
    // Ordena os fornecedores por nome
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.forEach(fornecedor => {
      const fornecedorElement = document.createElement("div");
      fornecedorElement.id = "fornecedor";
      fornecedorElement.dataset.id = fornecedor.id;

      fornecedorElement.innerHTML = `
        <div class="descricao">
          <img src="/assets/images/buss animated.svg" alt="">
          <div class="info">
            <h1>${fornecedor.name}</h1>
          </div>
        </div>
        <div class="botoes">
          <p id="ativo" class="${fornecedor.ativo ? "ativo" : "inativo"}">
            ${fornecedor.ativo
          ? "<i class='bx bxs-calendar-check'></i> Em Dia"
          : "<i class='bx bx-error-alt'></i> Atrasado"
        }
          </p>
          <label for="pagamento" class="upload-button">
            <i class='bx bx-briefcase-alt-2'></i> ${fornecedor.pagamento}
          </label>
          <button class="historico-pagamentos">
            <i class='bx bx-wallet'></i> Pagamentos
          </button>
          <button class="editar">
            <i class='bx bxs-edit'></i> Editar
          </button>
        </div>
      `;
      elements.fornecedoresContainer.appendChild(fornecedorElement);
    });
  }

  // Evento de Editar fornecedores
  elements.fornecedoresContainer.addEventListener("click", async (e) => {
    const fornecedorElement = e.target.closest("#fornecedor");
    if (!fornecedorElement) return;

    const id = fornecedorElement.dataset.id;
    const fornecedores = await getFornecedores();
    const fornecedor = fornecedores.find(f => f.id === id);

    if (e.target.classList.contains("historico-pagamentos")) {
      openPaymentsModal(fornecedor);
    } else if (e.target.classList.contains("editar")) {
      elements.modalTitle.textContent = "Editar Fornecedor";
      elements.formFornecedor.nome.value = fornecedor.name;
      elements.formFornecedor.status.value = fornecedor.ativo ? "true" : "false";
      elements.formFornecedor.pagamento.value = fornecedor.pagamento;
      elements.formFornecedor.dataset.id = id;
      elements.deleteButton.style.display = "block";
      elements.modal.style.display = "block";
    }
  });

  // Evento de exclusão de fornecedor
  elements.deleteButton.addEventListener("click", async () => {
    const id = elements.formFornecedor.dataset.id;

    // Obtém os fornecedores para encontrar o nome do fornecedor a ser excluído
    const fornecedores = await getFornecedores();
    const fornecedor = fornecedores.find(f => f.id === id);

    if (fornecedor) {
      // Exclui o fornecedor
      await deleteFornecedor(id);

      // Renderiza a lista atualizada de fornecedores
      renderFornecedores(fornecedores.filter(f => f.id !== id));

      // Exibe a mensagem de sucesso
      console.log(`Fornecedor ${fornecedor.name} Excluído com sucesso! ✔`);
    } else {
      console.error("Fornecedor não encontrado para exclusão.");
    }

    // Fecha os modais
    closeModals();
  });



  /////////////////////////////////////// PAMENTOS ////////////////////////////////

  // Evento de adição de pagamento
  elements.paymentsContent.addEventListener("click", async (e) => {
    if (e.target.id === "add-payment") {
      elements.paymentFormModal.style.display = "block";
      // Limpa os campos do formulário
      elements.paymentForm.reset();
      // Remove o atributo de dados de NF, pois é um novo pagamento
      delete elements.paymentForm.dataset.nf;

    } else if (e.target.classList.contains("edit-payment")) {
      const nf = e.target.dataset.nf;
      const fornecedorId = elements.fornecedoresContainer.querySelector("[data-id]").dataset.id;
      const fornecedor = (await getFornecedores()).find(f => f.id === fornecedorId);
      const pagamento = fornecedor.pagamentos.find(p => p.nf === nf);

      console.log(`Edição de pagamento iniciado para NF: ${nf}`);

      elements.paymentFormModal.style.display = "block";
      elements.paymentForm.dataset.nf = nf;
      elements.paymentForm.data.value = formatDateToBR(pagamento.data);
      elements.paymentForm.valor.value = pagamento.valor;
      elements.paymentForm.nf.value = pagamento.nf;
    } else if (e.target.classList.contains("delete-payment")) {
      const nf = e.target.dataset.nf;
      const fornecedorId = elements.fornecedoresContainer.querySelector("[data-id]").dataset.id;
      const fornecedorRef = doc(db, "fornecedores", fornecedorId);

      const fornecedor = (await getFornecedores()).find(f => f.id === fornecedorId);
      const pagamentos = fornecedor.pagamentos.filter(p => p.nf !== nf);

      await updateDoc(fornecedorRef, { pagamentos });

      const fornecedores = await getFornecedores();
      renderFornecedores(fornecedores);

      console.log(`Pagamento com NF ${nf} excluído com sucesso! ✔`);
    }
  });


  // Evento de submissão do formulário de pagamento
  elements.paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const fornecedorId = currentFornecedorId; // Usa o ID do fornecedor armazenado
      const nf = elements.paymentForm.dataset.nf;
      const data = elements.paymentForm.data.value;
      const valor = elements.paymentForm.valor.value;
      const pagamentoNF = elements.paymentForm.nf.value;

      const fornecedorRef = doc(db, "fornecedores", fornecedorId);
      const fornecedor = (await getFornecedores()).find(f => f.id === fornecedorId);

      // Atualiza ou adiciona pagamento
      const pagamentos = fornecedor.pagamentos || [];
      const pagamentoIndex = pagamentos.findIndex(p => p.nf === nf);

      if (pagamentoIndex > -1) {
        // Editando um pagamento existente
        pagamentos[pagamentoIndex] = { data, valor, nf: pagamentoNF };
        await updateDoc(fornecedorRef, { pagamentos });
        console.log(`Pagamento com NF ${pagamentoNF} atualizado com sucesso! ✔`);
        // Exibe notificação de sucesso para edição
        showNotification("Sucesso", `Pagamento com NF ${pagamentoNF} atualizado com sucesso!`);
      } else {
        // Adicionando um novo pagamento
        pagamentos.push({ data, valor, nf: pagamentoNF });
        await updateDoc(fornecedorRef, { pagamentos });
        console.log(`Pagamento com NF ${pagamentoNF} adicionado com sucesso! ✔`);
        // Exibe notificação de sucesso para adição
        showNotification("Sucesso", `Pagamento com NF ${pagamentoNF} adicionado com sucesso!`);
      }

      const fornecedores = await getFornecedores();
      renderFornecedores(fornecedores);
      closeModals();
    } catch (error) {
      console.error("Erro ao processar pagamento: ", error);
      // Opcional: Exibir notificação de erro
      showNotification("Erro", "Ocorreu um erro ao processar o pagamento.");
    }
  });


  // Evento de exclusão de pagamento
  elements.paymentsContent.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-payment")) {
      const nf = e.target.dataset.nf;
      const fornecedorId = currentFornecedorId;

      try {
        const fornecedorRef = doc(db, "fornecedores", fornecedorId);
        const fornecedor = (await getFornecedores()).find(f => f.id === fornecedorId);

        if (!fornecedor) {
          console.error("Fornecedor não encontrado");
          return;
        }

        // Mantém apenas os pagamentos que NÃO correspondem à nota fiscal (nf) a ser excluída
        const pagamentos = fornecedor.pagamentos.filter(p => p.nf !== nf);

        // Atualiza o documento do fornecedor com a nova lista de pagamentos
        await updateDoc(fornecedorRef, { pagamentos });

        // Atualiza a interface do usuário com os fornecedores atualizados
        const fornecedores = await getFornecedores();
        renderFornecedores(fornecedores);

        // Fecha o modal de pagamentos após a exclusão
        closeModals();

      } catch (error) {
        console.error("Erro ao excluir pagamento: ", error);
      }
    }
  });


  // Atualiza o conteúdo do modal de pagamentos
function updatePaymentsModal(fornecedor) {
  elements.paymentsContent.innerHTML = `
    <h2>Histórico de Pagamentos para ${fornecedor.name}</h2>
    <ul>
      ${fornecedor.pagamentos && fornecedor.pagamentos.length
        ? fornecedor.pagamentos.map(pagamento => `
          <li>
            <span>Data:</span> ${formatDateToBR(pagamento.data)} <br>
            <span>Valor:</span> ${formatCurrency(pagamento.valor)} <br>
            <span>NF:</span> N° ${pagamento.nf} <br>
            <button class="edit-payment" data-nf="${pagamento.nf}">
              <i class="bx bxs-edit"></i> Editar
            </button>
            <button class="delete-payment" data-nf="${pagamento.nf}">
              <i class="bx bxs-trash"></i> Excluir
            </button>
          </li>`).join("")
        : "<li>Sem pagamentos registrados</li>"
      }
    </ul>
    <button id="add-payment" class="btn btn-primary">
      <i class="bx bxs-plus-circle"></i> Adicionar Pagamento
    </button>
  `;
}



  /////////////////////////////// FUNÇÕES UTILITARIAS ///////////////////////////

  function openPaymentsModal(fornecedor) {
    console.log("Abrindo o modal de pagamentos para o fornecedor:", fornecedor); // Adicione este log
    updatePaymentsModal(fornecedor);
    elements.paymentsModal.style.display = "block";
    currentFornecedorId = fornecedor.id; // Armazena o ID do fornecedor
  }
  


  function formatCurrency(value) {
    // Remove caracteres não numéricos, exceto ponto e vírgula
    const cleanValue = value.replace(/\D/g, ''); // Remove tudo que não é dígito
  
    // Converte o valor para número
    const numberValue = parseFloat(cleanValue) / 100; // Divide por 100 para tratar centavos
  
    // Verifica se a conversão foi bem-sucedida
    if (isNaN(numberValue)) {
      return 'R$ 0,00'; // Valor padrão caso a conversão falhe
    }
  
    // Usa a Intl.NumberFormat para formatar o valor como moeda brasileira
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
  }


  // Evento de busca
  elements.searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const fornecedores = await getFornecedores();
    const filteredList = fornecedores.filter(fornecedor =>
      fornecedor.name.toLowerCase().includes(query)
    );
    renderFornecedores(filteredList);
  });
  

  // Evento de fechamento dos modais
  function closeModals() {
    elements.modal.style.display = "none";
    elements.paymentsModal.style.display = "none";
    elements.paymentFormModal.style.display = "none";
  }
  // Eventos de fechamento dos modais
  elements.closeModal.addEventListener("click", closeModals);
  elements.paymentsClose.addEventListener("click", () => {
    elements.paymentsModal.style.display = "none";
  });

  // Eventos de fechamento dos modais
  elements.paymentFormClose.addEventListener("click", () => {
    elements.paymentFormModal.style.display = "none";
  });

  // Evento de clique no botão de pagamento
  window.addEventListener("click", (e) => {
    if (e.target === elements.modal ||
      e.target === elements.paymentsModal ||
      e.target === elements.paymentFormModal) {
      closeModals();
    }
  });

  // Verifica se o nome do fornecedor já existe
  async function checkFornecedorDuplicado(name) {
    const fornecedoresRef = collection(db, "fornecedores");
    const q = query(fornecedoresRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Funções utilitárias
  function formatDateToBR(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }


  ////////////////////////////////// NOTIFCAÇÕES //////////////////////////////////



  function showNotification(title, message) {
    const notification = document.getElementById('notification');

    // Define o conteúdo da notificação
    notification.innerHTML = `
        <i class='bx bxs-check-circle'></i>
        <div class="text">
            <span id="notification-title">${title}</span>
            <p id="notification-message">${message}</p>
        </div>
        <span class="close-btn">&times;</span>
    `;

    // Exibe a notificação
    notification.style.display = 'flex'; // Use 'flex' para alinhar itens horizontalmente

    // Oculta a notificação após 3 segundos
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  // Adiciona o listener para o botão de fechar
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('close-btn')) {
      event.target.closest('.notifications-success').style.display = 'none';
    }
  });


  async function addFornecedor(fornecedor) {
    try {
      const docRef = await addDoc(collection(db, "fornecedores"), fornecedor);
      showNotification("Sucesso", "Fornecedor adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar fornecedor: ", error);
    }
  }

  async function updateFornecedor(id, fornecedor) {
    try {
      const fornecedorRef = doc(db, "fornecedores", id);
      const pagamentos = fornecedor.pagamentos || [];
      await updateDoc(fornecedorRef, { ...fornecedor, pagamentos });
      showNotification("Sucesso", `Fornecedor atualizado com ID: ${id}`);
    } catch (error) {
      console.error("Erro ao atualizar fornecedor: ", error);
    }
  }


  // Função para Fechar Modal de Notificações
  document.querySelector('.close-btn').addEventListener('click', function () {
    document.querySelector('.notifications').style.display = 'none';
  });


  // Inicializa a lista de fornecedores
  getFornecedores().then(fornecedores => renderFornecedores(fornecedores));
});
