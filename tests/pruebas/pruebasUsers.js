const axios = require('axios');

const baseURL = 'http://localhost:3000/users'; // Ajusta esta URL a tu configuración

async function testUserAPI() {
  try {
    // Crear un nuevo usuario
    console.log('Creating user 1...');
    const user1Response = await axios.post(baseURL, {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password1',
      role: 'User'
    });
    console.log('User 1 created:', user1Response.data, "\n");

    // Crear otro usuario para hacer la prueba de añadir amigo
    console.log('Creating user 2...');
    const user2Response = await axios.post(baseURL, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'hashed_password2',
      role: 'User'
    });
    console.log('User 2 created:', user2Response.data, "\n");

    // Añadir el usuario 2 como amigo del usuario 1
    console.log('Adding user 2 as a friend of user 1...');
    const addFriendResponse = await axios.post(`${baseURL}/${user1Response.data._id}/friends/${user2Response.data._id}`);
    console.log('Friend added:', addFriendResponse.data, "\n");

    // Obtener de nuevo los detalles del usuario 1 para verificar la lista de amigos
    console.log('Getting user 1 details again...');
    const updatedUser1Response = await axios.get(`${baseURL}/${user1Response.data._id}`);
    console.log('User 1 details with friend:', updatedUser1Response.data, "\n");

    // Obtener detalles del usuario 2 para verificar la lista de amigos
    console.log('Getting user 2 details...');
    const updatedUser2Response = await axios.get(`${baseURL}/${user2Response.data._id}`);
    console.log('User 2 details with friend:', updatedUser2Response.data, "\n");

    // Limpieza: Borrar ambos usuarios
    /*
    console.log('Deleting user 1...');
    await axios.delete(`${baseURL}/${user1Response.data._id}`);
    console.log('User 1 deleted');

    console.log('Deleting user 2...');
    await axios.delete(`${baseURL}/${user2Response.data._id}`);
    console.log('User 2 deleted');
    */
  } catch (error) {
    console.error('API test error:', error.response ? error.response.data : error.message);
  }
}

testUserAPI();
