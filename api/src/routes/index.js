const express = require('express');
const router = express.Router();
const agenda = require('./appointRoutes');
const { v4: uuidv4 } = require('uuid');


router.use(express.json());
router.use('/appoint', agenda );

module.exports = router;
