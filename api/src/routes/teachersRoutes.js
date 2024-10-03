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
 *         - specialty
 *         - comments
 *         - date
 *         - student
 *         - professional
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o professor
 *         specialty:
 *           type: string
 *           description: Especialidade do professor
 *         comments:
 *           type: string
 *           description: Comentários sobre a sessão
 *         date:
 *           type: string
 *           description: Data da sessão
 *         student:
 *           type: string
 *           description: Nome do aluno
 *         professional:
 *           type: string
 *           description: Nome do profissional
 *       example:
 *         id: "7a6cc1282c5f6ec0235acd2bfa780145aa2a67fd"
 *         specialty: "Fisioterapeuta"
 *         comments: "Realizar sessão"
 *         date: "2023-08-15 16:00:00"
 *         student: "Bingo Heeler"
 *         professional: "Winton Blake"
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
 * /teacher/name/{name}:
 *   get:
 *     summary: Retorna professores pelo nome
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome do professor
 *     responses:
 *       200:
 *         description: Lista de professores encontrados
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

    const matchingTeachers = teachersDB.filter(teacher =>
        normalize(teacher.student.toLowerCase()).includes(normalize(name)) || 
        normalize(teacher.professional.toLowerCase()).includes(normalize(name))
    );

    if (matchingTeachers.length > 0) {
        res.json(matchingTeachers);
    } else {
        res.status(404).send('Nenhum professor encontrado com esse nome.');
    }
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

    const { specialty, comments, date, student, professional } = req.body;

    if (!specialty || !comments || !date || !student || !professional) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const id = uuidv4(); // Gerar ID automaticamente
    const newTeacher = { id, specialty, comments, date, student, professional };
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

    const { specialty, comments, date, student, professional } = req.body;

    if (!specialty || !comments || !date || !student || !professional) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    teachersDB[index] = { id: req.params.id, specialty, comments, date, student, professional };
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