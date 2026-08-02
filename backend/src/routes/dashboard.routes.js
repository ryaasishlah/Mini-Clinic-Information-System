const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

// All authenticated users can view dashboard (or restrict if needed)
router.get('/stats', getDashboardStats);

module.exports = router;
