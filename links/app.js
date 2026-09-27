import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginScreen = document.getElementById("loginScreen");
const appContainer = document.getElementById("app");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginButton = loginForm?.querySelector("button");
const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");
const newHearingButton = document.getElementById("newHearingButton");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const hearingForm = document.getElementById("hearingForm");
const modalTitle = document.getElementById("modalTitle");

const statuses = ["a-fazer", "agendada", "realizada", "cancelada"];

const field = (id) => document.getElementById(id);

function setLoginError(message = "") {
  loginError.textContent = message;
  loginError.style.display = message ? "block" : "none";
}

function setLoginLoading(loading) {
  if (!loginButton) return;
  loginButton.disabled = loading;
  loginButton.textContent = loading ? "Entrando..." : "Entrar";
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginScreen.style.display = "flex";
    appContainer.style.display = "none";
    if (userEmail) userEmail.textContent = "";
    return;
  }

  loginScreen.style.display = "none";
  appContainer.style.display = "block";
  if (userEmail) userEmail.textContent = user.email || "";
  await carregarAudiencias();
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginError("");

  const email = field("email").value.trim();
  const password = field("password").value;

  if (!email || !password) {
    setLoginError("Informe seu e-mail e sua senha.");
    return;
  }

  setLoginLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    console.error("Falha no login:", error);
    setLoginError("E-mail ou senha inválidos.");
  } finally {
    setLoginLoading(false);
  }
});

logoutButton?.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Falha ao sair:", error);
  }
});

function abrirModal() {
  hearingForm.reset();
  field("hearingId").value = "";
  modalTitle.textContent = "Nova audiência";
  modalOverlay.style.display = "flex";
  field("processo")?.focus();
}

function fecharModal() {
  modalOverlay.style.display = "none";
}

newHearingButton?.addEventListener("click", abrirModal);
closeModal?.addEventListener("click", fecharModal);

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) fecharModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalOverlay?.style.display === "flex") {
    fecharModal();
  }
});

hearingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const hearingId = field("hearingId").value.trim();

  const dados = {
    processo: field("processo").value.trim(),
    parte: field("parte").value.trim(),
    polo: field("polo")?.value || "",
    tribunal: field("tribunal")?.value.trim() || "",
    vara: field("vara")?.value.trim() || "",
    tipo: field("tipo").value,
    status: field("status").value,
    data: field("data").value,
    horario: field("horario").value,
    advogado: field("advogado").value.trim(),
    local: field("local")?.value.trim() || "",
    observacoes: field("observacoes").value.trim(),
    userId: user.uid,
    atualizadoEm: serverTimestamp(),
  };

  if (!dados.processo || !dados.parte || !dados.data || !dados.horario) {
    alert("Preencha processo, parte, data e horário.");
    return;
  }

  try {
    if (hearingId) {
      const hearingRef = doc(db, "audiencias", hearingId);
      const existing = await getDoc(hearingRef);

      if (!existing.exists() || existing.data().userId !== user.uid) {
        throw new Error("Registro não encontrado ou sem permissão.");
      }

      await updateDoc(hearingRef, dados);
    } else {
      dados.criadoEm = serverTimestamp();
      await addDoc(collection(db, "audiencias"), dados);
    }

    fecharModal();
    hearingForm.reset();
    await carregarAudiencias();
  } catch (error) {
    console.error("Falha ao salvar audiência:", error);
    alert("Não foi possível salvar a audiência.");
  }
});

