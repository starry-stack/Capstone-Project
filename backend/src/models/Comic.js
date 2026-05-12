const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required!'],
    },
    owner: {
      type: String,
      required: [true, 'Owner is required!'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required!'],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comic', comicSchema);