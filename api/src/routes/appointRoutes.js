const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let appointDB = require('../DB/appointments.json');

function loadAlunos() {
    try {
        appointDB = JSON.parse(fs.readFileSync('./src/DB/appointments.json', 'utf8'));
        console.log('Dados carregados diretamente do arquivo.');
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
    }
}

function escreve(dadosEcrita) {
    try {
        fs.writeFileSync('./src/DB/appointments.json', JSON.stringify(dadosEcrita, null, 2), 'utf8');
        console.log('Dados escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
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
 *           description: ID gerado automaticamente para o agendamento
 *         date:
 *           type: string
 *           format: date-time
 *           description: Data do agendamento
 *         specialty:
 *           type: string
 *           description: Especialidade do agendamento
 *         comments:
 *           type: string
 *           description: Comentários adicionais sobre o agendamento
 *         student:
 *           type: string
 *           description: Nome do estudante associado ao agendamento
 *         professional:
 *           type: string
 *           description: Nome do profissional associado ao agendamento
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
 *   name: Appointments
 *   description: API de controle de agendamentos
 */

/**
 * @swagger
 * /appoint:
 *   get:
 *     summary: Retorna a lista de todos os agendamentos
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: A lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/', (req, res) => {
    loadAlunos();
    try {
        res.json(appointDB);
    } catch (err) {
        console.error("Erro ao enviar dados.");
    }
});

/**
 * @swagger
 * /appoint/data/{data1}/{data2}:
 *   get:
 *     summary: Retorna agendamentos entre duas datas
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: data1
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: Data inicial
 *       - in: path
 *         name: data2
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: Data final
 *     responses:
 *       200:
 *         description: Agendamentos filtrados por datas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Datas inseridas incorretamente
 */
router.get('/data/:data1?/:data2?', (req, res) => {
    loadAlunos();

    const datan1 = req.params.data1;
    const datan2 = req.params.data2;

    if (!datan1 || !datan2) {
        return res.status(400).send('Datas inseridas erradas');
    }

    const date1 = new Date(datan1);
    let date2 = new Date(datan2);

    date2.setHours(23, 59, 59, 999); 
    
    const dataFiltrada = appointDB.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= date1 && itemDate <= date2;
    });

    res.json(dataFiltrada);
});

/**
 * @swagger
 * /appoint/adicionar:
 *   post:
 *     summary: Adiciona um novo agendamento
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Agendamento adicionado com sucesso
 */
router.post('/adicionar', (req, res) => {
    loadAlunos();
    const appoint = req.body;
    const id = uuidv4();
    const appointComId = {
        id: id,
        ...appoint
    };
    appointDB.push(appointComId);
    escreve(appointDB);
    res.status(201).send('novo agendamento adicionado');
});

/**
 * @swagger
 * /appoint/{id}:
 *   put:
 *     summary: Atualiza um agendamento pelo ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agendamento a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
router.put('/:id', (req, res) => {
    loadAlunos();
    const id = req.params.id;
    const appointNovo = req.body;
    const appointIndex = appointDB.findIndex(appoint => appoint.id === id);

    appointDB[appointIndex] = { ...appointDB[appointIndex], ...appointNovo };
    escreve(appointDB);
    res.json(appointDB[appointIndex]);
});

/**
 * @swagger
 * /appoint/{id}:
 *   delete:
 *     summary: Remove um agendamento pelo ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agendamento a ser removido
 *     responses:
 *       200:
 *         description: Agendamento removido com sucesso
 */
router.delete('/:id', (req, res) => {
    loadAlunos();
    const id = req.params.id;
    const appointIndex = appointDB.findIndex(appoint => appoint.id === id);
    appointDB.splice(appointIndex, 1);
    escreve(appointDB);
    res.status(200).send('dados removidos com sucesso');
});

module.exports = router;
