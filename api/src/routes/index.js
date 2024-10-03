const express = require('express');
const router = express.Router();
const agenda = require('./appointRoutes');
const prof = require('./professionalsRoutes');
const user = require('./usersRoutes');
const event = require('./eventsRoutes');
const teacher = require('./teachersRoutes');
const student = require('./studentsRoutes');
const { v4: uuidv4 } = require('uuid');


router.use(express.json());
router.use('/appoint', agenda );
router.use('/prof', prof);
router.use('/user', user);
router.use('/event', event);
router.use('/teacher', teacher);
router.use('/student', student);

module.exports = router;
