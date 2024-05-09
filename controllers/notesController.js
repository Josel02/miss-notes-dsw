const Note = require('../models/note');
const Collection = require('../models/collection');
const User = require('../models/user');
const Friendship = require('../models/friendship');

exports.createNote = async (req, res) => {
  try {
    const newNote = new Note({
      ...req.body,
      userId: req.user.userId
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note: ' + error.message });
  }
};


exports.getAllNotes = async (req, res) => {
  try {
    const userId = req.query.userId;
    // Primero verifica si el usuario existe
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Si el usuario existe, busca sus notas
    const notes = await Note.find({ userId: userId });

    // Devuelve las notas encontradas
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the notes: ' + error.message });
  }
};


// Función para borrar las notas de un usuario por un administrador
exports.deleteNoteByAdmin = async (req, res) => {
  try {
    const noteId = req.params.id;
    // Intenta encontrar y borrar la nota por su ID
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Devuelve una confirmación de que la nota fue borrada
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the note: ' + error.message });
  }
};

exports.createNoteByAdmin = async (req, res) => {
  try {
    const { userId, ...noteData } = req.body; // Extraer userId y los datos de la nota del body

    // Primero verifica si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newNote = new Note({
      ...noteData,
      userId: userId // Usar el userId proporcionado en el body
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note: ' + error.message });
  }
};

exports.updateNoteByAdmin = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.body.userId; // Este es el ID del usuario proporcionado en el body

    // Verificar primero que la nota existe y pertenece al usuario especificado
    const note = await Note.findOne({ _id: noteId, userId: userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or user does not own this note' });
    }

    // Si la nota existe y pertenece al usuario, actualiza la nota
    const updatedNote = await Note.findByIdAndUpdate(noteId, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the note: ' + error.message });
  }
};

// Actualizar una nota epor el propietario o por el compartido
exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.userId;
    const updateData = req.body;

    // Buscar la nota para verificar si el usuario actual es el propietario o está en la lista de compartidos
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verificar si el usuario es el propietario o un usuario compartido autorizado
    if (note.userId.toString() !== userId && !note.sharedWith.includes(userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this note' });
    }

    // Actualizar la nota
    const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, { new: true }).populate('userId', 'name email').populate('sharedWith', 'name email');
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the note: ' + error.message });
  }
};

/*
exports.getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Note no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/

// Solo se puede borrar una nota por el propietario
exports.deleteNote = async (req, res) => {
  try {
    // Verificar primero que la nota pertenece al usuario antes de eliminarla
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or user does not have permission to delete this note' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the note: ' + error.message });
  }
};

/*
exports.getNotesByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({ userId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notes: ' + error.message });
  }
};
*/

// Actualizar las colecciones de una nota
// Solo se pueden actualizar las colecciones si todos los usuarios de la nota están en cada colección
exports.updateNoteCollections = async (req, res) => {
  const { noteId } = req.params;
  const { collections } = req.body; // Array de IDs de colecciones

  try {
    // Buscar la nota por ID
    const note = await Note.findById(noteId).populate('userId').populate('sharedWith');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verificar las colecciones destinadas a la actualización
    const collectionsToUpdate = await Collection.find({
      _id: { $in: collections }
    }).populate('userId').populate('sharedWith');

    // Crear un conjunto de IDs válidos (propietario y usuarios compartidos) de la nota
    const noteUserIds = new Set([note.userId._id.toString(), ...note.sharedWith.map(u => u._id.toString())]);

    // Comprobar que todas las colecciones son válidas para actualizar (todos los usuarios de la nota deben estar en cada colección)
    for (let collection of collectionsToUpdate) {
      const collectionUserIds = new Set([collection.userId._id.toString(), ...collection.sharedWith.map(u => u._id.toString())]);

      // Si algún ID de los usuarios de la nota no está en los usuarios de la colección, se rechaza la actualización
      if (![...noteUserIds].every(id => collectionUserIds.has(id))) {
        return res.status(403).json({ message: `Collection ${collection._id} contains users not in the note's user list.` });
      }
    }

    // Si todas las colecciones son válidas, proceder a actualizar
    // Primero remover la nota de todas las colecciones donde ya no debe estar
    await Collection.updateMany(
      { notes: { $in: [noteId] } },
      { $pull: { notes: noteId } }
    );

    // Luego agregar la nota a las nuevas colecciones
    await Collection.updateMany(
      { _id: { $in: collections } },
      { $addToSet: { notes: noteId } }
    );

    res.status(200).json({ message: 'Collections updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating collections: ' + error.message });
  }
};

// Obtener notas donde yo soy el propietario
exports.getMyNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({ userId: userId }).populate({
      path: 'sharedWith',
      select: 'name email -_id'
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notes: ' + error.message });
  }
};

