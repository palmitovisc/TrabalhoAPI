const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

let profDB = require('../DB/professionals.json');

function loadProfissionais() {
    try {
        profDB = JSON.parse(fs.readFileSync('./src/DB/professionals.json', 'utf8'));
        console.log('Dados carregados diretamente do arquivo.');
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
    }
}

function escreve(dadosEcrita) {
    try {
        fs.writeFileSync('./src/DB/professionals.json', JSON.stringify(dadosEcrita, null, 2), 'utf8');
        console.log('Dados escritos com sucesso');
    } catch (err) {
        console.error('Não foi possível escrever no arquivo:', err);
    }
}

// Swagger definition
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Profissionais',
            version: '1.0.0',
            description: 'API para controle de profissionais',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['professionalsRoutes.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Suas rotas e documentação Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Professional:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o profissional
 *         name:
 *           type: string
 *           description: Nome do profissional
 *         role:
 *           type: string
 *           description: Função do profissional
 *       example:
 *         id: "7a6cc1282c5f6ec0235acd2bfa780145aa2a67fd"
 *         name: "João Silva"
 *         role: "Desenvolvedor"
 */

/**
 * @swagger
 * tags:
 *   name: Professionals
 *   description: API de controle de profissionais
 */

/**
 * @swagger
 * /prof:
 *   get:
 *     summary: Retorna a lista de todos os profissionais
 *     tags: [Professionals]
 *     responses:
 *       200:
 *         description: A lista de profissionais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Professional'
 */
router.get('/', (req, res) => {
    loadProfissionais();
    try {
        res.json(profDB);
    } catch (err) {
        console.error("Erro ao enviar dados.");
    }
});

/**
 * @swagger
 * /prof/adicionar:
 *   post:
 *     summary: Adiciona um novo profissional
 *     tags: [Professionals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Professional'
 *     responses:
 *       201:
 *         description: Profissional adicionado com sucesso
 */
router.post('/adicionar', (req, res) => {
    loadProfissionais();
    const profissional = req.body;
    const id = uuidv4();
    const profissionalComId = {
        id: id,
        ...profissional
    };
    profDB.push(profissionalComId);
    escreve(profDB);
    res.status(201).send('novo profissional adicionado');
});

/**
 * @swagger
 * /prof/{id}:
 *   put:
 *     summary: Atualiza um profissional pelo ID
 *     tags: [Professionals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Professional'
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Professional'
 */
router.put('/:id', (req, res) => {
    loadProfissionais();
    const id = req.params.id;
    const profissionalNovo = req.body;
    const profissionalIndex = profDB.findIndex(profissional => profissional.id === id);

    if (profissionalIndex !== -1) {
        profDB[profissionalIndex] = { ...profDB[profissionalIndex], ...profissionalNovo };
        escreve(profDB);
        res.json(profDB[profissionalIndex]);
    } else {
        res.status(404).send("Profissional não encontrado");
    }
});

/**
 * @swagger
 * /prof/{id}:
 *   delete:
 *     summary: Remove um profissional pelo ID
 *     tags: [Professionals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional a ser removido
 *     responses:
 *       200:
 *         description: Profissional removido com sucesso
 */
router.delete('/:id', (req, res) => {
    loadProfissionais();
    const id = req.params.id;
    const profissionalIndex = profDB.findIndex(profissional => profissional.id === id);

    if (profissionalIndex !== -1) {
        profDB.splice(profissionalIndex, 1);
        escreve(profDB);
        res.status(200).send('profissional removido com sucesso');
    } else {
        res.status(404).send("Profissional não encontrado");
    }
});

module.exports = router;
