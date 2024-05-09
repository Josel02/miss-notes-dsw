const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ID del usuario destinatario de la notificación
  text: { type: String, required: true }, // Texto descriptivo de la notificación
  read: { type: Boolean, default: false }, // Indicador de si la notificación ha sido leída
  type: {
    type: String,
    enum: ['friendRequestAccepted', 'friendRequest', 'noteShared', 'collectionShared'],
    required: true
  },
  data: {
    friendId: { type: Schema.Types.ObjectId, ref: 'User' }, // ID del usuario amigo implicado
    friendshipId: { type: Schema.Types.ObjectId, ref: 'Friendship' }, // ID de la amistad, cuando sea relevante
    noteId: { type: Schema.Types.ObjectId, ref: 'Note' }, // ID de la nota compartida
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' } // ID de la colección compartida
  },
  date: { type: Date, default: Date.now } // Fecha y hora de la creación de la notificación
});

// Validador personalizado según el tipo de notificación
notificationSchema.pre('validate', function(next) {
  const data = this.data;
  switch (this.type) {
    case 'friendRequestAccepted':
      if (!data.friendId) {
        this.invalidate('data.friendId', 'Must include friendId for friend request accepted notifications.');
      }
      break;
    case 'friendRequest':
      if (!data.friendId || !data.friendshipId) {
        this.invalidate('data', 'Must include friendId and friendshipId for friend request notifications.');
      }
      break;
    case 'noteShared':
      if (!data.friendId || !data.noteId) {
        this.invalidate('data', 'Must include friendId and noteId for note shared notifications.');
      }
      break;
    case 'collectionShared':
      if (!data.friendId || !data.collectionId) {
        this.invalidate('data', 'Must include friendId and collectionId for collection shared notifications.');
      }
      break;
    default:
      this.invalidate('type', 'Invalid notification type');
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
