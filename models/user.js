const mongoose = require('mongoose');
const Note = require('./note');
const Collection = require('./collection');
const Friendship = require('./friendship');
const Notification = require('./notification');

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
    // Borrado de las notas asociadas al usuario
    await Note.deleteMany({ userId: docToDelete._id });

    // Borrado de las colecciones asociadas al usuario
    await Collection.deleteMany({ userId: docToDelete._id });

    // Borrado de las amistades donde el usuario es requester o receiver
    await Friendship.deleteMany({
      $or: [
        { requester: docToDelete._id },
        { receiver: docToDelete._id }
      ]
    });

    // Borrado de las notificaciones donde el usuario es el destinatario o el amigo implicado
    await Notification.deleteMany({
      $or: [
        { userId: docToDelete._id }, // El usuario es el destinatario de la notificación
        { "data.friendId": docToDelete._id } // El usuario está implicado como amigo en la notificación
      ]
    });
  }
  next();
});


module.exports = mongoose.model('User', userSchema);
