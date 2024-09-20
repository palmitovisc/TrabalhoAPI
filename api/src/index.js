const express = require('express')
const app = express()
const routes = require('./routes')
const { v4: uuidv4 } = require('uuid')

app.use(function(req, res, next){ //
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
   }); //

app.use('/', routes)

app.listen(3000, function () { 
    console.log('Aplicação executando na porta http://127.0.0.1:3000/'); }); 