async function carregarAudiencias() {
  const user = auth.currentUser;
  if (!user) return;

  statuses.forEach((status) => {
    const cards = document.getElementById(`cards-${status}`);
    const counter = document.getElementById(`counter-${status}`);
    if (cards) cards.innerHTML = "";
    if (counter) counter.textContent = "0";
  });

  try {
    const q = query(
      collection(db, "audiencias"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    const audiencias = [];
    snapshot.forEach((item) => {
      audiencias.push({ id: item.id, ...item.data() });
    });

    audiencias.sort((a, b) => {
      const aValue = `${a.data || ""} ${a.horario || ""}`;
      const bValue = `${b.data || ""} ${b.horario || ""}`;
      return aValue.localeCompare(bValue);
    });

    audiencias.forEach(criarCard);

    statuses.forEach((status) => {
      const container = document.getElementById(`cards-${status}`);
      const counter = document.getElementById(`counter-${status}`);
      const count = container?.querySelectorAll(".hearing-card").length || 0;

      if (counter) counter.textContent = count;

      if (container && count === 0) {
        container.innerHTML =
          '<div class="empty-column">Nenhuma audiência.</div>';
      }
    });
  } catch (error) {
    console.error("Falha ao carregar audiências:", error);
    alert("Não foi possível carregar as audiências.");
  }
}

function criarCard(audiencia) {
  const container = document.getElementById(`cards-${audiencia.status}`);
  if (!container) return;

  const card = document.createElement("article");
  card.className = "hearing-card";

  const dataFormatada = formatarData(audiencia.data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataAudiencia = audiencia.data
    ? new Date(`${audiencia.data}T00:00:00`)
    : null;

  if (dataAudiencia && !Number.isNaN(dataAudiencia.getTime())) {
    const diff = Math.ceil((dataAudiencia - hoje) / 86400000);
    if (audiencia.status === "agendada" && diff >= 0 && diff <= 7) {
      card.classList.add("hearing-near");
    }
  }

  card.innerHTML = `
    <div class="card-top">
      <h4>${escapeHTML(audiencia.parte)}</h4>
      <span class="type-badge">${escapeHTML(audiencia.tipo || "Audiência")}</span>
    </div>

    <div class="card-line">
      <strong>Processo:</strong> ${escapeHTML(audiencia.processo)}
    </div>

    ${
      audiencia.polo
        ? `<div class="card-line"><strong>Polo:</strong> ${escapeHTML(audiencia.polo)}</div>`
        : ""
    }

    ${
      audiencia.tribunal
        ? `<div class="card-line"><strong>Tribunal:</strong> ${escapeHTML(audiencia.tribunal)}</div>`
        : ""
    }

    ${
      audiencia.vara
        ? `<div class="card-line"><strong>Vara:</strong> ${escapeHTML(audiencia.vara)}</div>`
        : ""
    }

    <div class="card-line">
      <strong>Data:</strong> ${dataFormatada} às ${escapeHTML(audiencia.horario || "-")}
    </div>

    ${
      audiencia.advogado
        ? `<div class="card-line"><strong>Advogado:</strong> ${escapeHTML(audiencia.advogado)}</div>`
        : ""
    }

    ${
      audiencia.local
        ? `<div class="card-line"><strong>Local:</strong> ${escapeHTML(audiencia.local)}</div>`
        : ""
    }

    ${
      audiencia.observacoes
        ? `<div class="card-line"><strong>Observações:</strong> ${escapeHTML(audiencia.observacoes)}</div>`
        : ""
    }

    <div class="card-actions">
      <button type="button" data-action="edit">Editar</button>
      <button type="button" class="delete-button" data-action="delete">Excluir</button>
    </div>
  `;

  card.querySelector('[data-action="edit"]').addEventListener("click", () => {
    editarAudiencia(audiencia.id);
  });

  card.querySelector('[data-action="delete"]').addEventListener("click", () => {
    excluirAudiencia(audiencia.id);
  });

  container.appendChild(card);
}

async function editarAudiencia(id) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const hearingRef = doc(db, "audiencias", id);
    const snapshot = await getDoc(hearingRef);

    if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
      alert("Registro não encontrado.");
      return;
    }

    const audiencia = { id: snapshot.id, ...snapshot.data() };

    field("hearingId").value = audiencia.id;
    field("processo").value = audiencia.processo || "";
    field("parte").value = audiencia.parte || "";
    if (field("polo")) field("polo").value = audiencia.polo || "";
    if (field("tribunal")) field("tribunal").value = audiencia.tribunal || "";
    if (field("vara")) field("vara").value = audiencia.vara || "";
    field("tipo").value = audiencia.tipo || "Conciliação";
    field("status").value = audiencia.status || "a-fazer";
    field("data").value = audiencia.data || "";
    field("horario").value = audiencia.horario || "";
    field("advogado").value = audiencia.advogado || "";
    if (field("local")) field("local").value = audiencia.local || "";
    field("observacoes").value = audiencia.observacoes || "";

    modalTitle.textContent = "Editar audiência";
    modalOverlay.style.display = "flex";
  } catch (error) {
    console.error("Falha ao editar audiência:", error);
    alert("Não foi possível abrir a audiência.");
  }
}

async function excluirAudiencia(id) {
  const user = auth.currentUser;
  if (!user) return;

  const confirmar = confirm(
    "Tem certeza que deseja excluir esta audiência? Essa ação não pode ser desfeita."
  );

  if (!confirmar) return;

  try {
    const hearingRef = doc(db, "audiencias", id);
    const snapshot = await getDoc(hearingRef);

    if (!snapshot.exists() || snapshot.data().userId !== user.uid) {
      alert("Registro não encontrado.");
      return;
    }

    await deleteDoc(hearingRef);
    await carregarAudiencias();
  } catch (error) {
    console.error("Falha ao excluir audiência:", error);
    alert("Não foi possível excluir a audiência.");
  }
}

function formatarData(data) {
  if (!data) return "-";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escapeHTML(valor) {
  if (valor === null || valor === undefined) return "";

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
