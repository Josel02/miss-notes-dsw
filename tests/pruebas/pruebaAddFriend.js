const axios = require('axios');

const usersURL = 'http://localhost:3000/users'; // URL base para operaciones de usuario
const friendsURL = 'http://localhost:3000/friends'; // URL base para operaciones de amistad, ajusta según tu configuración

async function testUserAPI() {
  try {
    // Crear un nuevo usuario (User 1)
    console.log('Creating user 1...');
    const user1Response = await axios.post(usersURL, {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password1',
      role: 'User'
    });
    console.log('User 1 created:', user1Response.data, "\n");

    // Crear otro usuario (User 2)
    console.log('Creating user 2...');
    const user2Response = await axios.post(usersURL, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'hashed_password2',
      role: 'User'
    });
    console.log('User 2 created:', user2Response.data, "\n");

    // Enviar una solicitud de amistad de User 1 a User 2
    console.log('Sending friend request from user 1 to user 2...');
    const friendRequestResponse = await axios.post(`${friendsURL}/sendFriendRequest`, {
      requesterId: user1Response.data._id,
      receiverId: user2Response.data._id
    });
    console.log('Friend request sent:', friendRequestResponse.data, "\n");
    const friendshipId = friendRequestResponse.data.friendshipId; // Captura el ID de la amistad

    // Aceptar la solicitud de amistad
    console.log('Accepting friend request...');
    const acceptFriendResponse = await axios.patch(`${friendsURL}/acceptFriendRequest/${friendshipId}`);
    console.log('Friend request accepted:', acceptFriendResponse.data, "\n");

    // Simulación de la limpieza comentada. Recuerda descomentarla si deseas eliminar los usuarios al final del test.
  } catch (error) {
    console.error('API test error:', error.response ? error.response.data : error.message);
  }
}

testUserAPI();
