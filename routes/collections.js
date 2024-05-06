const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController'); // Ajusta la ruta según donde tengas tu controlador
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Obtener todas las colecciones de un usuario - Solo para Admins
router.get('/admin-get', verifyTokenAndRole("Admin"), collectionsController.getCollectionsByAdmin);

// Editar la colección de un usuario - Solo para Admins
router.put('/admin-update/:id', verifyTokenAndRole("Admin"), collectionsController.updateCollectionByAdmin);

// Borrar la colección de un usuario - Solo para Admins
router.delete('/admin-delete/:id', verifyTokenAndRole("Admin"), collectionsController.deleteCollectionByAdmin);

// Crear una nueva colección para un usuario - Solo para Admins
router.post('/admin-add', verifyTokenAndRole("Admin"), collectionsController.createCollectionByAdmin);

// Ruta para añadir múltiples notas a una colección - Solo para Admins
router.put('/:collectionId/notes/admin-add', verifyTokenAndRole("Admin"), collectionsController.addNotesToCollectionByAdmin);

// Ruta para añadir múltiples notas a una colección
router.put('/:collectionId/notes/add', verifyTokenAndRole(), collectionsController.addNotesToCollection);

// Añadir una nota a una colección
router.put('/:collectionId/note/:noteId', verifyTokenAndRole(), collectionsController.addNoteToCollection);

// Crear una nueva colección
router.post('/', verifyTokenAndRole(), collectionsController.createCollection);

// Obtener todas las colecciones de un usuario
router.get('/', verifyTokenAndRole(), collectionsController.getCollectionsByUser);

// Obtener una colección por ID
router.get('/:id', verifyTokenAndRole(), collectionsController.getCollectionById);

// Actualizar una colección
router.put('/:id', verifyTokenAndRole(), collectionsController.updateCollection);

// Eliminar una colección
router.delete('/:id', verifyTokenAndRole(), collectionsController.deleteCollection);

// Ruta para obtener colecciones que contienen una nota específica
router.get('/note/:noteId/collections', verifyTokenAndRole(), collectionsController.getCollectionsContainingNote);

module.exports = router;
