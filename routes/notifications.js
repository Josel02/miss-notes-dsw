const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Obtener todas las notificaciones del usuario
router.get('/', verifyTokenAndRole(), notificationsController.getAllNotifications);

// Eliminar una notificación específica por su ID
router.delete('/:id', verifyTokenAndRole(), notificationsController.deleteNotification);

// Obtener el conteo de notificaciones, total y no leídas
router.get('/count', verifyTokenAndRole(), notificationsController.getNotificationCount);

module.exports = router;
