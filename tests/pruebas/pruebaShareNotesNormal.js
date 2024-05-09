const axios = require('axios');
const note = require('../../models/note');

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

async function perfomrRegister(name, email, password) {
  try {
    const response = await api.post('/users/register', { name, email, password  });
    console.log(`User ${name} registered successfully`);
    console.log(response.data);  // Mostrar la respuesta del backend
  } catch (error) {
    console.error(`Error registering user ${name}: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function performLogin(email, password) {
  try {
    const response = await api.post('/users/login', { email, password });
    console.log(`Login successful for ${email}`);
    console.log(response.data);  // Mostrar la respuesta del backend
    return { token: response.data.token, userId: response.data.userId };
  } catch (error) {
    console.error(`Login failed for ${email}: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function compartirNota(token, noteId, friendIds) {
  try {
      console.log("Note ID: " + noteId);
      console.log("Sharing with friends IDs: ", friendIds.join(", "));
      const response = await api.post(`/notes/share-note`, { noteId, friendIds }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Note ${noteId} shared with users ${friendIds.join(", ")}`);
      console.log(response.data);  // Mostrar la respuesta del backend
  } catch (error) {
      console.error(`Error sharing note ${noteId}: ${error.response ? error.response.data.message : error.message}`);
  }
}


async function sendFriendRequest(token, receiverId) {
  try {
    const response = await api.post('/friends/sendFriendRequest', { receiverId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Friend request sent successfully');
    console.log(response.data);  // Mostrar la respuesta del backend
    return response.data.friendshipId;
  } catch (error) {
    console.error(`Error sending friend request: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function acceptFriendRequest(token, friendshipId) {
  try {
    const response = await api.patch(`/friends/acceptFriendRequest/${friendshipId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Friend request accepted successfully');
    console.log(response.data);  // Mostrar la respuesta del backend
  } catch (error) {
    console.error(`Error accepting friend request: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function createNote(token, title, content) {
  try {
    const response = await api.post('/notes', {
      title,
      content: [{ type: 'text', data: [content] }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Note '${title}' created successfully`);
    console.log(response.data);  // Mostrar la respuesta del backend
    return response.data._id;
  } catch (error) {
    console.error(`Error creating note: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function getMyNotes(token) {
  try {
    const response = await api.get('/notes/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`My notes retrieved`);
    console.log(response.data);  // Mostrar la respuesta del backend
    return response.data;
  } catch (error) {
    console.error(`Error getting my notes: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function getSharedWithMeNotes(token) {
  try {
    const response = await api.get('/notes/shared-with-me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Notes shared with me retrieved`);
    console.log(response.data);  // Mostrar la respuesta del backend
    return response.data;
  } catch (error) {
    console.error(`Error getting shared notes: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function main() {
  console.log("-------- EMPEZANDO SCRIPT--------");
  await perfomrRegister("John Doe", "john@example.com", "password123");
  await perfomrRegister("Jane Doe", "jane@example.com", "password123");
  await perfomrRegister("Aitor", "aitor@gmail.com", "12345678910");
  
  const user1 = await performLogin("john@example.com", "password123");
  const user2 = await performLogin("jane@example.com", "password123");
  const aitor = await performLogin("aitor@gmail.com", "12345678910");

  if (user1 && user2 && aitor) {
    console.log("-------- SOLICITANDO Y ACEPTANDO AMISTADES --------");
    const friendshipId1 = await sendFriendRequest(user1.token, user2.userId);
    const friendshipId2 = await sendFriendRequest(user1.token, aitor.userId);
    if (friendshipId1) await acceptFriendRequest(user2.token, friendshipId1);
    if (friendshipId2) await acceptFriendRequest(aitor.token, friendshipId2);

    console.log("-------- CREANDO NOTA --------");
    const noteId = await createNote(user1.token, "Test Note", "Initial content of the note");
    if (noteId) {
      console.log("-------- COMPARTIENDO NOTA CON VARIOS AMIGOS --------");
      await compartirNota(user1.token, noteId, [user2.userId, aitor.userId]);

      console.log("-------- OBTENIENDO NOTAS COMPARTIDAS --------");
      await getSharedWithMeNotes(user2.token); // Notas compartidas con user2
      await getSharedWithMeNotes(aitor.token); // Notas compartidas con Aitor
    }
  }

  console.log("-------- Test script completed --------");
}

main();
