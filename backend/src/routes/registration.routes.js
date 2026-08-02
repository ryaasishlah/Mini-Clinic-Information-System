const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus
} = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getRegistrations);
router.post('/', authorize(['ADMIN', 'RECEPTIONIST']), createRegistration);
router.put('/:id', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), updateRegistrationStatus);

module.exports = router;
