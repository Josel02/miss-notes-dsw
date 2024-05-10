const Friendship = require('../models/friendship');
const User = require('../models/user');
const Notification = require('../models/notification');

// Enviar una solicitud de amistad
exports.sendFriendRequest = async (req, res) => {
    const { receiverId } = req.body;  // El ID del receptor viene del cuerpo de la solicitud
    const requesterId = req.user.userId;  // El ID del solicitante viene del token

    try {
        const requester = await User.findById(requesterId);
        const receiver = await User.findById(receiverId);
        const existingRequest = await Friendship.findOne({
            $or: [
                { requester: requesterId, receiver: receiverId },
                { requester: receiverId, receiver: requesterId }
            ]
        });

        // Permitir reenviar la solicitud si fue previamente denegada o revocada
        if (existingRequest && (existingRequest.status === 'Accepted' || existingRequest.status === 'Requested')) {
            return res.status(400).json({ message: `Friend request already exists with status: ${existingRequest.status}.` });
        } else if (existingRequest && (existingRequest.status === 'Denied' || existingRequest.status === 'Revoked')) {
            // Actualiza la solicitud existente para reenviarla
            existingRequest.status = 'Requested';
            existingRequest.requestDate = new Date();
            existingRequest.actionUser = 'Requester';
            await existingRequest.save();

            // Crear notificación para el usuario receptor sobre el reenvío de la solicitud
            const notification = new Notification({
                userId: receiverId,
                text: `${requester.name} has re-sent you a friend request!`,
                type: 'friendRequest',
                data: {
                    friendId: requesterId,
                    friendshipId: existingRequest._id  // Agregar el ID de la amistad aquí
                }
            });
            await notification.save();

            return res.status(200).json({ message: 'Friend request re-sent.', friendshipId: existingRequest._id });
        }

        // Crear una nueva solicitud si no existe ninguna previa
        if (!existingRequest) {
            const newFriendship = new Friendship({
                requester: requesterId,
                receiver: receiverId,
                status: 'Requested',
                actionUser: 'Requester'
            });
            await newFriendship.save();

            // Crear notificación para el usuario receptor
            const notification = new Notification({
                userId: receiverId,
                text: `${requester.name} has sent you a friend request!`,
                type: 'friendRequest',
                data: {
                    friendId: requesterId,
                    friendshipId: newFriendship._id  // Agregar el ID de la amistad aquí
                }
            });
            await notification.save();

            return res.status(201).json({ message: 'Friend request sent.', friendshipId: newFriendship._id });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request: ' + error.message });
    }
};

// Aceptar una solicitud de amistad
exports.acceptFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    try {
        const friendship = await Friendship.findById(friendshipId).populate('requester');
        if (!friendship || friendship.receiver.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Friend request not found or access denied.' });
        }
        if (friendship.status !== 'Requested') {
            return res.status(400).json({ message: 'Friend request cannot be accepted as it is not in Requested status.' });
        }
        friendship.status = 'Accepted';
        friendship.responseDate = new Date();
        friendship.actionUser = 'Receiver';
        await friendship.save();

        const receiver = await User.findById(req.user.userId);

        // Crear notificación para el usuario que envió la solicitud
        const notification = new Notification({
            userId: friendship.requester._id,
            text: `${receiver.name} has accepted your friend request!`,
            type: 'friendRequestAccepted',
            data: { friendId: req.user.userId }
        });
        await notification.save();

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
      // Nos aseguramos de que la solicitud de amistad sólo se pueda rechazar si su estado actual es "Requested".
      if (friendship.status !== 'Requested') {
          return res.status(400).json({ message: 'Friend request cannot be rejected as it is not in Requested status.' });
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

exports.listFriendshipsRequestedByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        const pendingRequests = await Friendship.find({
            requester: userId,
            status: 'Requested'
        }).populate('receiver', 'name email');
        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error listing pending friend requests: ' + error.message });
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
            return {
                _id: friendship._id ,
                userId: friendship.requester._id.toString() === userId ? 
                        friendship.receiver._id.toString() : 
                        friendship.requester._id.toString(),
                name: friendship.requester._id.toString() === userId ?
                      friendship.receiver.name :
                      friendship.requester.name,
                email: friendship.requester._id.toString() === userId ?
                       friendship.receiver.email :
                       friendship.requester.email,
            };
        });

        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error listing friends: ' + error.message });
    }
};

exports.listFriendsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { receiver: userId }],
            status: 'Accepted'
        }).populate('requester', 'name email')
          .populate('receiver', 'name email');

        const friends = friendships.map(friendship => {
            return {
                _id: friendship._id ,
                userId: friendship.requester._id.toString() === userId ? 
                        friendship.receiver._id.toString() : 
                        friendship.requester._id.toString(),
                name: friendship.requester._id.toString() === userId ?
                      friendship.receiver.name :
                      friendship.requester.name,
                email: friendship.requester._id.toString() === userId ?
                       friendship.receiver.email :
                       friendship.requester.email,
            };
        });

        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error listing friends: ' + error.message });
    }
};

