const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  contentType: String, // Para guardar el tipo de archivo, por ejemplo 'image/jpeg' o 'image/png'
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
