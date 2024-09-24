const express = require('express');
const router = express.Router();
const agenda = require('./appointRoutes');
const prof = require('./professionalsRoutes');
const { v4: uuidv4 } = require('uuid');


router.use(express.json());
router.use('/appoint', agenda );
router.use('/prof', prof);

module.exports = router;
