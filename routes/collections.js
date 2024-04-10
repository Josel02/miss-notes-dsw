const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController'); // Ajusta la ruta según donde tengas tu controlador

// Crear una nueva colección
router.post('/', collectionsController.createCollection);

// Obtener todas las colecciones de un usuario
router.get('/', collectionsController.getCollectionsByUser);

// Obtener una colección por ID
router.get('/:id', collectionsController.getCollectionById);

// Actualizar una colección
router.put('/:id', collectionsController.updateCollection);

// Eliminar una colección
router.delete('/:id', collectionsController.deleteCollection);

// Añadir una nota a una colección
router.put('/:collectionId/note/:noteId', collectionsController.addNoteToCollection);

// Ruta para obtener colecciones que contienen una nota específica
router.get('/note/:noteId/collections', collectionsController.getCollectionsContainingNote);

module.exports = router;
