const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, usersController.getAllUsers);
router.get('/:id', authMiddleware, usersController.getUserById);

module.exports = router;