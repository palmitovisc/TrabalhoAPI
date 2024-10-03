const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let studentsDB = require('../DB/students.json');

function loadStudents() {
    try {
        studentsDB = JSON.parse(fs.readFileSync('./src/DB/students.json', 'utf8'));
        console.log('Dados dos alunos carregados diretamente do arquivo.');
    } catch (err) {
        console.log('Erro ao ler o arquivo', err);
    }
}

function writeStudents(data) {
    try {
        fs.writeFileSync('./src/DB/students.json', JSON.stringify(data, null, 2), 'utf8');
        console.log('Dados dos alunos escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - grade
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o aluno
 *         name:
 *           type: string
 *           description: Nome do aluno
 *         grade:
 *           type: string
 *           description: Série do aluno
 *       example:
 *         id: "1a2b3c4d"
 *         name: "João Silva"
 *         grade: "9th grade"
 */

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: API para gerenciamento de alunos | Desenvolvido por: **João Victor Borges Lourenço**"
 */

/**
 * @swagger
 * /student:
 *   get:
 *     summary: Retorna a lista de todos os alunos
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: A lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get('/', (req, res) => {
    loadStudents();
    res.json(studentsDB);
});

/**
 * @swagger
 * /student/{id}:
 *   get:
 *     summary: Retorna um aluno pelo ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/:id', (req, res) => {
    loadStudents();
    const student = studentsDB.find(s => s.id === req.params.id);
    if (!student) return res.status(404).send('Aluno não encontrado');
    res.json(student);
});

/**
 * @swagger
 * /student:
 *   post:
 *     summary: Adiciona um novo aluno
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Aluno adicionado com sucesso
 */
router.post('/', (req, res) => {
    loadStudents();
    const student = req.body;
    const id = uuidv4();
    const studentWithId = { id, ...student };
    studentsDB.push(studentWithId);
    writeStudents(studentsDB);
    res.status(201).json({ message: 'Aluno adicionado com sucesso', student: studentWithId });
});

/**
 * @swagger
 * /student/{id}:
 *   put:
 *     summary: Atualiza um aluno pelo ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.put('/:id', (req, res) => {
    loadStudents();
    const index = studentsDB.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).send('Aluno não encontrado');

    studentsDB[index] = { ...studentsDB[index], ...req.body };
    writeStudents(studentsDB);
    res.json({ message: 'Aluno atualizado com sucesso', student: studentsDB[index] });
});

/**
 * @swagger
 * /student/{id}:
 *   delete:
 *     summary: Remove um aluno pelo ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do aluno
 *     responses:
 *       204:
 *         description: Aluno removido com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
router.delete('/:id', (req, res) => {
    loadStudents();
    const index = studentsDB.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).send('Aluno não encontrado');

    studentsDB.splice(index, 1);
    writeStudents(studentsDB);
    res.status(204).send({ message: 'Aluno removido com sucesso' });
});

module.exports = router;
