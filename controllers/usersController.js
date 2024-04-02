const User = require('../models/user');
const mongoose = require('mongoose');

exports.createUser = async (req, res) => {
  try {
    const newUser = new User({
      ...req.body,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user: ' + error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the users: ' + error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the user: ' + error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the user: ' + error.message });
  }
};


// Añadir aquí más operaciones según sea necesario, por ejemplo, para aceptar solicitudes de amistad, eliminar amigos, etc.
exports.addFriend = async (req, res) => {
  const { userId, friendId } = req.params;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Usuario que envía la solicitud
    const requesterUser = await User.findById(userId).session(session);
    // Usuario que recibe la solicitud
    const receiverUser = await User.findById(friendId).session(session);

    const alreadyRequested = requesterUser.friends.some(friend => friend.userId.toString() === friendId);
    const alreadyReceived = receiverUser.friends.some(friend => friend.userId.toString() === userId);

    if (!alreadyRequested && !alreadyReceived) {
      // Añade la solicitud al usuario que la envía
      requesterUser.friends.push({
        userId: friendId,
        status: 'Requested',
        requestDate: new Date(),
        actionUser: 'Requester'
      });

      // Añade la solicitud al usuario que la recibe
      receiverUser.friends.push({
        userId: userId,
        status: 'Requested',
        requestDate: new Date(),
        actionUser: 'Receiver'
      });

      await requesterUser.save({ session });
      await receiverUser.save({ session });

      await session.commitTransaction();
      res.status(200).json({ message: 'Friend request sent and received.' });
    } else {
      await session.abortTransaction();
      res.status(400).json({ message: 'Friend request already exists or friend already added.' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error managing friend request: ' + error.message });
  } finally {
    session.endSession();
  }
};

