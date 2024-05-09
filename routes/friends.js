const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const verifyTokenAndRole = require('../middleware/authMiddleware'); // Asegúrate de importar tu middleware de autenticación

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

// Aceptar una solicitud de amistad - Solo para Admins
router.patch('/adminAcceptFriendRequest/:friendshipId', verifyTokenAndRole("Admin"), friendsController.adminAcceptFriendRequest);

// Rechazar una solicitud de amistad - Solo para Admins
router.patch('/adminRejectFriendRequest/:friendshipId', verifyTokenAndRole("Admin"), friendsController.adminRejectFriendRequest);

// Eliminar una amistad - Solo para Admins
router.delete('/adminDeleteFriendship/:friendshipId', verifyTokenAndRole("Admin"), friendsController.adminDeleteFriendship);

// Revocar una solicitud de amistad - Solo para Admins
router.delete('/adminRevokeFriendRequest/:friendshipId', verifyTokenAndRole("Admin"), friendsController.adminRevokeFriendRequest);

// Listar todas las amistades del usuario autenticado
router.get('/listFriends', verifyTokenAndRole(), friendsController.listFriends);

// Listar solicitudes de amistad pendientes recibidas por el usuario autenticado
router.get('/listPendingRequests', verifyTokenAndRole(), friendsController.listPendingRequests);

// Listar solicitudes de amistad pendientes enviadas por el usuario autenticado
router.get('/listFriendshipsRequested', verifyTokenAndRole(), friendsController.listFriendshipsRequested);

// Listar todas las amistades de un usario por ID - Solo para Admins
router.get('/listFriends/:userId', verifyTokenAndRole("Admin"), friendsController.listFriendsByUserId);

// Listar solicitudes de amistad pendientes recibidas por un usuario por ID - Solo para Admins
router.get('/listPendingRequests/:userId', verifyTokenAndRole("Admin"), friendsController.listPendingRequestsByUserId);

// Listar solicitudes de amistad pendientes enviadas por un usuario por ID - Solo para Admins
router.get('/listFriendshipsRequested/:userId', verifyTokenAndRole("Admin"), friendsController.listFriendshipsRequestedByUserId);

module.exports = router;