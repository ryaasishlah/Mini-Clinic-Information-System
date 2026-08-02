const express = require('express');
const router = express.Router();
const { 
  getPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient 
} = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All patient routes require authentication
router.use(authenticate);

// Admin and Receptionist can do all, Doctor can maybe just view
router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getPatients);
router.get('/:id', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getPatientById);
router.post('/', authorize(['ADMIN', 'RECEPTIONIST']), createPatient);
router.put('/:id', authorize(['ADMIN', 'RECEPTIONIST']), updatePatient);
router.delete('/:id', authorize(['ADMIN']), deletePatient); // Only admin can delete

module.exports = router;
