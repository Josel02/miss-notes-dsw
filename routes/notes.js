const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Definir primero rutas específicas antes de rutas con parámetros

//Ruta para actualizar las colecciones de una nota
router.put('/:noteId/collections', verifyTokenAndRole(), notesController.updateNoteCollections);

//Ruta para obtener todas las notas de un usuario
router.get('/user', verifyTokenAndRole(), notesController.getNotesByUser);

// Obtener una nota por su ID
router.get('/:id', notesController.getNoteById);

// Crear una nueva nota para el usuario autenticado
router.post('/', verifyTokenAndRole(), notesController.createNote);

// Actualizar una nota existente que pertenece al usuario autenticado
router.put('/:id', verifyTokenAndRole(), notesController.updateNote);

// Eliminar una nota que pertenece al usuario autenticado
router.delete('/:id', verifyTokenAndRole(), notesController.deleteNote);

// Obtener todas las notas (general)
router.get('/', notesController.getAllNotes);

module.exports = router;
