const axios = require('axios');

// Configuración base de Axios para simplificar las solicitudes a diferentes endpoints
const usersApi = axios.create({
  baseURL: 'http://localhost:3000/users'
});
const friendsApi = axios.create({
  baseURL: 'http://localhost:3000/friends'
});

let authTokenUser1, authTokenUser2;

async function performLogin(api, email, password) {
  try {
    const response = await api.post('/login', { email, password });
    console.log(`${email} logged in successfully.`);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data.message : error.message);
  }
}

async function findUserByEmail(email, token) {
  try {
    const response = await usersApi.get('/find-by-email', { params: { email }, headers: { Authorization: `Bearer ${token}` } });
    return response.data;
  } catch (error) {
    console.error('Error finding user by email:', error.response ? error.response.data.message : error.message);
  }
}

async function sendFriendRequest(receiverId, token) {
  try {
    const response = await friendsApi.post('/sendFriendRequest', {
      receiverId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Friend request sent successfully.');
    return response.data.friendshipId;
  } catch (error) {
    console.error('Error sending friend request:', error.response ? error.response.data.message : error.message);
  }
}

async function acceptOrRejectFriendRequest(action, friendshipId, token) {
  try {
    const response = await friendsApi.patch(`/${action}FriendRequest/${friendshipId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`Friend request ${action}ed successfully.`);
    return response.data;
  } catch (error) {
    console.error(`Error ${action}ing friend request:`, error.response ? error.response.data.message : error.message);
  }
}

async function revokeFriendRequest(friendshipId, token) {
  try {
    const response = await friendsApi.delete(`/revokeFriendRequest/${friendshipId}`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Friend request revoked successfully.');
    return response.data;
  } catch (error) {
    console.error('Error revoking friend request:', error.response ? error.response.data.message : error.message);
  }
}

async function deleteFriendship(friendshipId, token) {
  try {
    const response = await friendsApi.delete(`/deleteFriendship/${friendshipId}`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Friendship deleted successfully.');
    return response.data;
  } catch (error) {
    console.error('Error deleting friendship:', error.response ? error.response.data.message : error.message);
  }
}

async function listFriendsOrRequests(apiEndpoint, token) {
  try {
    const response = await friendsApi.get(apiEndpoint, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`${apiEndpoint.replace('/', '').replace('list', '')}:`, response.data);
  } catch (error) {
    console.error(`Error listing ${apiEndpoint}:`, error.response ? error.response.data.message : error.message);
  }
}

async function testFriendshipFlow() {
  console.log('------- Configurando usuarios -------');
  authTokenUser1 = await performLogin(usersApi, "john@example.com", "password123");
  authTokenUser2 = await performLogin(usersApi, "jane@example.com", "password123");

  if (authTokenUser1 && authTokenUser2) {
    console.log('------- Buscando usuario 2 -------');
    const user2 = await findUserByEmail("jane@example.com", authTokenUser1);
    console.log('User 2:', user2);
    if (user2) {
      console.log('------- Enviando solicitud de amistad -------');
      const friendshipId = await sendFriendRequest(user2._id, authTokenUser1);
      
      console.log('------- Listando solicitudes pendientes -------');
      await listFriendsOrRequests('/listPendingRequests', authTokenUser2);

      console.log('------- Revocando solicitud de amistad antes de ser aceptada/rechazada -------');
      await revokeFriendRequest(friendshipId, authTokenUser1);

      console.log('------- Enviando otra solicitud de amistad -------');
      const newFriendshipId = await sendFriendRequest(user2._id, authTokenUser1);
      
      console.log('------- Aceptando solicitud de amistad -------');
      await acceptOrRejectFriendRequest('accept', newFriendshipId, authTokenUser2);
      
      console.log('------- Listando todos los amigos de User 1 después de aceptar -------');
      await listFriendsOrRequests('/listFriends', authTokenUser1);
      
      console.log('------- Listando solicitudes de amistad pendientes para User 2 después de aceptar -------');
      await listFriendsOrRequests('/listPendingRequests', authTokenUser2);
      
      console.log('------- Intentando rechazar la solicitud de amistad que ya fue aceptada (debería fallar) -------');
      await acceptOrRejectFriendRequest('reject', newFriendshipId, authTokenUser2);
      
      console.log('------- Rechazando la nueva solicitud de amistad -------');
      await acceptOrRejectFriendRequest('reject', newFriendshipId, authTokenUser2);
      
      console.log('------- Listando solicitudes de amistad pendientes para User 2 después del rechazo -------');
      await listFriendsOrRequests('/listPendingRequests', authTokenUser2);
      
      console.log('------- Eliminando la amistad establecida -------');
      await deleteFriendship(newFriendshipId, authTokenUser1);
    }
  }
}

testFriendshipFlow();
