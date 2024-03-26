const mongoose = require('mongoose');

// Define note content schema
const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'list', 'image'],
    required: true,
  },
  data: mongoose.Schema.Types.Mixed,
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
});

// Define note schema
const noteSchema = new mongoose.Schema({
  title: String,
  content: [contentSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
});

module.exports = mongoose.model('Note', noteSchema);