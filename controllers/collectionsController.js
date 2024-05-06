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

// Obtener todas las colecciones de un usuario, incluyendo el contenido completo de las notas
exports.getCollectionsByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const collections = await Collection.find({ userId })
      .populate({
        path: 'notes',
        select: 'title content userId', // Ajustar para incluir campos específicos
      });
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error getting collections: ' + error.message });
  }
};

// Actualizar una colección
exports.updateCollection = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCollection = await Collection.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the collection: ' + error.message });
  }
};

// Eliminar una colección
exports.deleteCollection = async (req, res) => {
  const { id } = req.params;
  try {
    await Collection.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the collection: ' + error.message });
  }
};

// Obtener una colección por ID, mostrando el contenido completo de las notas
exports.getCollectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const collection = await Collection.findById(id)
      .populate({
        path: 'notes',
        select: 'title content userId' // Asegurándose de incluir el contenido completo
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

// Añadir una nota a una colección existente
exports.addNoteToCollection = async (req, res) => {
  const { collectionId, noteId } = req.params;
  try {
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const noteExists = collection.notes.some(note => note.equals(noteId));
    if (noteExists) {
      return res.status(400).json({ message: 'Note already exists in this collection' });
    }
    collection.notes.push(noteId);
    const updatedCollection = await collection.save();
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note to collection: ' + error.message });
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

// Función para ajustar la lista de notas de una colección
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
