const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Definir primero rutas específicas antes de rutas con parámetros

//Ruta para actualizar las colecciones de una nota
router.put('/:noteId/collections', verifyTokenAndRole(), notesController.updateNoteCollections);

//Ruta para obtener todas las notas de un usuario donde es el propietario
//router.get('/user', verifyTokenAndRole(), notesController.getNotesByUser);
router.get('/user', verifyTokenAndRole(), notesController.getMyNotes);

// Obtener una nota por su ID
//router.get('/:id', notesController.getNoteById);

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

// Obtener notas donde yo soy el propietario
//router.get('/my-notes', verifyTokenAndRole(), notesController.getMyNotes);

// Obtener notas compartidas conmigo
router.get('/shared-with-me', verifyTokenAndRole(), notesController.getSharedWithMeNotes);

// Compartir una nota con amigos
router.post('/share-note', verifyTokenAndRole(), notesController.shareNoteWithFriends);

// Quitarme de compartidos en la nota de un amigo
router.post('/unshare-note', verifyTokenAndRole(), notesController.unshareNote);

// Actualiza la lista de usuarios con los que se comparte una nota propietaria
router.put('/update-shared-users', verifyTokenAndRole(), notesController.updateSharedUsers);


module.exports = router;
