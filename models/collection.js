const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const collectionSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Lista de IDs de usuarios con acceso a la colección
});

module.exports = model('Collection', collectionSchema);
