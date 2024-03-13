const db = require('../db/database');

class Note {
  constructor(id, title, content, userId) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.userId = userId;
  }

  // Crear una nueva nota
  static create(title, content, userId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO notes (title, content, userId) VALUES (?, ?, ?)`;
      db.run(sql, [title, content, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(new Note(this.lastID, title, content, userId));
        }
      });
    });
  }

  // Encontrar todas las notas
  static findAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM notes`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Note(row.id, row.title, row.content, row.userId)));
        }
      });
    });
  }

  // Encontrar una nota por su ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM notes WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new Note(row.id, row.title, row.content, row.userId) : null);
        }
      });
    });
  }

  // Actualizar una nota existente
  static update(id, title, content) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(sql, [title, content, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Eliminar una nota
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM notes WHERE id = ?`;
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = Note;

