// Importa Firebase e Firestore
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

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

  // Funções utilitárias
  function formatDateToBR(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  // Atualiza o conteúdo do modal de pagamentos
  function updatePaymentsModal(fornecedor) {
    elements.paymentsContent.innerHTML = `
      <h2>Histórico de Pagamentos para ${fornecedor.name}</h2>
      <ul>
        ${fornecedor.pagamentos && fornecedor.pagamentos.length
          ? fornecedor.pagamentos.map(pagamento => `
            <li>
              <span>Data:</span> ${formatDateToBR(pagamento.data)} <br>
              <span>Valor:</span> ${pagamento.valor} <br>
              <span>NF:</span> ${pagamento.nf} <br>
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

  // Renderiza a lista de fornecedores
  function renderFornecedores(list) {
    elements.fornecedoresContainer.innerHTML = "";
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

  // Abre o modal de pagamentos
  function openPaymentsModal(fornecedor) {
    updatePaymentsModal(fornecedor);
    elements.paymentsModal.style.display = "block";
  }

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
    const pagamentos = fornecedor.pagamentos || []; // Garante que pagamentos não seja undefined
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

  // Evento de busca
  elements.searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const fornecedores = await getFornecedores();
    const filteredList = fornecedores.filter(fornecedor =>
      fornecedor.name.toLowerCase().includes(query)
    );
    renderFornecedores(filteredList);
  });

  // Evento de adição de fornecedor
  elements.addButton.addEventListener("click", () => {
    elements.modalTitle.textContent = "Adicionar Fornecedor";
    elements.formFornecedor.reset();
    elements.formFornecedor.dataset.id = "";
    elements.deleteButton.style.display = "none";
    elements.modal.style.display = "block";
  });

  // Evento de fechamento dos modais
  function closeModals() {
    elements.modal.style.display = "none";
    elements.paymentsModal.style.display = "none";
    elements.paymentFormModal.style.display = "none";
  }
  

  elements.closeModal.addEventListener("click", closeModals);
  elements.paymentsClose.addEventListener("click", () => {
    elements.paymentsModal.style.display = "none";
  });
  elements.paymentFormClose.addEventListener("click", () => {
    elements.paymentFormModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === elements.modal ||
        e.target === elements.paymentsModal ||
        e.target === elements.paymentFormModal) {
      closeModals();
    }
  });
  

  // Evento de submissão do formulário de fornecedor
elements.formFornecedor.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = elements.formFornecedor.dataset.id;
  const name = elements.formFornecedor.nome.value;
  const ativo = elements.formFornecedor.status.value === "true";
  const pagamento = elements.formFornecedor.pagamento.value;

  // Cria o objeto fornecedor com os campos necessários
  const fornecedor = { name, ativo, pagamento };

  if (id) {
    // Obtém o fornecedor existente para preservar os pagamentos
    const fornecedorAtual = (await getFornecedores()).find(f => f.id === id);

    // Atualiza o fornecedor com os dados novos, mantendo a lista de pagamentos existente
    await updateFornecedor(id, { ...fornecedor, pagamentos: fornecedorAtual.pagamentos || [] });
  } else {
    await addFornecedor(fornecedor);
  }

  const fornecedores = await getFornecedores();
  renderFornecedores(fornecedores);
  closeModals();
});


  // Evento de clique na lista de fornecedores
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
    await deleteFornecedor(id);

    const fornecedores = await getFornecedores();
    renderFornecedores(fornecedores);
    closeModals();
  });

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
    }
  });

      // Evento de exclusão de pagamento
      elements.paymentsContent.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-payment")) {
          const nf = e.target.dataset.nf;
          const fornecedorId = elements.fornecedoresContainer.querySelector("[data-id]").dataset.id;
      
          try {
            const fornecedorRef = doc(db, "fornecedores", fornecedorId);
            const fornecedor = (await getFornecedores()).find(f => f.id === fornecedorId);
      
            // Verifica se o fornecedor foi encontrado
            if (!fornecedor) {
              console.error("Fornecedor não encontrado");
              return;
            }
      
            // Verifica se `fornecedor.pagamentos` é um array
            const pagamentos = Array.isArray(fornecedor.pagamentos) 
              ? fornecedor.pagamentos.filter(p => p.nf !== nf) 
              : [];
      
            // Atualiza o documento do fornecedor com a lista filtrada de pagamentos
            await updateDoc(fornecedorRef, { pagamentos });
      
            // Atualiza a interface com a lista atualizada de fornecedores
            const fornecedores = await getFornecedores();
            renderFornecedores(fornecedores);
      
            // Atualiza o modal de pagamentos
            openPaymentsModal(fornecedor);
      
            // Fecha o modal de pagamentos
            closeModals();
          } catch (error) {
            console.error("Erro ao excluir pagamento: ", error);
          }
        }
      });
      



        // Evento de submissão do formulário de pagamento
        elements.paymentForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const fornecedorId = elements.fornecedoresContainer.querySelector("[data-id]").dataset.id;
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
            pagamentos[pagamentoIndex] = { data, valor, nf: pagamentoNF };
          } else {
            pagamentos.push({ data, valor, nf: pagamentoNF });
          }

          await updateDoc(fornecedorRef, { pagamentos });

          const fornecedores = await getFornecedores();
          renderFornecedores(fornecedores);
          closeModals();
        });




  // Inicializa a lista de fornecedores
  getFornecedores().then(fornecedores => renderFornecedores(fornecedores));
});
