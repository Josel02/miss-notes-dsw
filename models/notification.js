const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['friendRequestAccepted', 'friendRequest', 'noteShared', 'collectionShared'], required: true },
  data: Schema.Types.Mixed,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
