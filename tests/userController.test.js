const axios = require('axios');

const baseURL = 'http://localhost:3000/users';

describe('User API', () => {
  let userId;
  let testEmail = `john+${Date.now()}@example.com`; // Usar un email único

  // Preparar el entorno de prueba creando un nuevo usuario
  beforeAll(async () => {
    try {
      const newUserResponse = await axios.post(baseURL, {
        name: 'John Doe',
        email: testEmail, // Usar un email único para evitar conflictos
        passwordHash: 'hashed_password',
        role: 'User'
      });
      userId = newUserResponse.data._id;
    } catch (error) {
      console.error('Error setting up user for tests:', error.message);
    }
  });

  // Limpiar después de las pruebas eliminando el usuario creado
  afterAll(async () => {
    try {
      await axios.delete(`${baseURL}/${userId}`);
    } catch (error) {
      console.error('Error cleaning up user after tests:', error.message);
    }
  });

  // Prueba: Crear un nuevo usuario
  it('should create a new user', async () => {
    const newUserEmail = `new+${Date.now()}@example.com`; // Garantizar un email único
    const response = await axios.post(baseURL, {
      name: 'New User',
      email: newUserEmail,
      passwordHash: 'new_hashed_password',
      role: 'User'
    });

    // Asegurarse de limpiar el usuario creado después de la prueba
    const createdUserId = response.data._id;
    await axios.delete(`${baseURL}/${createdUserId}`);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('email', newUserEmail);
  });

  // Prueba: Obtener todos los usuarios
  it('should get all users', async () => {
    const response = await axios.get(baseURL);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: userId })]));
  });

  // Prueba: Obtener un usuario por ID
  it('should get a user by ID', async () => {
    const response = await axios.get(`${baseURL}/${userId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('_id', userId);
  });

  // Prueba: Actualizar un usuario
  it('should update a user', async () => {
    const newName = 'John Updated';
    const response = await axios.put(`${baseURL}/${userId}`, {
      name: newName,
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', newName);
  });

  // Prueba: Eliminar un usuario
  it('should delete a user', async () => {
    // Crear otro usuario para probar la eliminación
    const deleteUserEmail = `delete+${Date.now()}@example.com`;
    const newUser = await axios.post(baseURL, {
      name: 'Delete User',
      email: deleteUserEmail,
      passwordHash: 'delete_hashed_password',
      role: 'User'
    });
    const deleteUserId = newUser.data._id;

    // Probar la eliminación
    const deleteResponse = await axios.delete(`${baseURL}/${deleteUserId}`);
    expect(deleteResponse.status).toBe(204);

    // Verificar que el usuario haya sido eliminado
    try {
      await axios.get(`${baseURL}/${deleteUserId}`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
