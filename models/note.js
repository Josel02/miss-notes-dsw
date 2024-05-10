const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const isDataRequired = function() {
  return true; // Ahora siempre se requiere 'data', independientemente del tipo.
};

const validateCheckedList = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every(item =>
    'text' in item && typeof item.text === 'string' &&
    'checked' in item && typeof item.checked === 'boolean'
  );
};

const contentSchema = new Schema({
  type: { type: String, enum: ['text', 'list', 'checked list', 'image'], required: true },
  data: [{
    type: Schema.Types.Mixed,
    required: isDataRequired,
    validate: {
      validator: function(value) {
        if (this.type === 'checked list') {
          return validateCheckedList(value);
        }
        if (this.type === 'image') {
          return typeof value === 'string' && value.trim().length > 0;
        }
        return true;
      },
      message: 'Invalid data for content type.'
    }
  }]
});

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: [contentSchema],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Lista de IDs de usuarios con acceso a la nota
});

module.exports = model('Note', noteSchema);
