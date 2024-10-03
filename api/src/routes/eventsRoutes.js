const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

let eventDB = require('../DB/events.json');

function loadAlunos() {
    try {
       
        eventDB = JSON.parse(fs.readFileSync('./src/DB/events.json', 'utf8'));
        console.log('Dados carregados diretamente do arquivo.');
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
    }
}


function escreve(dadosEcrita) {
    try {
        fs.writeFileSync('./src/DB/events.json', JSON.stringify(dadosEcrita, null, 2), 'utf8');
        console.log('Dados escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - id
 *         - description
 *         - comments
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o evento
 *         description:
 *           type: string
 *           description: Descrição do evento
 *         comments:
 *           type: string
 *           description: Comentários adicionais sobre o evento
 *         date:
 *           type: string
 *           format: date-time
 *           description: Data do evento
 *       example:
 *         id: "7a6cc1282c5f6ec0235acd2bfa780145aa2a67fd"
 *         description: "Palestra bem viver com saúde"
 *         comments: "Profissionais de saúde da Unesc"
 *         date: "2023-08-15T16:00:00"
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API de controle de eventos | Desenvolvido por: **Rafael Martignago Palmito**"
 */

/**
 * @swagger
 * /event:
 *   get:
 *     summary: Retorna a lista de todos os eventos
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', (req, res) => {
    loadAlunos();
    try {
        res.json(eventDB);
    } catch (err) {
        console.error("Erro ao enviar dados.");
    }
});

/**
 * @swagger
 * /event/data/{data1}/{data2}:
 *   get:
 *     summary: Retorna eventos entre duas datas
 *     tags: [Events]
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
 *         description: Eventos filtrados por datas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
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
    const date2 = new Date(datan2);

    const dataFiltrada = eventDB.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= date1 && itemDate <= date2;
    });

    res.json(dataFiltrada);
});

/**
 * @swagger
 * /event/adicionar:
 *   post:
 *     summary: Adiciona um novo evento
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Evento adicionado com sucesso
 */
router.post('/adicionar', (req, res) => {
    loadAlunos();
    const evento = req.body;
    const id = uuidv4();
    const eventoComId = {
        id: id,
        ...evento
    };
    eventDB.push(eventoComId);
    escreve(eventDB);
    res.status(201).send('novo evento adicionado');
});

/**
 * @swagger
 * /event/{id}:
 *   put:
 *     summary: Atualiza um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */
router.put('/:id', (req, res) => {
    loadAlunos();
    const id = req.params.id; 
    const eventoNovo = req.body; 
    const eventoIndex = eventDB.findIndex(evento => evento.id === id);

    if (eventoIndex === -1) {
        return res.status(404).send('Evento não encontrado'); 
    }

    eventDB[eventoIndex] = { ...eventDB[eventoIndex], ...eventoNovo };
    escreve(eventDB); 
    res.json(eventDB[eventoIndex]); 
});


/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     summary: Remove um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do evento a ser removido
 *     responses:
 *       200:
 *         description: Evento removido com sucesso
 */
router.delete('/:id', (req, res) => {
    loadAlunos();
    const id = req.params.id; 
    const appointIndex = eventDB.findIndex(evento => evento.id === id); 

    if (appointIndex === -1) {
        return res.status(404).send('Evento não encontrado'); 
    }

    eventDB.splice(appointIndex, 1); 
    escreve(eventDB); 
    res.status(200).send('Evento removido com sucesso');
});


module.exports = router;
