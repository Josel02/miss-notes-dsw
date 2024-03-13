const sqlite3 = require('sqlite3').verbose();

// Abrir la base de datos SQLite
let db = new sqlite3.Database('./miss-notes.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos de miss-notes.');
    db.exec('PRAGMA foreign_keys = ON;', error => {
      if (error) {
        console.error("Pragma statement didn't execute successfully", error);
      } else {
        console.log("Foreign Key Enforcement is on.");
      }
    });
  }
});

// Crear tablas si no existen
const initDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        userId INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        userId INTEGER,
        FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Notes_Collections (
        noteId INTEGER,
        collectionId INTEGER,
        PRIMARY KEY (noteId, collectionId),
        FOREIGN KEY (noteId) REFERENCES Notes (id) ON DELETE CASCADE,
        FOREIGN KEY (collectionId) REFERENCES Collections (id) ON DELETE CASCADE
      )
    `);
  });
};

// Inicializar la base de datos
initDb();

module.exports = db;
