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

router.get('/', (req, res) => {
    loadUsers();
    res.json(usersDB);
});

router.get('/:id', (req, res) => {
    loadUsers();
    const id = req.params.id;
    const user = usersDB.find(user => user.id === id );

    if (user) {
        res.json(user);
    } else {
        res.status(404).send('Usuário não encontrado');
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

    if (userIndex !== -1) {
        usersDB[userIndex] = { ...usersDB[userIndex], ...userNovo};
        escreve(usersDB);
        res.json(usersDB[userIndex]);
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});

router.delete('/:id', (req, res) => {
    loadUsers();
    const id = req.params.id;
    const userIndex = usersDB.findIndex(user => user.id === id);

    if (userIndex !== -1) {
        usersDB.splice(userIndex, 1);
        escreve(usersDB);
        res.status(200).send('Dados removidos com sucesso');
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});

module.exports = router;