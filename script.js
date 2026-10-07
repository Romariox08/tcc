const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    carregarPerfil();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById("btn-perfil")?.addEventListener("click", () => abrirPagina("perfil"));
    document.getElementById("btn-carro")?.addEventListener("click", () => abrirPagina("carro"));
    document.getElementById("btn-salvar-perfil")?.addEventListener("click", salvarPerfil);
    document.getElementById("btn-confirmar-carro")?.addEventListener("click", confirmarCarro);
    document.getElementById("btn-casa")?.addEventListener("click", irParaCasa);
    document.getElementById("btn-trabalho")?.addEventListener("click", irParaTrabalho);
    document.getElementById("btn-medico")?.addEventListener("click", irParaMedico);

    document.querySelectorAll(".btn-destino").forEach((btn) => {
        btn.addEventListener("click", () => abrirPagina(btn.dataset.pagina));
    });

    document.querySelectorAll(".btn-voltar").forEach((btn) => {
        btn.addEventListener("click", () => abrirPagina("inicio"));
    });
}

function abrirPagina(pagina) {
    document.querySelectorAll(".pagina").forEach((p) => {
        p.classList.remove("ativa");
        p.hidden = true;
    });

    const pagAtiva = document.getElementById(pagina);
    if (pagAtiva) {
        pagAtiva.classList.add("ativa");
        pagAtiva.hidden = false;
    }

    if (pagina === "carro") atualizarResumo();
}

function atualizarResumo() {
    const origem = document.getElementById("origem").value.trim();
    const destino = document.getElementById("destino").value.trim();
    document.getElementById("resumo-origem").textContent = origem || "Não informado";
    document.getElementById("resumo-destino").textContent = destino || "Não informado";
}

async function salvarPerfil() {
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const necessidade = document.getElementById("necessidade").value;

    if (!nome || !telefone || !necessidade) {
        alert("Preencha todos os campos do perfil!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/perfil`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone, necessidade })
        });
        if (res.ok) alert("Perfil salvo no Neon Database!");
    } catch (e) {
        alert("Erro ao conectar ao servidor.");
    }
}

async function carregarPerfil() {
    try {
        const res = await fetch(`${API_URL}/perfil`);
        if (res.ok) {
            const perfil = await res.json();
            if (perfil) {
                document.getElementById("nome").value = perfil.nome || "";
                document.getElementById("telefone").value = perfil.telefone || "";
                document.getElementById("necessidade").value = perfil.necessidade || "";
            }
        }
    } catch (e) {
        console.log("Servidor offline ou sem perfil cadastrado.");
    }
}

async function solicitarViagem(origem, destino, tipo = "padrao", horario = null) {
    try {
        const res = await fetch(`${API_URL}/viagens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ origem, destino, tipo, horario })
        });
        if (res.ok) alert("Viagem salva com sucesso no banco Neon!");
    } catch (e) {
        alert("Erro ao registrar viagem.");
    }
}

function confirmarCarro() {
    const origem = document.getElementById("origem").value.trim();
    const destino = document.getElementById("destino").value.trim();
    if (!origem || !destino) return alert("Informe origem e destino!");
    solicitarViagem(origem, destino, "adaptado");
}

function irParaCasa() {
    const endereco = document.getElementById("endereco-casa").value.trim();
    if (!endereco) return alert("Informe seu endereço!");
    solicitarViagem("Origem Atual", endereco, "casa");
}

function irParaTrabalho() {
    const endereco = document.getElementById("endereco-trabalho").value.trim();
    if (!endereco) return alert("Informe o endereço!");
    solicitarViagem("Origem Atual", endereco, "trabalho");
}

function irParaMedico() {
    const endereco = document.getElementById("endereco-medico").value.trim();
    const horario = document.getElementById("horario").value;
    if (!endereco || !horario) return alert("Informe endereço e horário!");
    solicitarViagem("Origem Atual", endereco, "medico", horario);
}