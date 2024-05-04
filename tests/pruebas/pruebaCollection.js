const axios = require('axios');

// Configuración base de Axios
const apiBase = axios.create({
  baseURL: 'http://localhost:3000',
});

let authToken;

// Registrar e iniciar sesión con un usuario de prueba
async function registerAndLogin() {
  console.log("----- REGISTRO E INICIO DE SESIÓN -----")
  try {
    // Registro
    /*
      response = await apiBase.post('/users/register', {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Usuario registrado:', response.data);
    userId = response.data._id; 
    */

    // Inicio de sesión
    const response = await apiBase.post('/users/login', {
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Inicio de sesión exitoso:', response.data);
    authToken = response.data.token;
  } catch (error) {
    console.error('Error registrando o iniciando sesión:', error.response ? error.response.data : error.message);
  }
}

// Crear tres colecciones
async function createCollections() {
  console.log("\n----- CREACIÓN DE 3 COLECCIONES -----")
  try {
    const collectionNames = ['Colección 1', 'Colección 2', 'Colección 3'];
    const collections = [];
    for (const name of collectionNames) {
      const response = await apiBase.post('/collections', { name }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      collections.push(response.data);
      console.log(`Colección ${name} creada:`, response.data);
    }
    return collections;
  } catch (error) {
    console.error('Error creando colecciones:', error.response ? error.response.data : error.message);
  }
}

// Crear dos notas
async function createNotes() {
  console.log("\n----- CREACIÓN DE 2 NOTAS -----")
  try {
    const noteTitles = ['Nota 1', 'Nota 2'];
    const notes = [];
    for (const title of noteTitles) {
      const response = await apiBase.post('/notes', {
        title, 
        content: [{ type: 'text', data: [`Contenido de ${title}`] }], 
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      notes.push(response.data);
      console.log(`${title} creada:`, response.data);
    }
    return notes;
  } catch (error) {
    console.error('Error creando notas:', error.response ? error.response.data : error.message);
  }
}

// Añadir múltiples notas a una colección específica
async function addNotesToCollection(collectionId, noteIds) {
  console.log("\n----- AÑADIENDO MÚLTIPLES NOTAS A UNA COLECCIÓN -----");
  console.log("Collection ID being sent:", collectionId);
  console.log("Note IDs being sent:", noteIds);

  try {
    const response = await apiBase.put(`/collections/${collectionId}/notes/add`, {
      noteIds
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(`Notas añadidas a la colección ${collectionId}:`, response.data);
  } catch (error) {
    console.error('Error añadiendo notas a la colección:', error.response ? error.response.data : error.message);
  }
}

async function runTestScript() {
  await registerAndLogin();
  if (!authToken) {
    console.log('No se pudo obtener el authToken. Finalizando las pruebas.');
    return;
  }

  const collections = await createCollections();
  const notes = await createNotes();
  if (collections.length > 0 && notes.length > 0) {
    const noteIds = notes.map(note => note._id);
    await addNotesToCollection(collections[0]._id, noteIds); // Asignar todas las notas a la primera colección
  }
}

runTestScript();
