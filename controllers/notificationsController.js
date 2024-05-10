const Notification = require('../models/notification');
const User = require('../models/user');

// Obtener todas las notificaciones del usuario
exports.getAllNotifications = async (req, res) => {
    try {
        // Obtener el ID del usuario desde el token
        const userId = req.user.userId;

        // Encontrar todas las notificaciones no leídas del usuario
        const notifications = await Notification.find({ userId: userId, read: false })
            .populate({
                path: 'data.friendId',
                select: 'name email'
            })
            .sort({ date: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications: ' + error.message });
    }
};

// Marcar una notificación como leída
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Asegurarse que la notificación pertenece al usuario
        const notification = await Notification.findOne({ _id: id, userId: userId });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or access denied.' });
        }

        notification.read = true;
        await notification.save();
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read: ' + error.message });
    }
};

// Eliminar una notificación por ID
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Asegurarse que la notificación pertenece al usuario
        const notification = await Notification.findOne({ _id: id, userId: userId });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or access denied.' });
        }

        await notification.remove();
        res.status(200).json({ message: 'Notification deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification: ' + error.message });
    }
};

// Obtener el número total de notificaciones y el número de notificaciones sin leer
exports.getNotificationCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Contar todas las notificaciones
        const total = await Notification.countDocuments({ userId: userId });

        // Contar solo las no leídas
        const unread = await Notification.countDocuments({ userId: userId, read: false });

        res.status(200).json({ total, unread });
    } catch (error) {
        res.status(500).json({ message: 'Error getting notification count: ' + error.message });
    }
};
