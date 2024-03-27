const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// Utilizamos una función para determinar si 'data' es requerido, para no repetirla.
const isDataRequired = function() { return this.type !== 'image'; };

// Validador para 'checked list' como función para mejorar la legibilidad.
const validateCheckedList = (value) => {
  if (!Array.isArray(value)) return false; // Debe ser un arreglo
  return value.every(item =>
    'text' in item && typeof item.text === 'string' &&
    'checked' in item && typeof item.checked === 'boolean'
  );
};

const contentSchema = new Schema({
  type: { type: String, enum: ['text', 'list', 'checked list', 'image'], required: true },
  data: [{
    type: Schema.Types.Mixed,
    required: isDataRequired, // Simplificación del requerimiento condicional
    validate: {
      validator: function(value) {
        if (this.type === 'checked list') {
          return validateCheckedList(value);
        }
        return true;
      },
      message: 'Invalid data for checked list.'
    }
  }],
  imageId: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    required: function() { return this.type === 'image'; }, // Condición simplificada
  }
}, { _id: false });

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: [contentSchema],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = model('Note', noteSchema);
