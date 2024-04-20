const Note = require('../models/note');

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
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the notes: ' + error.message });
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

