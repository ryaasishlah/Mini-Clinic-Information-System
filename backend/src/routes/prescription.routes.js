const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions
} = require('../controllers/prescription.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'DOCTOR']), createPrescription);
router.get('/:id', authorize(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), getPrescriptions);

module.exports = router;
