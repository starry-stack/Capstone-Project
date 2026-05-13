const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const COMIC_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'comics');
const IMAGE_EXTENSIONS = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function parseImageDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') {
    return null;
  }

  const match = dataUrl.match(/^data:(image\/(?:gif|jpe?g|png|webp));base64,([\s\S]+)$/i);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const extension = IMAGE_EXTENSIONS[mimeType];
  if (!extension) {
    return null;
  }

  return {
    extension,
    buffer: Buffer.from(match[2].replace(/\s/g, ''), 'base64'),
  };
}

exports.uploadComicImages = async (req, res, next) => {
  try {
    const { imageDataUrls, images } = req.body;
    const rawImages = imageDataUrls || images;

    if (!Array.isArray(rawImages) || rawImages.length === 0) {
      const error = new Error('At least one image data URL is required');
      error.statusCode = 400;
      return next(error);
    }

    await fs.mkdir(COMIC_UPLOAD_DIR, { recursive: true });

    const urls = [];
    for (const rawImage of rawImages) {
      const dataUrl = typeof rawImage === 'string' ? rawImage : rawImage?.dataUrl;
      const image = parseImageDataUrl(dataUrl);

      if (!image || image.buffer.length === 0) {
        const error = new Error('Images must be valid base64 image data URLs');
        error.statusCode = 400;
        return next(error);
      }

      const filename = `${req.user.uuid}-${crypto.randomUUID()}.${image.extension}`;
      await fs.writeFile(path.join(COMIC_UPLOAD_DIR, filename), image.buffer);
      urls.push(`/uploads/comics/${filename}`);
    }

    res.status(201).json({
      success: true,
      data: { urls },
    });
  } catch (error) {
    next(error);
  }
};
