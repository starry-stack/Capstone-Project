const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      trim: true,
    },
    uuid: {
      type: String,
      required: true
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
      type: Array,
      required: [true, 'URL is required!'],
      select: false,
    },
    caption: {
      type: Array
    },
    dialogue: {
      type: Array
    },
    privacy: { // false = public, true = private
      type: Boolean,
      default: false 
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comic', comicSchema);