const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Modificación para hacer 'data' requerido para todos los tipos, incluyendo imágenes.
const isDataRequired = function() {
  return true;  // Ahora siempre se requiere 'data', independientemente del tipo.
};

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
    required: isDataRequired,  // Data ahora es siempre requerido.
    validate: {
      validator: function(value) {
        if (this.type === 'checked list') {
          return validateCheckedList(value);
        }
        if (this.type === 'image') {
          // Verifica que el valor sea una cadena no vacía para imágenes.
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
});

module.exports = model('Note', noteSchema);
