const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let teachersDB = require('../DB/teachers.json');

function loadTeachers() {
    try {
        teachersDB = JSON.parse(fs.readFileSync('./src/DB/teachers.json', 'utf8'));
        console.log('Dados carregados diretamente do arquivo.');
    } catch (err) {
        console.log('Erro ao ler o arquivo', err);
    }
}

function writeTeachers(data) {
    try {
        fs.writeFileSync('./src/DB/teachers.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - school_disciplines
 *         - contact
 *         - phone_number
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o professor
 *         name:
 *           type: string
 *           description: Nome do professor
 *         school_disciplines:
 *           type: string
 *           description: Disciplinas escolares do professor
 *         contact:
 *           type: string
 *           description: Email de contato do professor
 *         phone_number:
 *           type: string
 *           description: Número de telefone do professor
 *         status:
 *           type: string
 *           description: Status de disponibilidade do professor (on/off)
 *       example:
 *         id: "7a6cc1282c5f6ec0235acd2bfa780145aa2a67fd"
 *         name: "Judite Heeler"
 *         school_disciplines: "Artes, Português"
 *         contact: "j.heeler@gmail.com"
 *         phone_number: "48 9696 5858"
 *         status: "on"
 */

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: "API para gerenciamento de professores | Desenvolvido por: **Bruno Souza**"
 */

/**
 * @swagger
 * /teacher:
 *   get:
 *     summary: Retorna a lista de todos os professores
 *     tags: [Teachers]
 *     responses:
 *       200:
 *         description: A lista de professores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 */
router.get('/', (req, res) => {
    loadTeachers();
    res.json(teachersDB);
});

/**
 * @swagger
 * /teacher/{id}:
 *   get:
 *     summary: Retorna um professor pelo ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     responses:
 *       200:
 *         description: Professor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Professor não encontrado
 */
router.get('/:id', (req, res) => {
    loadTeachers();
    const teacher = teachersDB.find(t => t.id === req.params.id);
    if (!teacher) return res.status(404).send('Professor não encontrado');
    res.json(teacher);
});

/**
 * @swagger
 * /teacher/name/{name}:
 *   get:
 *     summary: Retorna um professor pelo nome, mesmo que parcial e sem diferenciar maiúsculas e minúsculas
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte do nome do professor
 *     responses:
 *       200:
 *         description: Lista completa de professores encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Nenhum professor encontrado
 */
router.get('/name/:name', (req, res) => {
    loadTeachers();
    const name = req.params.name.toLowerCase();

    function normalize(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    const teachers = teachersDB.filter(teacher => 
        normalize(teacher.name.toLowerCase()).includes(normalize(name))
    );

    if (teachers.length > 0) {
        res.json(teachers);  // Retorna a lista completa de professores encontrados
    } else {
        res.status(404).send('Nenhum professor encontrado');
    }
});

/**
 * @swagger
 * /teacher:
 *   post:
 *     summary: Adiciona um novo professor
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       201:
 *         description: Professor adicionado com sucesso
 */
router.post('/', (req, res) => {
    loadTeachers();

    const { name, school_disciplines, contact, phone_number, status } = req.body;

    if (!name || !school_disciplines || !contact || !phone_number || !status) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const id = uuidv4(); // Gerar ID automaticamente
    const newTeacher = { id, name, school_disciplines, contact, phone_number, status };
    teachersDB.push(newTeacher);
    writeTeachers(teachersDB);
    res.status(201).json({ message: 'Professor adicionado com sucesso', teacher: newTeacher });
});

/**
 * @swagger
 * /teacher/{id}:
 *   put:
 *     summary: Atualiza um professor pelo ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Professor atualizado com sucesso
 *       404:
 *         description: Professor não encontrado
 */
router.put('/:id', (req, res) => {
    loadTeachers();
    const index = teachersDB.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Professor não encontrado');

    const { name, school_disciplines, contact, phone_number, status } = req.body;

    if (!name || !school_disciplines || !contact || !phone_number || !status) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    teachersDB[index] = { id: req.params.id, name, school_disciplines, contact, phone_number, status };
    writeTeachers(teachersDB);
    res.json({ message: 'Professor atualizado com sucesso', teacher: teachersDB[index] });
});

/**
 * @swagger
 * /teacher/{id}:
 *   delete:
 *     summary: Remove um professor pelo ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do professor
 *     responses:
 *       204:
 *         description: Professor removido com sucesso
 *       404:
 *         description: Professor não encontrado
 */
router.delete('/:id', (req, res) => {
    loadTeachers();
    const index = teachersDB.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Professor não encontrado');

    teachersDB.splice(index, 1);
    writeTeachers(teachersDB);
    res.status(204).send({ message: 'Professor removido com sucesso' });
});

module.exports = router;
