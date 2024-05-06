const Note = require('../models/note');
const Collection = require('../models/collection');
const User = require('../models/user');

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

exports.updateNote = async (req, res) => {
  try {
    // Verificar primero que la nota pertenece al usuario antes de actualizarla
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or user does not have permission to update this note' });
    }
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the note: ' + error.message });
  }
};

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

exports.getNotesByUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({ userId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notes: ' + error.message });
  }
};

// Actualizar las colecciones de una nota
exports.updateNoteCollections = async (req, res) => {
  const { noteId } = req.params;
  const { collections } = req.body; // Array de IDs de colecciones
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    // Actualizar las colecciones que incluyen esta nota
    await Collection.updateMany(
      { notes: { $in: [noteId] } },
      { $pull: { notes: noteId } } // Remueve la nota de colecciones donde ya no debe estar
    );
    await Collection.updateMany(
      { _id: { $in: collections } },
      { $addToSet: { notes: noteId } } // Agrega la nota a las nuevas colecciones
    );
    res.status(200).json({ message: 'Collections updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating collections: ' + error.message });
  }
};

