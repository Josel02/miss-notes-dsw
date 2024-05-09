const Collection = require('../models/collection');
const Note = require('../models/note');
const User = require('../models/user');

// Crear una nueva colección
exports.createCollection = async (req, res) => {
  try {
    const { name, notes } = req.body;
    const userId = req.user.userId; // Asegurándose de que el userId coincide con el payload del JWT
    const newCollection = new Collection({
      name,
      userId,
      notes
    });
    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: 'Error creating collection: ' + error.message });
  }
};

// Obtener todas las colecciones de un usuario, incluyendo el contenido completo de las notas y los datos completos de los usuarios compartidos
exports.getCollectionsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const collections = await Collection.find({ userId })
      .populate({
        path: 'notes',
        populate: {
          path: 'userId sharedWith',
          select: '_id name email'  // Asegúrate de incluir '_id' aquí para obtener los IDs de los usuarios
        },
        select: 'title content userId sharedWith'
      });

    const modifiedCollections = collections.map(collection => {
      return {
        ...collection.toObject(),
        notes: collection.notes.map(note => ({
          ...note.toObject(),
          isEditable: note.userId.toString() === userId || note.sharedWith.some(user => user._id.toString() === userId),
          sharedWith: note.sharedWith.map(user => ({
            _id: user._id,  // Pasar el ID del usuario
            name: user.name,
            email: user.email
          }))
        }))
      };
    });

    res.status(200).json(modifiedCollections);
  } catch (error) {
    res.status(500).json({ message: 'Error getting collections: ' + error.message });
  }
};

// Obtener todas las colecciones compartidas con el usuario, excluyendo al propio usuario de la lista de compartidos y mostrando si puede editar las notas
exports.getSharedCollectionsWithMe = async (req, res) => {
  const userId = req.user.userId; // ID del usuario obtenido del token de autenticación

  try {
    const collections = await Collection.find({ sharedWith: userId })
      .populate({
        path: 'notes',
        populate: {
          path: 'userId sharedWith',
          select: 'name email' // Selecciona los datos del propietario y los compartidos
        },
        select: 'title content userId sharedWith'
      });

    const modifiedCollections = collections.map(collection => ({
      ...collection.toObject(),
      sharedWith: collection.sharedWith.filter(user => user._id.toString() !== userId), // Quita al usuario actual de la lista de compartidos
      notes: collection.notes.map(note => ({
        ...note.toObject(),
        isEditable: note.userId.toString() === userId || note.sharedWith.some(user => user._id.toString() === userId), // Determina si el usuario puede editar la nota
        sharedWith: note.sharedWith.filter(user => user._id.toString() !== userId) // Quita al usuario actual de la lista de compartidos en cada nota
      }))
    }));

    res.status(200).json(modifiedCollections);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shared collections: ' + error.message });
  }
};


// Actualizar el nombre de una colección, permitiendo al propietario y a usuarios específicamente compartidos modificar el nombre
exports.updateNameCollection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name } = req.body;  // Solo se permite actualizar el nombre

  try {
    const collection = await Collection.findById(id).populate('sharedWith');
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Comprobar si el usuario es el propietario o está en la lista de compartidos de la colección
    const isSharedUser = collection.sharedWith.some(user => user._id.toString() === userId);
    const isOwner = collection.userId.toString() === userId;

    if (isOwner || isSharedUser) {
      // Permitir que propietarios y usuarios compartidos actualicen el nombre
      collection.name = name;
      await collection.save();
      res.status(200).json(collection);
    } else {
      // Si no es propietario ni usuario compartido, no se permite ninguna actualización
      return res.status(403).json({ message: 'You are not authorized to update this collection' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating the collection: ' + error.message });
  }
};

// Actualizar completamente una colección, solo accesible por el propietario, con verificaciones para las notas
exports.updateFullCollection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { name, notesIds, sharedWith } = req.body; // Recibir los IDs de las notas que se desean actualizar

  try {
    const collection = await Collection.findById(id).populate({
      path: 'notes',
      populate: { path: 'userId sharedWith' }
    });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Comprobar si el usuario es el propietario
    if (collection.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to fully update this collection' });
    }

    // Actualizar el nombre y los usuarios compartidos de la colección
    collection.name = name ?? collection.name;
    collection.sharedWith = sharedWith ?? collection.sharedWith;

    // Actualizar las notas solo si el usuario es propietario o está compartido en ellas
    if (notesIds && notesIds.length > 0) {
      const updatedNotes = [];
      for (let noteId of notesIds) {
        const note = collection.notes.find(n => n._id.toString() === noteId);
        if (note && (note.userId.toString() === userId || note.sharedWith.some(u => u._id.toString() === userId))) {
          updatedNotes.push(note); // Aquí podrías aplicar actualizaciones específicas si es necesario
        } else {
          return res.status(403).json({ message: 'Not authorized to update one or more specified notes' });
        }
      }
      // Suponiendo que actualizas las notas de alguna manera específica
      // Por ejemplo, si quisieras cambiar algo específico en las notas, lo harías aquí
      collection.notes = updatedNotes;
    }

    await collection.save();
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating the collection: ' + error.message });
  }
};




// Eliminar una colección, sólo si el usuario es propietario
exports.deleteCollection = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const collection = await Collection.findOne({ _id: id, userId: userId });
    if (!collection) {
      return res.status(403).json({ message: 'You are not authorized to delete this collection' });
    }
    await Collection.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the collection: ' + error.message });
  }
};

