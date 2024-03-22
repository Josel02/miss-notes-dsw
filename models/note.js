const db = require('../db/database');

class Note {
  constructor(id, title, content, userId) {
    this.id = id;
    this.title = title;
    // Asegúrate de tratar el contenido como un objeto JavaScript al trabajar con la instancia de Note
    this.content = typeof content === 'string' ? JSON.parse(content) : content;
    this.userId = userId;
  }

  // Crear una nueva nota
  static create(title, content, userId) {
    return new Promise((resolve, reject) => {
      // Convertir el contenido de objeto JavaScript a cadena JSON para almacenamiento
      const contentJson = JSON.stringify(content);
      const sql = `INSERT INTO notes (title, content, userId) VALUES (?, ?, ?)`;
      db.run(sql, [title, contentJson, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          // Asegúrate de convertir el contenido de vuelta a objeto para el objeto Note
          resolve(new Note(this.lastID, title, JSON.parse(contentJson), userId));
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
          const notes = rows.map(row => {
            let content;
            try {
              content = JSON.parse(row.content);
            } catch (e) {
              // Si no es JSON válido, envuélvelo en un objeto como texto plano
              content = { text: row.content };
            }
            return new Note(row.id, row.title, content, row.userId);
          });
          resolve(notes);
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
          // Convertir el contenido de cadena JSON a objeto para la nota
          resolve(row ? new Note(row.id, row.title, JSON.parse(row.content), row.userId) : null);
        }
      });
    });
  }

  // Actualizar una nota existente
  static update(id, title, content) {
    return new Promise((resolve, reject) => {
      // Convertir el contenido de objeto JavaScript a cadena JSON para almacenamiento
      const contentJson = JSON.stringify(content);
      const sql = `UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(sql, [title, contentJson, id], function(err) {
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
