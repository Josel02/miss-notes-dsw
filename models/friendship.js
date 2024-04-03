const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Requested', 'Accepted', 'Denied', 'Revoked'], required: true },
  requestDate: { type: Date, default: Date.now },
  responseDate: Date,
  actionUser: { type: String, enum: ['Requester', 'Receiver'], required: true } //Es necesario en situaciones donde necesitamos un historial de acciones
});

module.exports = mongoose.model('Friendship', friendshipSchema);