// Obtener una colección por ID, mostrando el contenido completo de las notas y los detalles de los usuarios compartidos
/*
exports.getCollectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const collection = await Collection.findById(id)
      .populate({
        path: 'notes',
        populate: [{ 
          path: 'userId', 
          select: 'name email'  // Obtener el nombre y el email del propietario de la nota
        }, {
          path: 'sharedWith',
          select: 'name email'  // Obtener los nombres y emails de los usuarios compartidos
        }],
        select: 'title content userId sharedWith' // Incluir el contenido completo y los IDs de usuarios compartidos
      });
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ message: 'Collection not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/
// Actualizar la lista de notas de una colección, asegurando permisos adecuados para añadir notas y proporcionando errores específicos de permisos
// Se pueden añadir notas propias o compartidas si eres el propietario o un usuario compartido
// Puedes quitar las notas de otros usuarios, además de las tuyas. 
exports.updateNoteListInCollection = async (req, res) => {
  const { id } = req.params; // ID de la colección
  const { noteIds } = req.body; // IDs de las notas para actualizar la colección
  const userId = req.user.userId; // ID del usuario de la solicitud

  try {
    const collection = await Collection.findById(id).populate('sharedWith');
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Comprobar si el usuario es el propietario o está en la lista de compartidos de la colección
    const isOwner = collection.userId.toString() === userId;
    const isSharedUser = collection.sharedWith.some(user => user._id.toString() === userId);

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ message: 'You are not authorized to update the note list in this collection. You need to be the owner or a shared user.' });
    }

    // Obtener notas existentes para validar permisos
    const notes = await Note.find({ _id: { $in: noteIds } });

    // Añadir nuevas notas a la colección
    const notesToAdd = [];
    notes.forEach(note => {
      if (note.userId.toString() === userId || note.sharedWith.some(sharedUser => sharedUser.toString() === userId)) {
        notesToAdd.push(note._id);
      } else {
        return res.status(403).json({ message: `You do not have permission to add note with ID ${note._id} to the collection.` });
      }
    });

    // Quitar notas de la colección (sin verificar permisos de propiedad)
    const existingNoteIds = collection.notes.map(note => note.toString());
    const notesToRemove = existingNoteIds.filter(noteId => !noteIds.includes(noteId));

    // Actualizar la lista de notas en la colección
    collection.notes = existingNoteIds
      .filter(noteId => !notesToRemove.includes(noteId)) // Eliminar notas
      .concat(notesToAdd.filter(noteId => !existingNoteIds.includes(noteId.toString()))); // Añadir notas nuevas

    await collection.save();
    res.status(200).json({ message: 'Note list updated successfully', collection });
  } catch (error) {
    res.status(500).json({ message: 'Error updating the note list in the collection: ' + error.message });
  }
};



// Función para obtener todas las colecciones que contienen una nota específica, mostrando el contenido completo de las notas
exports.getCollectionsContainingNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    const collectionsContainingNote = await Collection.find({ notes: noteId })
      .populate({
        path: 'notes',
        select: 'title content userId' // Ajustar para incluir campos específicos
      });
    if (collectionsContainingNote.length > 0) {
      res.status(200).json(collectionsContainingNote);
    } else {
      res.status(404).json({ message: 'No collections found containing the specified note' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error finding collections: ' + error.message });
  }
};

exports.addNotesToCollectionByAdmin = async (req, res) => {
  const { collectionId } = req.params;
  const { noteIds, userId } = req.body; // ID del usuario se pasa en el cuerpo

  try {
    // Verificar que la colección exista y pertenezca al usuario correcto
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or does not belong to the specified user' });
    }

    // Verificar que las notas existan
    const notes = await Note.find({ _id: { $in: noteIds } });
    if (notes.length !== noteIds.length) {
      return res.status(404).json({ message: 'One or more notes not found' });
    }

    // Preparar conjuntos de IDs para comparación
    const currentNoteIdsSet = new Set(collection.notes.map(note => note.toString()));
    const newNoteIdsSet = new Set(noteIds);

    // Filtrar para encontrar notas que no estén en la nueva lista y deben ser eliminadas
    const notesToRemove = Array.from(currentNoteIdsSet).filter(id => !newNoteIdsSet.has(id));

    // Filtrar para encontrar nuevas notas que no estén en la colección actual
    const notesToAdd = Array.from(newNoteIdsSet).filter(id => !currentNoteIdsSet.has(id));

    // Actualizar la colección de notas
    if (notesToRemove.length > 0) {
      collection.notes = collection.notes.filter(note => !notesToRemove.includes(note.toString()));
    }
    if (notesToAdd.length > 0) {
      collection.notes.push(...notesToAdd);
    }

    const updatedCollection = await collection.save();
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating the collection with new notes: ' + error.message });
  }
};

exports.deleteCollectionByAdmin = async (req, res) => {
  const { id } = req.params; // ID de la colección a eliminar
  const userId = req.body.userId; // Este ID debe ser enviado desde el frontend

  try {
    // Verificar que el usuario existe
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar y verificar que la colección pertenece al usuario antes de eliminarla
    const collection = await Collection.findOne({ _id: id, userId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or does not belong to the specified user' });
    }

    // Eliminar la colección
    await Collection.findByIdAndDelete(id);
    res.status(204).send(); // Envía una respuesta vacía para indicar el éxito
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the collection: ' + error.message });
  }
};

exports.createCollectionByAdmin = async (req, res) => {
  try {
    const { name, userId } = req.body; // Asume que 'userId' es proporcionado en el cuerpo

    // Verificar que el usuario exista
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Crear una nueva colección para el usuario especificado
    const newCollection = new Collection({
      name,
      userId
    });
    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: 'Error creating collection: ' + error.message });
  }
};

exports.updateCollectionByAdmin = async (req, res) => {
  const { id } = req.params; // ID de la colección a actualizar
  const { userId, ...updateData } = req.body; // Extrae userId y los datos de actualización del body

  try {
    // Verificar que el usuario existe
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Buscar la colección por ID y verificar que pertenezca al usuario
    const collection = await Collection.findOne({ _id: id, userId });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found or does not belong to the specified user' });
    }

    // Actualizar la colección
    const updatedCollection = await Collection.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating the collection: ' + error.message });
  }
};

// Función para ajustar la lista de notas de una colección
/*
exports.addNotesToCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { noteIds } = req.body;  // Un arreglo de IDs de notas

  try {
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Convertir ambas listas de notas a conjuntos para facilitar comparaciones
    const currentNoteIdsSet = new Set(collection.notes.map(note => note.toString()));
    const newNoteIdsSet = new Set(noteIds);

    // Filtrar para encontrar notas que no estén en la nueva lista y deben ser eliminadas
    const notesToRemove = Array.from(currentNoteIdsSet).filter(id => !newNoteIdsSet.has(id));

    // Filtrar para encontrar nuevas notas que no estén en la colección actual
    const notesToAdd = Array.from(newNoteIdsSet).filter(id => !currentNoteIdsSet.has(id));

    // Si hay notas para eliminar, quitarlas
    if (notesToRemove.length > 0) {
      collection.notes = collection.notes.filter(note => !notesToRemove.includes(note.toString()));
    }

    // Si hay notas nuevas para añadir, añadirlas
    if (notesToAdd.length > 0) {
      collection.notes.push(...notesToAdd);
    }

    // Guardar los cambios en la base de datos
    const updatedCollection = await collection.save();
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating the collection with new notes: ' + error.message });
  }
};
*/

