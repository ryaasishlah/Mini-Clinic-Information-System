const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/login', login);
router.post('/logout', authenticate, logout);

module.exports = router;
