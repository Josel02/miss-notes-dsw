var express = require('express');
var router = express.Router();
const userController = require('../controllers/usersController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Crear un nuevo usuario
router.post('/', userController.createUser);

// Eliminar un usuario - Eliminar al usuario autenticado
router.delete('/me', verifyTokenAndRole(), userController.deleteUser);

// Actualizar un usuario por ID - Solo para Admins
router.put('/:id', verifyTokenAndRole("Admin"), userController.updateUserByAdmin);

// Eliminar un usuario por ID - Solo para Admins
router.delete('/:id', verifyTokenAndRole("Admin"), userController.deleteUserByAdmin);

// Obtener todos los usuarios
router.get('/', verifyTokenAndRole("Admin"), userController.getAllUsers);

// Obtener un usuario por ID - Este ID es el del usuario autenticado
router.get('/me', verifyTokenAndRole(), userController.getUserById);

// Actualizar un usuario - Actualizar al usuario autenticado
router.put('/me', verifyTokenAndRole(), userController.updateUser);

// Verificar rol de usuario
router.get('/check-role', verifyTokenAndRole(), userController.checkUserRole);

// Registrar un nuevo usuario
router.post('/register', userController.registerUser);

// Iniciar sesión
router.post('/login', userController.loginUser);

// Cambiar contraseña del usuario autenticado
router.post('/me/change-password', verifyTokenAndRole(), userController.changePassword);


module.exports = router;
