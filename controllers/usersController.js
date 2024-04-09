const User = require('../models/user');
//const mongoose = require('mongoose');
const Friendship = require('../models/friendship');
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

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear y guardar el nuevo usuario
    const newUser = new User({
      name,
      email,
      passwordHash, // Guardar el hash en lugar de la contraseña plana
    });
    const savedUser = await newUser.save();

    // Omitir la devolución del hash de la contraseña en la respuesta
    const userForResponse = { ...savedUser._doc };
    delete userForResponse.passwordHash;

    res.status(201).json(userForResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error registrando el usuario: ' + error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // Generar JWT
    const token = jwt.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role // Se incluye el rol en el token 
    }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ 
      token, userId: user._id, 
      email: user.email,
      role: user.role // Esto permite al frontend saber si el usuario es administrador o no
     });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login: ' + error.message });
  }
};