exports.getCollectionsByAdmin = async (req, res) => {
  try {
    const userId = req.query.userId;
    // Verificar si el usuario existe antes de intentar obtener sus colecciones
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const collections = await Collection.find({ userId }).populate({
      path: 'notes',
      select: 'title content userId' // Ajustar para incluir campos específicos
    });
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error getting collections: ' + error.message });
  }
};

// Quitar el propio usuario de los compartidos de una colección
exports.unshareCollection = async (req, res) => {
  const { collectionId } = req.body;
  const userId = req.user.userId;

  try {
    const collection = await Collection.findById(collectionId);
    if (!collection || !collection.sharedWith.includes(userId)) {
      return res.status(404).json({ message: 'Collection not found or not shared with you.' });
    }

    collection.sharedWith = collection.sharedWith.filter(id => id.toString() !== userId);
    await collection.save();
    res.status(200).json({ message: 'Collection unshared successfully.', collection });
  } catch (error) {
    res.status(500).json({ message: 'Error unsharing the collection: ' + error.message });
  }
};

// Compartir una colección con amigos
exports.shareCollectionWithFriends = async (req, res) => {
  const { collectionId, friendIds } = req.body;
  const userId = req.user.userId;

  try {
    const collection = await Collection.findById(collectionId);
    if (!collection || collection.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Only the collection owner can share the collection.' });
    }

    const friends = await Friendship.find({
      $or: [
        { requester: userId, receiver: { $in: friendIds }, status: 'Accepted' },
        { requester: { $in: friendIds }, receiver: userId, status: 'Accepted' }
      ]
    });

    if (friends.length !== friendIds.length) {
      return res.status(404).json({ message: 'One or more users are not friends.' });
    }

    collection.sharedWith = friendIds;
    await collection.save();
    res.status(200).json({ message: 'Collection shared successfully.', collection });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing the collection: ' + error.message });
  }
};
