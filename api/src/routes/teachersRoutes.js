const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let teachersDB = require('../DB/teachers.json');

function loadTeachers() {
    teachersDB = JSON.parse(fs.readFileSync('./src/DB/teachers.json', 'utf8'));
}

function writeTeachers(data) {
    fs.writeFileSync('./src/DB/teachers.json', JSON.stringify(data, null, 2), 'utf8');
}

router.get('/', (req, res) => {
    loadTeachers();
    res.json(teachersDB);
});

router.get('/:id', (req, res) => {
    loadTeachers();
    const teacher = teachersDB.find(t => t.id === req.params.id);
    if (!teacher) return res.status(404).send('Professor não encontrado');
    res.json(teacher);
});

router.post('/', (req, res) => {
    loadTeachers();
    const teacher = req.body;
    const id = uuidv4();
    const teacherWithId = { id, ...teacher };
    teachersDB.push(teacherWithId);
    writeTeachers(teachersDB);
    res.status(201).json({ message: 'Professor adicionado com sucesso', teacher: teacherWithId });
});

router.put('/:id', (req, res) => {
    loadTeachers();
    const index = teachersDB.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Professor não encontrado');

    teachersDB[index] = { ...teachersDB[index], ...req.body };
    writeTeachers(teachersDB);
    res.json({ message: 'Professor atualizado com sucesso', teacher: teachersDB[index] });
});

router.delete('/:id', (req, res) => {
    loadTeachers();
    const index = teachersDB.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).send('Professor não encontrado');

    teachersDB.splice(index, 1);
    writeTeachers(teachersDB);
    res.status(204).send({ message: 'Professor removido com sucesso' });
});

module.exports = router;