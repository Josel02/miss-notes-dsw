var express = require('express');
var router = express.Router();
const userController = require('../controllers/usersController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Crear un nuevo usuario
router.post('/', userController.createUser);

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID - Este ID es el del usuario autenticado
router.get('/me', verifyTokenAndRole(), userController.getUserById);

// Actualizar un usuario - Actualizar al usuario autenticado
router.put('/me', verifyTokenAndRole(), userController.updateUser);

// Eliminar un usuario - Eliminar al usuario autenticado
router.delete('/me', verifyTokenAndRole(), userController.deleteUser);

// Registrar un nuevo usuario
router.post('/register', userController.registerUser);

// Iniciar sesión
router.post('/login', userController.loginUser);

module.exports = router;
