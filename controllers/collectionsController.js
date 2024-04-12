const Collection = require('../models/collection');
const Note = require('../models/note');

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
