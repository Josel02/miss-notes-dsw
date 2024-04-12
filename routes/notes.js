const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Obtener todas las notas
router.get('/', notesController.getAllNotes);

// Obtener una nota por su ID
router.get('/:id', notesController.getNoteById);

// Crear una nueva nota
router.post('/', notesController.createNote);

// Actualizar una nota existente
router.put('/:id', notesController.updateNote);

// Eliminar una nota
router.delete('/:id', notesController.deleteNote);

// Obtener todas las notas de un usuario
// Si esperas recibir un userId en la ruta, debería ser algo así:
router.get('/users/:userId', verifyTokenAndRole(), (req, res, next) => {
    console.log("Middleware passed, userId:", req.params.userId);
    notesController.getNotesByUser(req, res, next);
});

// Si la intención era hacer que 'userssss' fuera un nombre de ruta estático, asegúrate de que el controlador maneje esto correctamente


module.exports = router;
