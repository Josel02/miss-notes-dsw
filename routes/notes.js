const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Definir primero rutas específicas antes de rutas con parámetros

//Ruta para actualizar las colecciones de una nota
router.put('/:noteId/collections', verifyTokenAndRole(), notesController.updateNoteCollections);

//Ruta para obtener todas las notas de un usuario
router.get('/user', verifyTokenAndRole(), notesController.getNotesByUser);

// Crear una nueva nota para el usuario autenticado
router.post('/', verifyTokenAndRole(), notesController.createNote);

// Actualizar una nota existente que pertenece al usuario autenticado
router.put('/:id', verifyTokenAndRole(), notesController.updateNote);

// Eliminar una nota que pertenece al usuario autenticado
router.delete('/:id', verifyTokenAndRole(), notesController.deleteNote);

// Obtener todas las notas de un usuario - Solo para Admins
router.get('/', verifyTokenAndRole("Admin"), notesController.getAllNotes);

// Borrar la nota de un usuario - Solo para Admins
router.delete('/admin-delete/:id', verifyTokenAndRole("Admin"), notesController.deleteNoteByAdmin);

// Añadir una nota a un usuario - Solo para Admins
router.post('/admin-add', verifyTokenAndRole("Admin"), notesController.createNoteByAdmin);

// Editar una nota a un usuario - Solo para Admins
router.put('/admin-update/:id', verifyTokenAndRole("Admin"), notesController.updateNoteByAdmin);

module.exports = router;
