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
    apis: ['professionalsRoutes.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Professional:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - specialty
 *         - contact
 *         - phone_number
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: ID gerado automaticamente para o profissional
 *         name:
 *           type: string
 *           description: Nome do profissional
 *         specialty:
 *           type: string
 *           description: Especialidade do profissional
 *         contact:
 *           type: string
 *           description: Informações de contato do profissional
 *         phone_number:
 *           type: string
 *           description: Número de telefone do profissional
 *         status:
 *           type: string
 *           description: |
 *             Status do profissional (ex.: ativo, inativo)
 *       example:
 *         id: "4bae2b2c-4e71-4e12-be4c-eb185c2756fa"
 *         name: "João Silva"
 *         specialty: "Desenvolvedor"
 *         contact: "joao.silva@example.com"
 *         phone_number: "(11) 98765-4321"
 *         status: "ativo"
 */

/**
 * @swagger
 * tags:
 *   name: Professionals
 *   description: "API de controle de profissionais | Desenvolvido por: **Élita Pereira dos Santos**"
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
    res.json(profDB);
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
 *       400:
 *         description: Campos obrigatórios ausentes
 */
router.post('/adicionar', (req, res) => {
    loadProfissionais();
    const profissional = req.body;

    const requiredFields = ['name', 'specialty', 'contact', 'phone_number', 'status'];
    const missingFields = requiredFields.filter(field => !profissional[field]);
    
    if (missingFields.length) {
        return res.status(400).json({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` });
    }

    const id = uuidv4();
    const profissionalComId = { id, ...profissional };
    profDB.push(profissionalComId);
    escreve(profDB);
    res.status(201).json(profissionalComId);
});

/**
 * @swagger
 * /prof/{id}:
 *   get:
 *     summary: Retorna um profissional pelo ID
 *     tags: [Professionals]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Profissional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Professional'
 *       404:
 *         description: Profissional não encontrado
 */
router.get('/:id', (req, res) => {
    loadProfissionais();
    const profissional = profDB.find(prof => prof.id === req.params.id);

    if (profissional) {
        res.json(profissional);
    } else {
        res.status(404).send("Profissional não encontrado");
    }
});

/**
 * @swagger
 * /prof/nome/{nome}:
 *   get:
 *     summary: Retorna profissionais pelo nome
 *     tags: [Professionals]
 *     parameters:
 *       - in: path
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome do profissional
 *     responses:
 *       200:
 *         description: Profissionais encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Professional'
 *       404:
 *         description: Nenhum profissional encontrado
 */
router.get('/nome/:nome', (req, res) => {
    loadProfissionais();
    const nome = req.params.nome.toLowerCase();
    const profissionais = profDB.filter(prof => prof.name.toLowerCase().includes(nome));

    if (profissionais.length > 0) {
        res.json(profissionais);
    } else {
        res.status(404).send("Nenhum profissional encontrado");
    }
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               contact:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Professional'
 *       404:
 *         description: Profissional não encontrado
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
 *       404:
 *         description: Profissional não encontrado
 */
router.delete('/:id', (req, res) => {
    loadProfissionais();
    const id = req.params.id;
    const profissionalIndex = profDB.findIndex(profissional => profissional.id === id);

    if (profissionalIndex !== -1) {
        profDB.splice(profissionalIndex, 1);
        escreve(profDB);
        res.status(200).send('Profissional removido com sucesso');
    } else {
        res.status(404).send("Profissional não encontrado");
    }
});

module.exports = router;
