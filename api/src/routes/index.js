const express = require('express');
const router = express.Router();
const agenda = require('./appointRoutes');
const prof = require('./professionalsRoutes');
const user = require('./userRoutes');
const { v4: uuidv4 } = require('uuid');


router.use(express.json());
router.use('/appoint', agenda );
router.use('/prof', prof);
router.use('/user', user);

module.exports = router;
