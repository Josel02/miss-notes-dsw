const axios = require('axios');

// Configuración base de Axios para simplificar las solicitudes
const api = axios.create({
  baseURL: 'http://localhost:3000/users', // Ajusta según tu configuración
});

// Guarda el token aquí para usarlo en solicitudes subsiguientes
let authToken;

async function registerUser() {
  try {
    const response = await api.post('/register', {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Registro exitoso:', response.data);
  } catch (error) {
    console.error('Error en el registro:', error.response ? error.response.data : error.message);
  }
}

async function loginUser() {
  try {
    const response = await api.post('/login', {
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Inicio de sesión exitoso:', response.data);
    authToken = response.data.token; // Guarda el token para su uso posterior
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.response ? error.response.data : error.message);
  }
}

async function getUserById() {
  try {
    const response = await api.get('/me', { // Acceder al perfil del usuario autenticado
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Datos del usuario:', response.data);
  } catch (error) {
    console.error('Error obteniendo el usuario:', error.response ? error.response.data : error.message);
  }
}

async function updateUser() {
  try {
    const response = await api.put('/me', { // Actualizar al usuario autenticado
      name: "Updated User",
      email: "updateduser@example.com",
    }, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Usuario actualizado:', response.data);
  } catch (error) {
    console.error('Error actualizando el usuario:', error.response ? error.response.data : error.message);
  }
}

async function deleteUser() {
  try {
    const response = await api.delete('/me', { // Eliminar al usuario autenticado
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Usuario eliminado');
  } catch (error) {
    console.error('Error eliminando el usuario:', error.response ? error.response.data : error.message);
  }
}

async function testAuthFlow() {
  console.log('Iniciando prueba de registro...');
  await registerUser();

  console.log('Iniciando prueba de inicio de sesión...');
  await loginUser();

  if (authToken) {
    console.log('Probando CRUD de usuarios con el usuario recién registrado...');
    await getUserById(); // Obtener el perfil del usuario autenticado
    await updateUser(); // Actualizar el perfil del usuario autenticado
    await deleteUser(); // Borrar el usuario autenticado
  }
}

testAuthFlow();
