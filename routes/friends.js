const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const verifyTokenAndRole = require('../middleware/authMiddleware'); // Importa tu middleware de autenticación

// Enviar una solicitud de amistad
router.post('/sendFriendRequest', verifyTokenAndRole(), friendsController.sendFriendRequest);

// Aceptar una solicitud de amistad
router.patch('/acceptFriendRequest/:friendshipId', verifyTokenAndRole(), friendsController.acceptFriendRequest);

// Rechazar una solicitud de amistad
router.patch('/rejectFriendRequest/:friendshipId', verifyTokenAndRole(), friendsController.rejectFriendRequest);

// Revocar una solicitud de amistad
router.delete('/revokeFriendRequest/:friendshipId', verifyTokenAndRole(), friendsController.revokeFriendRequest);

// Eliminar una amistad
router.delete('/deleteFriendship/:friendshipId', verifyTokenAndRole(), friendsController.deleteFriendship);

// Listar todas las amistades del usuario autenticado
router.get('/listFriends', verifyTokenAndRole(), friendsController.listFriends);

// Listar solicitudes de amistad pendientes del usuario autenticado
router.get('/listPendingRequests', verifyTokenAndRole(), friendsController.listPendingRequests);

module.exports = router;
