const Friendship = require('../models/friendship');

// Enviar una solicitud de amistad
exports.sendFriendRequest = async (req, res) => {
    const { receiverId } = req.body;  // El ID del receptor viene del cuerpo de la solicitud
    const requesterId = req.user.userId;  // El ID del solicitante viene del token
    try {
        const existingRequest = await Friendship.findOne({
            $or: [
                { requester: requesterId, receiver: receiverId },
                { requester: receiverId, receiver: requesterId }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists.' });
        }

        const newFriendship = new Friendship({
            requester: requesterId,
            receiver: receiverId,
            status: 'Requested',
            actionUser: 'Requester'
        });
        await newFriendship.save();
        res.status(201).json({ message: 'Friend request sent.', friendshipId: newFriendship._id });
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request: ' + error.message });
    }
};

// Aceptar una solicitud de amistad
exports.acceptFriendRequest = async (req, res) => {
    const { friendshipId } = req.params; // ID del documento de la amistad
    try {
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship || friendship.receiver.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Friend request not found or access denied.' });
        }
        friendship.status = 'Accepted';
        friendship.responseDate = new Date();
        friendship.actionUser = 'Receiver';
        await friendship.save();
        res.status(200).json({ message: 'Friend request accepted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting friend request: ' + error.message });
    }
};

// Rechazar una solicitud de amistad
exports.rejectFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    try {
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship || friendship.receiver.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Friend request not found or access denied.' });
        }
        friendship.status = 'Denied';
        friendship.responseDate = new Date();
        friendship.actionUser = 'Receiver';
        await friendship.save();
        res.status(200).json({ message: 'Friend request rejected.' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting friend request: ' + error.message });
    }
};

// Listar todas las amistades de un usuario
exports.listFriends = async (req, res) => {
    const userId = req.user.userId; // Usuario extraído del token
    try {
        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { receiver: userId }],
            status: 'Accepted'
        }).populate('requester', 'name email')
          .populate('receiver', 'name email');

        const friends = friendships.map(friendship => {
            return friendship.requester._id.toString() === userId ?
                { _id: friendship.receiver._id, name: friendship.receiver.name, email: friendship.receiver.email } :
                { _id: friendship.requester._id, name: friendship.requester.name, email: friendship.requester.email };
        });

        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error listing friends: ' + error.message });
    }
};

// Listar solicitudes de amistad pendientes (que ha recibido y no ha respondido)
exports.listPendingRequests = async (req, res) => {
    const userId = req.user.userId; // Usuario extraído del token
    try {
        const pendingRequests = await Friendship.find({
            receiver: userId,
            status: 'Requested'
        }).populate('requester', 'name email');
        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error listing pending friend requests: ' + error.message });
    }
};