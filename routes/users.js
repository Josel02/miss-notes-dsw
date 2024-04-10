var express = require('express');
var router = express.Router();
const userController = require('../controllers/usersController'); // Ajusta la ruta según donde tengas tu controlador


// Crear un nuevo usuario
router.post('/', userController.createUser);

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById);

// Actualizar un usuario
router.put('/:id', userController.updateUser);

// Eliminar un usuario
router.delete('/:id', userController.deleteUser);

// Registrar un nuevo usuario
router.post('/register', userController.registerUser);

// Iniciar sesión
router.post('/login', userController.loginUser);

module.exports = router;



