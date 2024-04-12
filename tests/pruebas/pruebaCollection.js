const axios = require('axios');

// Configuración base de Axios
const apiBase = axios.create({
  baseURL: 'http://localhost:3000',
});

let authToken;
let userId;

// Registrar e iniciar sesión con un usuario de prueba
async function registerAndLogin() {
    console.log("----- REGISTRO E INICIO DE SESIÓN -----")
  try {
    // Registro
    let response = await apiBase.post('/users/register', {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Usuario registrado:', response.data);
    userId = response.data._id; 

    // Inicio de sesión
    response = await apiBase.post('/users/login', {
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
      collections.push(response.data._id);
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
                content: [{ 
                    type: 'text', 
                    data: [`Contenido de ${title}`]
                }], 
                userId, 
            }, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            notes.push(response.data._id);
            console.log(`${title} creada:`, response.data);
        }
        return notes;
    } catch (error) {
        console.error('Error creando notas:', error.response ? error.response.data : error.message);
    }
}



// Asignar notas a colecciones
async function assignNotesToCollections(collectionIds, noteIds) {
  console.log("\n----- ASIGNACIÓN DE NOTAS A COLECCIONES -----")
  try {
    if (collectionIds.length > 1 && noteIds.length > 0) {
      // Asigna la nota 1 a la colección 1
      let response = await apiBase.put(`/collections/${collectionIds[0]}/note/${noteIds[0]}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Nota 1 asignada a Colección 1:', response.data);

      // Asigna la nota 2 a la colección 2
      response = await apiBase.put(`/collections/${collectionIds[1]}/note/${noteIds[1]}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Nota 2 asignada a Colección 2:', response.data);

      // Asigna la nota 1 a la colección 2 también
      response = await apiBase.put(`/collections/${collectionIds[1]}/note/${noteIds[0]}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Nota 1 asignada a Colección 2 también:', response.data);
    }
  } catch (error) {
    console.error('Error asignando notas a colecciones:', error.response ? error.response.data : error.message);
  }
}

async function getAllCollections() {
  console.log("\n----- OBTENCIÓN DE TODAS LAS COLECCIONES -----");
  try {
    const response = await apiBase.get('/collections', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Todas las colecciones:', response.data);
  } catch (error) {
    console.error('Error obteniendo todas las colecciones:', error.response ? error.response.data : error.message);
  }
}

async function updateCollection(collectionId) {
  console.log("\n----- ACTUALIZACIÓN DE UNA COLECCIÓN -----");
  try {
    const response = await apiBase.put(`/collections/${collectionId}`, {
      name: "Colección Actualizada"
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Colección actualizada:', response.data);
  } catch (error) {
    console.error('Error actualizando la colección:', error.response ? error.response.data : error.message);
  }
}

async function getCollectionById(collectionId) {
  console.log("\n----- OBTENCIÓN DE UNA COLECCIÓN POR ID -----");
  try {
    const response = await apiBase.get(`/collections/${collectionId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Colección obtenida por ID:', response.data);
  } catch (error) {
    console.error('Error obteniendo la colección por ID:', error.response ? error.response.data : error.message);
  }
}

async function getCollectionsContainingNote(noteId) {
  console.log("\n----- OBTENIENDO COLECCIONES QUE CONTIENEN UNA NOTA ESPECÍFICA -----");
  try {
    const response = await apiBase.get(`/collections/note/${noteId}/collections`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Colecciones que contienen la nota:', response.data);
  } catch (error) {
    console.error('Error obteniendo colecciones que contienen la nota:', error.response ? error.response.data : error.message);
  }
}







// Función para probar las funcionalidades (creación, actualización, obtención, eliminación)
/*
async function testFunctionalities(collectionIds, noteIds) {
    console.log("\n----- PRUEBA DE FUNCIONALIDADES -----")
  try {
    // Eliminar una colección que tiene notas
    let response = await apiBase.delete(`/collections/${collectionIds[0]}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log('Colección con notas eliminada:', response.data); // Puede que no haya datos en una respuesta 204

  } catch (error) {
    console.error('Error durante las pruebas:', error.response ? error.response.data : error.message);
  }
}*/



async function runTestScript() {
  await registerAndLogin();
  if (!authToken) {
    console.log('No se pudo obtener el authToken. Finalizando las pruebas.');
    return;
  }

  const collectionIds = await createCollections();
  const noteIds = await createNotes();
  await assignNotesToCollections(collectionIds, noteIds);
  await getAllCollections();

  // Asumiendo que eliges una colección que sabes que tiene más de una nota:
  if (collectionIds.length > 1) {
    await getCollectionById(collectionIds[1]); // Obtener detalles de la colección 2 que debería tener más de una nota
  }

  // Asumiendo que usas el ID de una nota específica para encontrar en qué colecciones está:
  if (noteIds.length > 0) {
    await getCollectionsContainingNote(noteIds[0]); // Obtener todas las colecciones que contienen la primera nota creada
  }
}

runTestScript();
