const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const verifyTokenAndRole = require('../middleware/authMiddleware');

// Obtener todas las notificaciones no leidas del usuario
router.get('/', verifyTokenAndRole(), notificationsController.getAllNotifications);

// Eliminar una notificación específica por su ID
router.delete('/:id', verifyTokenAndRole(), notificationsController.deleteNotification);

// Obtener el conteo de notificaciones, total y no leídas
router.get('/count', verifyTokenAndRole(), notificationsController.getNotificationCount);

// Marcar una notificación como leída
router.put('/:id/read', verifyTokenAndRole(), notificationsController.markAsRead);

module.exports = router;
