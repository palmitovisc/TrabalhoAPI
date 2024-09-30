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
 *   description: API para gerenciamento de alunos
 */

router.get('/', (req, res) => {
    loadStudents();
    res.json(studentsDB);
});

router.get('/:id', (req, res) => {
    loadStudents();
    const student = studentsDB.find(s => s.id === req.params.id);
    if (!student) return res.status(404).send('Aluno não encontrado');
    res.json(student);
});

router.post('/', (req, res) => {
    loadStudents();
    const student = req.body;
    const id = uuidv4();
    const studentWithId = { id, ...student };
    studentsDB.push(studentWithId);
    writeStudents(studentsDB);
    res.status(201).json({ message: 'Aluno adicionado com sucesso', student: studentWithId });
});

router.put('/:id', (req, res) => {
    loadStudents();
    const index = studentsDB.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).send('Aluno não encontrado');

    studentsDB[index] = { ...studentsDB[index], ...req.body };
    writeStudents(studentsDB);
    res.json({ message: 'Aluno atualizado com sucesso', student: studentsDB[index] });
});

router.delete('/:id', (req, res) => {
    loadStudents();
    const index = studentsDB.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).send('Aluno não encontrado');

    studentsDB.splice(index, 1);
    writeStudents(studentsDB);
    res.status(204).send({ message: 'Aluno removido com sucesso' });
});

module.exports = router;