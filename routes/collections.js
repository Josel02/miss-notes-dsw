const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Rutas administrativas para operaciones globales en colecciones
router.get('/admin/collections', verifyTokenAndRole("Admin"), collectionsController.getCollectionsByAdmin); // Obtener todas las colecciones de todos los usuarios
router.post('/admin/collections', verifyTokenAndRole("Admin"), collectionsController.createCollectionByAdmin); // Crear una nueva colección para cualquier usuario
router.put('/admin/collections/:id', verifyTokenAndRole("Admin"), collectionsController.updateCollectionByAdmin); // Editar cualquier colección de cualquier usuario
router.delete('/admin/collections/:id', verifyTokenAndRole("Admin"), collectionsController.deleteCollectionByAdmin); // Borrar cualquier colección de cualquier usuario
router.put('/admin/collections/:id/notes/add', verifyTokenAndRole("Admin"), collectionsController.addNotesToCollectionByAdmin); // Añadir múltiples notas a una colección para cualquier usuario

// Rutas básicas para operaciones CRUD en colecciones
router.post('/', verifyTokenAndRole(), collectionsController.createCollection); // Crear una nueva colección
router.get('/', verifyTokenAndRole(), collectionsController.getCollectionsByUser); // Obtener todas las colecciones de un usuario
router.get('/shared', verifyTokenAndRole(), collectionsController.getSharedCollectionsWithMe); // Obtener colecciones compartidas con el usuario
router.delete('/:id', verifyTokenAndRole(), collectionsController.deleteCollection); // Eliminar una colección, solo si el usuario es propietario

// Rutas para actualizaciones específicas en colecciones
router.patch('/update-name/:id', verifyTokenAndRole(), collectionsController.updateNameCollection); // Actualizar solo el nombre de una colección
router.put('/update-full/:id', verifyTokenAndRole(), collectionsController.updateFullCollection); // Actualizar completamente una colección, solo accesible por el propietario
router.patch('/update-notes/:id', verifyTokenAndRole(), collectionsController.updateNoteListInCollection); // Actualizar la lista de notas de una colección

// Rutas para compartir y descompartir colecciones
router.post('/share', verifyTokenAndRole(), collectionsController.shareCollectionWithFriends); // Compartir una colección con amigos
router.patch('/unshare/', verifyTokenAndRole(), collectionsController.unshareCollection); // Quitar el propio usuario de los compartidos de una colección

// Rutas de utilidad para trabajar con notas dentro de colecciones
router.get('/note/:noteId/collections', verifyTokenAndRole(), collectionsController.getCollectionsContainingNote); // Obtener todas las colecciones que contienen una nota específica

module.exports = router;
