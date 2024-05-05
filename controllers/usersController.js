const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

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
    // Selecciona todos los campos excepto el hash de la contraseña
    const users = await User.find().select('-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the users: ' + error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    // Obtener el ID del usuario del token decodificado
    const user = await User.findById(req.user.userId);
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
  try {
    // Actualizar el usuario autenticado utilizando el ID del token
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the user: ' + error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Eliminar el usuario autenticado utilizando el ID del token
    await User.findByIdAndDelete(req.user.userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the user: ' + error.message });
  }
};

exports.checkUserRole = (req, res) => {
  if (!req.user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  const isAdmin = req.user.role === 'Admin';
  res.status(200).json({ isAdmin });
};


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      passwordHash,
    });
    const savedUser = await newUser.save();
    const userForResponse = { ...savedUser._doc };
    delete userForResponse.passwordHash;
    res.status(201).json(userForResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error registering the user: ' + error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password incorrect' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password incorrect' });
    }
    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      role: user.role
    }, SECRET_KEY, { expiresIn: '1h' });
    res.json({
      token,
      userId: user._id,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in login: ' + error.message });
  }
};
