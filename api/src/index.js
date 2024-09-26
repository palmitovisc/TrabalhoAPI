const express = require('express');
const app = express();
const routes = require('./routes');
const { v4: uuidv4 } = require('uuid');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const cors = require("cors");
app.use(cors());
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "API Trabalho",
			version: "1.0.0",
			description: `API do trabalho de desenvolvimento de aplicações.  
            
            ### Trabalho 1    
            Disciplina: DAII 2024.02 Turma 01  
            Equipe: Rafael Martignago Palmito, Gabriel Flor, Élita Pereira, Bruno Souza, João Victor Lourenço.
			`,
      license: {
        name: 'Licenciado para DAII',
      },
      contact: {
        name: 'Rafael Martignago Palmito'
      },
		},
		servers: [
			{
				url: "http://localhost:3000/",
        description: 'Development server',
			},
		],
	},
	apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

app.use('/', routes)
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.listen(3000, function () { 
    console.log('Aplicação executando na porta http://127.0.0.1:3000/'); }); 
