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
    const { imageUrl, imageUrls, url, captions, caption, name, description } = req.body;
    const rawComicUrls = imageUrls || url || imageUrl;
    const comicUrls = Array.isArray(rawComicUrls)
      ? rawComicUrls.filter(Boolean)
      : rawComicUrls
        ? [rawComicUrls]
        : [];
    const rawCaptions = captions || caption || [];
    const comicCaptions = Array.isArray(rawCaptions)
      ? rawCaptions.filter(Boolean)
      : rawCaptions
        ? [rawCaptions]
        : [];

    if (comicUrls.length === 0 || !name || !description) {
      const error = new Error('Image URLs, name, and description are required');
      error.statusCode = 400;
      return next(error);
    }

    if (comicUrls.some(url => typeof url !== 'string' || url.startsWith('data:'))) {
      const error = new Error('Images must be uploaded before creating a comic');
      error.statusCode = 400;
      return next(error);
    }

    const comic = await Comic.create({
      name,
      uuid: crypto.randomUUID(),
      description,
      owner: req.user.uuid,
      url: comicUrls,
      caption: comicCaptions,
    });

    res.status(201).json({
      success: true,
      data: comic,
    });
  } catch (error) {
    next(error);
  }
};
