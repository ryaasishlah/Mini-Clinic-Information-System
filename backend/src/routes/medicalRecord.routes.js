const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecordsByPatient
} = require('../controllers/medicalRecord.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'DOCTOR']), createMedicalRecord);
router.get('/:patientId', authorize(['ADMIN', 'DOCTOR', 'RECEPTIONIST']), getMedicalRecordsByPatient);

module.exports = router;
