const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  friends: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Requested', 'Accepted', 'Denied', 'Revoked'] },
    requestDate: Date,
    responseDate: Date,
    actionUser: { type: String, enum: ['Requester', 'Receiver'] } // Nuevo campo agregado
  }]
});

module.exports = mongoose.model('User', userSchema);
