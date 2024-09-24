const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let usersDB = require('../DB/users.json');

function loadUsers() {
    try {
        usersDB = JSON.parse(fs.readFileSync('./src/DB/users.json', 'utf-8'));
        console.log('Dados carregados diretamente do arquivo.');
    } catch (err) {
        console.log('Erro ao ler o arquivo', err);
    }
}

function escreve(dadosEcrita) {
    try {
        fs.writeFileSync('./src/DB/users.json', JSON.stringify(dadosEcrita, null, 2), 'utf8');
        console.log('Dados escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

router.get('/:id', (req, res) => {
    loadUsers();
    try {
        res.json(usersDB);
    } catch (err) {
        console.log("Erro ao enviar dados.");
    }
});

router.post('/adicionar', (req, res) => {
    loadUsers();
    const user = req.body;
    const id = uuidv4();
    const usersComId = {
        id: id,
        ...user
    };
    usersDB.push(usersComId);
    escreve(usersDB);
    res.status(201).send('Novo usuários adicionado');
});

router.put('/:id', (req, res) => {
    loadUsers();
    const id = req.params.id;
    const userNovo = req.body;
    const userIndex = usersDB.findIndex(user => user.id === id);

    usersDB[userIndex] = { ...usersDB[userIndex], ...userNovo};
    escreve(usersDB);
    res.json(usersDB[userIndex]);
});

router.delete('/:id', (req, res) => {
    loadUsers();
    const id = req.params.id;
    const userIndex = usersDB.findIndex(user => user.id === id);
    usersDB.splice(userIndex, 1);
    escreve(usersDB);
    res.status(200).send('Dados removidos com sucesso');
});

module.exports = router;