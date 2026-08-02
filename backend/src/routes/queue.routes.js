const express = require('express');
const router = express.Router();
const {
  getQueues,
  createQueue,
  callQueue,
  updateQueueStatus
} = require('../controllers/queue.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), getQueues);
router.post('/', authorize(['ADMIN', 'RECEPTIONIST']), createQueue);
router.put('/:id/call', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), callQueue);
router.put('/:id/status', authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), updateQueueStatus);

module.exports = router;
