const mongoose = require('mongoose');
const Note = require('./note');
const Collection = require('./collection');
const Friendship = require('./friendship');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' }
});

// Eliminar todas las notas, colecciones y friendships asociadas a un usuario antes de eliminarlo
userSchema.pre('findOneAndDelete', async function(next) {
  const docToDelete = await this.model.findOne(this.getFilter());
  if (docToDelete) {
    await Note.deleteMany({ userId: docToDelete._id });
    await Collection.deleteMany({ userId: docToDelete._id });
    // Eliminar todas las friendships donde el usuario es requester o receiver
    await Friendship.deleteMany({
      $or: [
        { requester: docToDelete._id },
        { receiver: docToDelete._id }
      ]
    });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