exports.adminRejectFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;  // Recibe el userId del cuerpo de la petición
  
    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship || friendship.receiver.toString() !== userId) {
            return res.status(404).json({ message: 'Friend request not found or access denied.' });
        }
        // Nos aseguramos de que la solicitud de amistad sólo se pueda rechazar si su estado actual es "Requested".
        if (friendship.status !== 'Requested') {
            return res.status(400).json({ message: 'Friend request cannot be rejected as it is not in Requested status.' });
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

exports.adminRevokeFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;  // Recibe el userId del cuerpo de la petición
  
    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        const friendship = await Friendship.findById(friendshipId);
        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found.' });
        }
        // Verifica que el usuario que intenta revocar la solicitud es el solicitante
        // y que la solicitud está en estado "Requested"
        if (friendship.requester.toString() !== userId || friendship.status !== 'Requested') {
            return res.status(404).json({ message: 'Friend request cannot be revoked. It may have already been processed or you are not the requester.' });
        }
        await Friendship.deleteOne({ _id: friendship._id });
        res.status(200).json({ message: 'Friend request successfully revoked.' });
    } catch (error) {
        res.status(500).json({ message: 'Error revoking friend request: ' + error.message });
    }
};

// Eliminar una amistad existente
exports.adminDeleteFriendship = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    try {
        const friendship = await Friendship.findById(friendshipId);
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!friendship) {
            return res.status(404).json({ message: 'Amistad no encontrada.' });
        }
        if (friendship.status !== 'Accepted') {
            return res.status(403).json({ message: 'Solo se pueden eliminar amistades que estén en estado aceptado.' });
        }
        if (friendship.requester.toString() !== userId && friendship.receiver.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta amistad.' });
        }
        await Friendship.deleteOne({ _id: friendship._id });
        res.status(200).json({ message: 'Amistad eliminada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la amistad: ' + error.message });
    }
};

// Aceptar una solicitud de amistad
exports.adminAcceptFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;
    const { userId } = req.body;

    try {
        const friendship = await Friendship.findById(friendshipId);
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!friendship || friendship.receiver.toString() !== userId) {
            return res.status(404).json({ message: 'Friend request not found or access denied.' });
        }
        //Nos aseguramos de que la solicitud de amistad sólo se pueda aceptar si su estado actual es "Requested".
        if (friendship.status !== 'Requested') {
            return res.status(400).json({ message: 'Friend request cannot be accepted as it is not in Requested status.' });
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

// Revocar una solicitud de amistad (por parte de quien la hizo)
exports.revokeFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  try {
      const friendship = await Friendship.findById(friendshipId);
      if (!friendship) {
          return res.status(404).json({ message: 'Friend request not found.' });
      }
      // Verifica que el usuario que intenta revocar la solicitud es el solicitante
      // y que la solicitud está en estado "Requested"
      if (friendship.requester.toString() !== req.user.userId || friendship.status !== 'Requested') {
          return res.status(404).json({ message: 'Friend request cannot be revoked. It may have already been processed or you are not the requester.' });
      }
      await Friendship.deleteOne({ _id: friendship._id });
      res.status(200).json({ message: 'Friend request successfully revoked.' });
  } catch (error) {
      res.status(500).json({ message: 'Error revoking friend request: ' + error.message });
  }
};

// Eliminar una amistad existente
exports.deleteFriendship = async (req, res) => {
  const { friendshipId } = req.params;
  try {
      const friendship = await Friendship.findById(friendshipId);
      if (!friendship) {
          return res.status(404).json({ message: 'Amistad no encontrada.' });
      }
      if (friendship.status !== 'Accepted') {
          return res.status(403).json({ message: 'Solo se pueden eliminar amistades que estén en estado aceptado.' });
      }
      if (friendship.requester.toString() !== req.user.userId && friendship.receiver.toString() !== req.user.userId) {
          return res.status(403).json({ message: 'No tienes permiso para eliminar esta amistad.' });
      }
      await Friendship.deleteOne({ _id: friendship._id });
      res.status(200).json({ message: 'Amistad eliminada correctamente.' });
  } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la amistad: ' + error.message });
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

// Listar solicitudes de amistad pendientes (que ha recibido y no ha respondido)
exports.listPendingRequestsByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
          return res.status(404).json({ message: 'User not found' });
        }
        const pendingRequests = await Friendship.find({
            receiver: userId,
            status: 'Requested'
        }).populate('requester', 'name email');
        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error listing pending friend requests: ' + error.message });
    }
};

// Listar solicitudes de amistad pendientes (que ha enviado y no tienen respuesta)
exports.listFriendshipsRequested = async (req, res) => {
    const userId = req.user.userId; // Usuario extraído del token
    try {
        const pendingRequests = await Friendship.find({
            requester: userId,
            status: 'Requested'
        }).populate('receiver', 'name email');
        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error listing pending friend requests: ' + error.message });
    }
};