const mongoose = require('mongoose');
const Note = require('./note');
const Collection = require('./collection');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' }
});

// Eliminar todas las notas y colecciones asociadas a un usuario antes de eliminarlo
userSchema.pre('findOneAndDelete', async function(next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    await Note.deleteMany({ userId: docToDelete._id });
    await Collection.deleteMany({ userId: docToDelete._id });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
