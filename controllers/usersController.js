const User = require('../models/user');
const bcrypt = require('bcrypt');
const Friendship = require('../models/friendship');
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
    // Excluye al usuario que realiza la petición utilizando su userId
    const users = await User.find({ _id: { $ne: req.user.userId } }).select('-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the users: ' + error.message });
  }
};

exports.getNonFriendUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Obtener las relaciones 'Accepted' y 'Requested' del usuario actual
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId },
        { receiver: currentUserId }
      ],
      status: { $in: ['Accepted', 'Requested'] }
    }).lean();

    // Separar los IDs de usuarios según el tipo de relación
    const excludedUserIds = [];
    const requestedUserDetails = new Map();

    friendships.forEach(friendship => {
      const otherUserId = friendship.requester.toString() === currentUserId
        ? friendship.receiver.toString()
        : friendship.requester.toString();
    
      if (friendship.status === 'Accepted') {
        excludedUserIds.push(otherUserId);
      } else if (friendship.status === 'Requested') {
        const role = friendship.requester.toString() === currentUserId ? 'Requester' : 'Receiver';
        requestedUserDetails.set(otherUserId, {
          status: 'Requested',
          role: role,
          friendshipId: friendship._id.toString()
        });
      }
    });

    // Añadir también el propio ID del usuario para no listar al usuario actual
    excludedUserIds.push(currentUserId);

    // Consultar a todos los usuarios excepto el actual y los que tienen amistad aceptada
    const users = await User.find({ _id: { $nin: excludedUserIds } }).select('-passwordHash');

    // Añadir el estado 'Requested' y el rol si corresponde
    const usersWithStatus = users.map(user => {
      const userIdStr = user._id.toString();
      const details = requestedUserDetails.get(userIdStr);
      return {
        ...user._doc,
        friendshipStatus: details ? details.status : 'None',
        friendshipRole: details ? details.role : 'None',
        friendshipId: details ? details.friendshipId : 'None'
      };
    });

    res.status(200).json(usersWithStatus);
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

exports.deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the user: ' + error.message });
  }
};

exports.updateUserByAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        // Buscar el usuario por ID y asegurarse de que existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Actualizar los campos permitidos
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        res.status(200).json({ message: 'Usuario actualizado con éxito.', user });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario.' });
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

exports.changePassword = async (req, res) => {
  try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.userId);
      
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
          return res.status(401).json({ message: 'La contraseña actual no es correcta.' });
      }
      
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = newHashedPassword;
      await user.save();
      
      res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
      res.status(500).json({ message: 'Error al cambiar la contraseña: ' + error.message });
  }
};

// Conseguir usuario por su correo
exports.getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email; // Accede al email proporcionado como parámetro de consulta
    const user = await User.findOne({ email: email }).select('_id name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

