require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

const app = express();
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos da pasta (HTML, CSS, JS)
app.use(express.static(__dirname));

// Rotas da API
app.get("/api/health", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.json({ status: "ok", version: result[0].version });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/perfil", async (req, res) => {
  const { nome, telefone, necessidade } = req.body;
  if (!nome || !telefone || !necessidade) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const result = await sql`
      INSERT INTO perfis (nome, telefone, necessidade)
      VALUES (${nome}, ${telefone}, ${necessidade})
      RETURNING *;
    `;
    res.status(201).json({ message: "Perfil salvo!", perfil: result[0] });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    res.status(500).json({ error: "Erro no banco de dados." });
  }
});

app.get("/api/perfil", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM perfis ORDER BY id DESC LIMIT 1`;
    res.json(result[0] || null);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

app.post("/api/viagens", async (req, res) => {
  const { origem, destino, tipo = "padrao", horario = null } = req.body;
  if (!origem || !destino) {
    return res.status(400).json({ error: "Origem e destino são obrigatórios." });
  }

  try {
    const result = await sql`
      INSERT INTO viagens (origem, destino, tipo, horario)
      VALUES (${origem}, ${destino}, ${tipo}, ${horario})
      RETURNING *;
    `;
    res.status(201).json({ message: "Viagem registrada!", viagem: result[0] });
  } catch (error) {
    console.error("Erro ao solicitar viagem:", error);
    res.status(500).json({ error: "Erro no banco de dados." });
  }
});

// Servir o index.html na raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});