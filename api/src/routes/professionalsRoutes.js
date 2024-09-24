const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

let profDB = require("../DB/professionals.json");

function loadProfissionais() {
  try {
    profDB = JSON.parse(fs.readFileSync("./src/DB/professionals.json", "utf8"));
    console.log("Dados carregados diretamente do arquivo.");
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err);
  }
}

function escreve(dadosEcrita) {
  try {
    fs.writeFileSync(
      "./src/DB/professionals.json",
      JSON.stringify(dadosEcrita, null, 2),
      "utf8"
    );
    console.log("Dados escritos com sucesso");
  } catch (err) {
    console.error("Não foi possível escrever no arquivo:", err);
  }
}

router.get("/", (req, res) => {
  loadProfissionais();
  try {
    res.json(profDB);
  } catch (err) {
    console.error("Erro ao enviar dados.");
  }
});

router.get("/:id", (req, res) => {
  loadProfissionais();
  const id = req.params.id;
  const profissional = profDB.find((prof) => prof.id === id);

  if (profissional) {
    res.json(profissional);
  } else {
    res.status(404).send("Profissional não encontrado");
  }
});

router.post("/adicionar", (req, res) => {
  loadProfissionais();
  const prof = req.body;
  const id = uuidv4();
  const profComId = {
    id: id,
    ...prof,
  };
  profDB.push(profComId);
  escreve(profDB);
  res.status(201).send("Novo profissional adicionado");
});

router.put("/:id", (req, res) => {
  loadProfissionais();
  const id = req.params.id;
  const profNovo = req.body;
  const profIndex = profDB.findIndex((prof) => prof.id === id);

  if (profIndex !== -1) {
    profDB[profIndex] = { ...profDB[profIndex], ...profNovo };
    escreve(profDB);
    res.json(profDB[profIndex]);
  } else {
    res.status(404).send("Profissional não encontrado");
  }
});

router.delete("/:id", (req, res) => {
  loadProfissionais();
  const id = req.params.id;
  const profIndex = profDB.findIndex((prof) => prof.id === id);

  if (profIndex !== -1) {
    profDB.splice(profIndex, 1);
    escreve(profDB);
    res.status(200).send("Dados removidos com sucesso");
  } else {
    res.status(404).send("Profissional não encontrado");
  }
});

module.exports = router;