// Obtener notas compartidas conmigo
exports.getSharedWithMeNotes = async (req, res) => {
  try {
    // Obtener el ID del usuario que hace la petición
    const userId = req.user.userId;

    // Buscar las notas donde el usuario está en 'sharedWith' pero no es el propietario
    const notes = await Note.find({
      sharedWith: { $in: [userId] },
      userId: { $ne: userId }
    }).populate('userId', 'name email _id') // Popula el campo userId para obtener nombre y email del propietario
      .populate('sharedWith', 'name email _id'); // Popula el campo sharedWith para obtener nombre y email de los usuarios compartidos

    // Filtrar el array de sharedWith para excluir al usuario que hace la petición
    const modifiedNotes = notes.map(note => {
      const sharedWithFiltered = note.sharedWith.filter(user => user._id.toString() !== userId);
      return {
        _id: note._id,
        title: note.title,
        content: note.content,
        owner: {
          _id: note.userId._id,
          name: note.userId.name,
          email: note.userId.email
        },
        sharedWith: sharedWithFiltered.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email
        }))
      };
    });

    // Devolver las notas modificadas
    res.json(modifiedNotes);
  } catch (error) {
    console.error('Error getting shared notes:', error);
    res.status(500).send('Error al obtener las notas compartidas');
  }
}
    



// Compartir notas con varios amigos
exports.shareNoteWithFriends = async (req, res) => {
  const { noteId, friendIds } = req.body;  // ID de la nota y IDs de los amigos con quienes compartir
  const userId = req.user.userId;  // ID del usuario dueño de la nota
  try {
    // Verificar que la nota pertenece al usuario que hace la solicitud
    const note = await Note.findOne({ _id: noteId, userId: userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or you do not own this note.' });
    }

    // Verificar que todos los receptores son amigos confirmados
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, receiver: { $in: friendIds } },
        { requester: { $in: friendIds }, receiver: userId }
      ],
      status: 'Accepted'
    });

    // Filtrar IDs de amigos confirmados
    const confirmedFriendIds = friendships.map(f => 
      f.requester.toString() === userId ? f.receiver.toString() : f.requester.toString()
    );

    // Actualizar la lista de compartidos con la lista de amigos confirmados
    note.sharedWith = confirmedFriendIds;

    await note.save();

    res.status(200).json({ message: 'Note shared successfully with all confirmed friends.', note });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing note: ' + error.message });
  }
};


// Método para quitarme de la lista de compartidos de una nota
exports.unshareNote = async (req, res) => {
  const { noteId } = req.body;  // ID de la nota
  const userId = req.user.userId;  // ID del usuario que desea dejar de compartir la nota

  try {
    // Verificar que la nota existe y que está compartida con el usuario
    const note = await Note.findById(noteId);
    if (!note || !note.sharedWith.includes(userId)) {
      return res.status(404).json({ message: 'Note not found or not shared with you.' });
    }

    // Eliminar al usuario de la lista de compartidos
    note.sharedWith = note.sharedWith.filter(id => id.toString() !== userId);
    await note.save();

    res.status(200).json({ message: 'Note unshared successfully.', note });
  } catch (error) {
    res.status(500).json({ message: 'Error unsharing note: ' + error.message });
  }
};

// Método para actualizar la lista de usuarios con los que he compartido una nota
exports.updateSharedUsers = async (req, res) => {
  const { noteId, userIds } = req.body;  // ID de la nota y lista de IDs de usuarios a compartir
  const ownerId = req.user.userId;  // ID del propietario de la nota

  try {
    // Verificar que la nota pertenece al usuario que hace la solicitud
    const note = await Note.findOne({ _id: noteId, userId: ownerId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or you do not own this note.' });
    }

    // Verificar que todos los usuarios en la lista son amigos confirmados
    const friendships = await Friendship.find({
      $or: [
        { requester: ownerId, receiver: { $in: userIds } },
        { requester: { $in: userIds }, receiver: ownerId }
      ],
      status: 'Accepted'
    });

    // Crear un conjunto de IDs de amigos confirmados
    const confirmedFriendIds = new Set(friendships.map(f => f.requester.toString() === ownerId ? f.receiver.toString() : f.requester.toString()));

    // Verificar que todos los IDs proporcionados están en el conjunto de amigos confirmados
    const allFriends = userIds.every(id => confirmedFriendIds.has(id));
    if (!allFriends) {
      return res.status(403).json({ message: 'One or more users are not your confirmed friends.' });
    }

    // Actualizar la lista de compartidos en la nota
    note.sharedWith = userIds;
    await note.save();

    res.status(200).json({ message: 'Shared users updated successfully.', note });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shared users: ' + error.message });
  }
};




