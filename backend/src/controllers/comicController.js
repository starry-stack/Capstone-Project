const crypto = require('crypto');
const Comic = require('../models/Comic');

exports.getComics = async (req, res, next) => {
  try {
    const ownerUuid = req.params.ownerUuid || req.user.uuid;
    const isOwnComics = ownerUuid === req.user.uuid;
    const query = isOwnComics
      ? { owner: ownerUuid }
      : { owner: ownerUuid, privacy: false };

    const comics = await Comic.find(query).select('+url -__v');

    res.status(200).json({
      success: true,
      data: comics,
    });
  } catch (error) {
    next(error);
  }
};

exports.createComic = async (req, res, next) => {
  try {
    const { imageUrl, url, name, description } = req.body;
    const comicUrl = imageUrl || url;

    if (!comicUrl || !name || !description) {
      const error = new Error('Image URL, name, and description are required');
      error.statusCode = 400;
      return next(error);
    }

    const comic = await Comic.create({
      name,
      uuid: crypto.randomUUID(),
      description,
      owner: req.user.uuid,
      url: comicUrl,
    });

    res.status(201).json({
      success: true,
      data: comic,
    });
  } catch (error) {
    next(error);
  }
};
