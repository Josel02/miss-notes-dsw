const axios = require('axios');
const note = require('../../models/note');

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

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

async function compartirNota(token, noteId, friendId) {
    try {
        console.log("Note ID: " + noteId);
        const response = await api.post(`/notes/share-note`, { noteId, friendId }, {
        headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Note ${noteId} shared with user ${friendId}`);
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
  const user1 = await performLogin("john@example.com", "password123");
  const user2 = await performLogin("jane@example.com", "password123");
  const aitor = await performLogin("aitor@gmail.com", "12345678910");

  if (user1 && user2) {
    console.log("-------- ASOLICITANDO AMISTAD--------");
    const friendshipId = await sendFriendRequest(user1.token, user2.userId);
    if (friendshipId) {
      console.log("-------- ACEPTANDO AMISTAD--------");
      await acceptFriendRequest(user2.token, friendshipId);
        console.log("-------- CREANDO NOTA--------");
      const noteId = await createNote(user1.token, "Test Note", "Initial content of the note");
      if (noteId) {
        console.log("-------- OBTENIENDO NOTAS PROPIAS--------");
        await getMyNotes(user1.token); // Retrieve and log user1's own notes
        console.log("-------- OBTENIENDO NOTAS COMPARTIDAS--------");
        await getSharedWithMeNotes(user2.token); // Retrieve and log notes shared with user2
        console.log("-------- COMPARTIENDO NOTA--------");
        await compartirNota(user1.token, noteId, user2.userId);
        console.log("-------- OBTENIENDO NOTAS COMPARTIDAS--------");
        await getSharedWithMeNotes(user2.token); // Retrieve and log notes shared with user2

        console.log("-------- AÑADIENDO A JOHN Y AITOR COMO AMIGOS--------");
        const friendshipId2 = await sendFriendRequest(user1.token, aitor.userId);
        if (friendshipId2) {
          console.log("-------- ACEPTANDO AMISTAD--------");
          await acceptFriendRequest(aitor.token, friendshipId2);
            console.log("-------- COMPARTIENDO NOTA--------");
            await compartirNota(user1.token, noteId, aitor.userId);
            
          console.log("-------- OBTENIENDO NOTAS COMPARTIDAS--------");
          await getSharedWithMeNotes(aitor.token); // Retrieve and log notes shared with aitor
        }
      }
    }
  }

  console.log("-------- Test script completed --------");
}

main();
