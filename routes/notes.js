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
router.get('/user', verifyTokenAndRole(), notesController.getNotesByUser);

module.exports = router;
