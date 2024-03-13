const Note = require('../models/note');

// Obtener todas las notas
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll();
    res.render('notes/index', { notes: notes });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Obtener una nota por ID
exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (note) {
      res.json(note);
    } else {
      res.status(404).send("Nota no encontrada");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Crear una nueva nota
exports.createNote = async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const newNote = await Note.create(title, content, userId);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Actualizar una nota existente
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updateResult = await Note.update(id, title, content);
    if (updateResult) {
      res.json({ message: "Nota actualizada correctamente" });
    } else {
      res.status(404).send("Nota no encontrada");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Eliminar una nota
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteResult = await Note.delete(id);
    if (deleteResult) {
      res.json({ message: "Nota eliminada correctamente" });
    } else {
      res.status(404).send("Nota no encontrada");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};
