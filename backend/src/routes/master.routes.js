const express = require('express');
const router = express.Router();
const { getPolyclinics, getDoctors } = require('../controllers/master.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/polyclinics', getPolyclinics);
router.get('/doctors', getDoctors);

module.exports = router;
