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

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o usuário
 *         name:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           description: Email do usuário
 *       example:
 *         id: "1a2b3c4d"
 *         name: "João Silva"
 *         email: "joao.silva@example.com"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para gerenciamento de usuários
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Retorna a lista de todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', (req, res) => {
    loadUsers();
    res.json(usersDB);
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 */
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

/**
 * @swagger
 * /user/adicionar:
 *   post:
 *     summary: Adiciona um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário adicionado com sucesso
 */
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
    res.status(201).send('Novo usuário adicionado');
});

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
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

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', (req, res) => {
    loadUsers();
    const id = req.params.id;
    const userIndex = usersDB.findIndex(user => user.id === id);

    if (userIndex !== -1) {
        usersDB.splice(userIndex, 1);
        escreve(usersDB);
        res.status(200).send('Usuário removido com sucesso');
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});

module.exports = router;
