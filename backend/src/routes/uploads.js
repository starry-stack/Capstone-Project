const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/comic-images', authMiddleware, uploadController.uploadComicImages);

module.exports = router;
