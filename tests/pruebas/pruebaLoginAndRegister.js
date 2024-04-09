const axios = require('axios');

// Configuración base de Axios para simplificar las solicitudes
const api = axios.create({
  baseURL: 'http://localhost:3000/users', // Ajusta según tu configuración
});

// Guarda el token y el userId aquí para usarlos en solicitudes subsiguientes
let authToken;
let userId;

async function registerUser() {
  try {
    const response = await api.post('/register', {
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    console.log('Registro exitoso:', response.data);
    userId = response.data._id; // Guarda el userId para uso posterior
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
    const response = await api.get(`/${userId}`, {
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
    const response = await api.put(`/${userId}`, {
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
    const response = await api.delete(`/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Usuario eliminado');
  } catch (error) {
    console.error('Error eliminando el usuario:', error.response ? error.response.data : error.message);
  }
}

async function testProtectedRoute() {
  try {
    // Asegúrate de reemplazar '/ruta-protegida' con el endpoint real de una ruta protegida
    const response = await api.get('/ruta-protegida', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log('Respuesta de la ruta protegida:', response.data);
  } catch (error) {
    console.error('Error accediendo a la ruta protegida:', error.response ? error.response.data : error.message);
  }
}

async function testAuthFlow() {
  console.log('Iniciando prueba de registro...');
  await registerUser();

  if (userId) {
    console.log('Iniciando prueba de inicio de sesión...');
    await loginUser();

    if (authToken) {
      console.log('Probando CRUD de usuarios con el usuario recién registrado...');
      await getUserById(); // Ahora usa el userId dinámico
      await updateUser(); // Actualiza este usuario
      await deleteUser(); // Borra este usuario

      /*
      console.log('Probando acceso a ruta protegida...');
      await testProtectedRoute();
      */
     //TODO: Revisar rutas protegidas
    }
  }
}

testAuthFlow();
