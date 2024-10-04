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
     Student:
       type: object
       required:
         - id
         - name
         - age
         - parents
         - phone_number
         - special_needs
         - status
       properties:
         id:
           type: string
           description: ID único do aluno
         name:
           type: string
           description: Nome do aluno
         age:
           type: string
           description: Idade do aluno
         parents:
           type: string
           description: Pais do aluno
         phone_number:
           type: string
           description: Número de telefone do aluno
         special_needs:
           type: string
           description: Necessidades especiais do aluno
         status:
           type: string
           description: Status do aluno (por exemplo, "on" ou "off")
       example:
         id: "eab1234567890abcdef1234567890abcdef1234"
         name: "Bluey Heeler"
         age: "5"
         parents: "Bandit Heeler e Chilli Heeler"
         phone_number: "48 9876 5432"
         special_needs: "Nenhuma"
         status: "on"
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
 * /Student/name/{name}:
 *   get:
 *     summary: Retorna um aluno pelo nome, mesmo que parcial e sem diferenciar maiúsculas e minúsculas
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte do nome do aluno
 *     responses:
 *       200:
 *         description: Lista completa de alunos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: Nenhum usuário encontrado
 */
router.get('/name/:name', (req, res) => {
    loadStudents();
    const name = req.params.name.toLowerCase();
    
    function normalize(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    const students = studentsDB.filter(student => 
        normalize(student.name.toLowerCase()).includes(normalize(name))
    );

    if (students.length > 0) {
        res.json(students);
    } else {
        res.status(404).send('Nenhum aluno encontrado');
    }
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