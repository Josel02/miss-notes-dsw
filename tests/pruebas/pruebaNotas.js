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


  // Inicio de sesión
  response = await apiBase.post('/users/login', {
    email: "testuser@example.com",
    password: "password123",
  });
  console.log('Inicio de sesión exitoso:', response.data);
  authToken = response.data.token;
  userId = response.data.userId; 
} catch (error) {
  console.error('Error registrando o iniciando sesión:', error.response ? error.response.data : error.message);
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

// Obtener todas las notas del usuario
async function getNotes() {
    console.log("\n----- OBTENCIÓN DE NOTAS DEL USUARIO -----")
    console.log('authToken:', authToken)
    try {
      const response = await apiBase.get(`/notes/users/${userId}`, {  // Usar template string para insertar el userId
        headers: { Authorization: `Bearer ${authToken}` },
    });
    
        console.log('Notas del usuario:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo notas:', error.response ? error.response.data : error.message);
    }
}

async function runTestScript() {
  await registerAndLogin();
  if (!authToken) {
    console.log('No se pudo obtener el authToken. Finalizando las pruebas.');
    return;
  }

  await createNotes();
  await getNotes();
}

runTestScript();
