const express = require('express');
const router = express.Router();
const agenda = require('./appointRoutes');
const prof = require('./professionalsRoutes');
const user = require('./userRoutes');
const event = require('./eventsRoutes');
const teacher = require('./teachersRoutes');
const { v4: uuidv4 } = require('uuid');


router.use(express.json());
router.use('/appoint', agenda );
router.use('/prof', prof);
router.use('/user', user);
router.use('/event', event);
router.use('/teacher', teacher);

module.exports = router;
