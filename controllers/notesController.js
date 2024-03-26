const Note = require('../models/note');

exports.createNote = async (req, res) => {
  try {
    const newNote = new Nota({
      ...req.body, // Asume que el cuerpo de la solicitud ya tiene todos los campos necesarios
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating note: ' + error.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Nota.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting the notes: ' + error.message });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedNote = await Nota.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: 'Error updating the note: ' + error.message });
  }
};

exports.findNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Nota no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    await Nota.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the note: ' + error.message });
  }
};