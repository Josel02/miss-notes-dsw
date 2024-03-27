const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

module.exports = mongoose.model('Collection', collectionSchema);
