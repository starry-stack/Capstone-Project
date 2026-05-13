const express = require('express');
const router = express.Router();
const comicController = require('../controllers/comicController');
const authMiddleware = require('../middleware/authMiddleware');

router
  .route('/')
  .get(authMiddleware, comicController.getComics)
  .post(authMiddleware, comicController.createComic);

router.get('/:ownerUuid', authMiddleware, comicController.getComics);

module.exports = router;
