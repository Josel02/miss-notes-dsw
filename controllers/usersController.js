const User = require('../models/user');

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

// Operaciones específicas para la gestión de amigos
exports.addFriend = async (req, res) => {
  const { userId, friendId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user.friends.some(friend => friend.userId.toString() === friendId)) {
      user.friends.push({ userId: friendId, status: 'Requested', requestDate: new Date() });
      await user.save();
      res.status(200).json({ message: 'Friend request sent.' });
    } else {
      res.status(400).json({ message: 'Friend request already exists or friend already added.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend: ' + error.message });
  }
};

// Añadir aquí más operaciones según sea necesario, por ejemplo, para aceptar solicitudes de amistad, eliminar amigos, etc.
