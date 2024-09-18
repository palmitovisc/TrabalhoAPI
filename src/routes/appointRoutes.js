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

router.get('/', (req, res) => {
    loadAlunos();
    try {
        res.json(appointDB);
    } catch (err) {
        console.error("Erro ao enviar dados.");
    }
});
router.get('/data/:data1?/:data2?', (req, res) => {
    
    loadAlunos();

    const datan1 = req.params.data1;
    const datan2 = req.params.data2;

    if (!datan1 || !datan2) {
        return res.status(400).send('Datas inseridas erradas');
    }

    const date1 = new Date(datan1); 
    const date2 = new Date(datan2);
    
    const dataFiltrada = appointDB.filter(item => {
        
        const itemDate = new Date(item.date); 
        return itemDate >= date1 && itemDate <= date2;
    });

    res.json(dataFiltrada);
});



router.post('/adicionar', (req,res) =>{
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


router.put('/:id', (req,res) =>{
    loadAlunos();
    const id = req.params.id;
    const appointNovo = req.body;
    const appointIndex = appointDB.findIndex(appoint => appoint.id === id);

    appointDB[appointIndex] = { ...appointDB[appointIndex], ...appointNovo };
    escreve(appointDB);
    res.json(appointDB[appointIndex]);
});


router.delete('/:id', (req,res) =>{
    loadAlunos();
    const id = req.params.id;
    const appointIndex = appointDB.findIndex(appoint => appoint.id === id);
    appointDB.splice(appointIndex, 1);
    escreve(appointDB);
    res.status(200).send('dados removidos com sucesso');
});
module.exports = router;
