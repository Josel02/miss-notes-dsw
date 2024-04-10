const Collection = require('../models/collection');
const Note = require('../models/note');

// Crear una nueva colección
exports.createCollection = async (req, res) => {
  try {
    const { name, notes } = req.body;
    const userId = req.user._id; // Asumiendo que tienes un middleware que añade el usuario al request
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

// Obtener todas las colecciones de un usuario
exports.getCollectionsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Asumiendo autenticación
    const collections = await Collection.find({ userId }).populate('notes');
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

// Obtener una colección por ID
exports.getCollectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const collection = await Collection.findById(id).populate('notes');
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
    const { collectionId, noteId } = req.params; // ID de la colección y de la nota desde los parámetros de la ruta
  
    try {
      // Buscar la colección por ID
      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
  
      // Verificar si la nota ya está en la colección
      const noteExists = collection.notes.some(note => note.equals(noteId));
      if (noteExists) {
        return res.status(400).json({ message: 'Note already exists in this collection' });
      }
  
      // Añadir la nota a la colección
      collection.notes.push(noteId);
      const updatedCollection = await collection.save();
  
      res.status(200).json(updatedCollection);
    } catch (error) {
      res.status(500).json({ message: 'Error adding note to collection: ' + error.message });
    }
  };

// Función para obtener todas las colecciones que contienen una nota específica
exports.getCollectionsContainingNote = async (req, res) => {
    const { noteId } = req.params; // Asumiendo que el ID de la nota viene como parámetro en la ruta
  
    try {
      const collectionsContainingNote = await Collection.find({ notes: noteId }).populate('notes');
      if (collectionsContainingNote.length > 0) {
        res.status(200).json(collectionsContainingNote);
      } else {
        res.status(404).json({ message: 'No collections found containing the specified note' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error finding collections: ' + error.message });
    }
  };

  