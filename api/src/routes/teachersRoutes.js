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
 *         - subject
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o professor
 *         name:
 *           type: string
 *           description: Nome do professor
 *         subject:
 *           type: string
 *           description: Disciplina que o professor ensina
 *       example:
 *         id: "1a2b3c4d"
 *         name: "Maria Oliveira"
 *         subject: "Matemática"
 */

/**
 * @swagger
 * tags:
 *   name: Teachers
 *   description: API para gerenciamento de professores
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
    const teacher = req.body;
    const id = uuidv4();
    const teacherWithId = { id, ...teacher };
    teachersDB.push(teacherWithId);
    writeTeachers(teachersDB);
    res.status(201).json({ message: 'Professor adicionado com sucesso', teacher: teacherWithId });
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

    teachersDB[index] = { ...teachersDB[index], ...req.body };
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