const axios = require('axios');

// Configuración base de Axios
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

let authTokenUser1, authTokenUser2, user2Id;

async function performLogin(email, password) {
  try {
    const response = await api.post('/users/login', { email, password });
    console.log(`${email} logged in successfully.`);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data.message : error.message);
    return null;
  }
}

async function findUserByEmail(email, token) {
  try {
    const response = await api.get(`/users/find-by-email?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User found:', response.data);
    return response.data._id;
  } catch (error) {
    console.error('Error finding user by email:', error.response ? error.response.data.message : error.message);
    return null;
  }
}

async function sendFriendRequest(receiverId, token) {
  try {
    const response = await api.post('/friends/sendFriendRequest', {
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

async function acceptFriendRequest(friendshipId, token) {
  try {
    const response = await api.patch(`/friends/acceptFriendRequest/${friendshipId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Friend request accepted successfully.');
  } catch (error) {
    console.error('Error accepting friend request:', error.response ? error.response.data.message : error.message);
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
    console.log(`Note '${title}' created successfully.`);
    return response.data._id;
  } catch (error) {
    console.error('Error creating note:', error.response ? error.response.data.message : error.message);
  }
}

async function updateNote(noteId, token, newTitle) {
  try {
    const response = await api.put(`/notes/${noteId}`, { title: newTitle }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Note updated successfully:`, response.data);
  } catch (error) {
    console.error('Error updating note:', error.response ? error.response.data.message : error.message);
  }
}

async function deleteNote(noteId, token) {
  try {
    const response = await api.delete(`/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Note deleted successfully.`);
  } catch (error) {
    console.error('Error deleting note:', error.response ? error.response.data.message : error.message);
  }
}

async function shareNoteWithUser(noteId, friendId, token) {
  try {
    const response = await api.post('/notes/share-note', {
      noteId, friendId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Note shared successfully.');
  } catch (error) {
    console.error('Error sharing note:', error.response ? error.response.data.message : error.message);
  }
}

async function main() {
    console.log("------- Iniciando proceso de autenticación para los usuarios -------");
    authTokenUser1 = await performLogin("john@example.com", "password123");
    authTokenUser2 = await performLogin("jane@example.com", "password123");
    authTokenUser3 = await performLogin("joe@example.com", "password123");
  
    if (!authTokenUser1 || !authTokenUser2 || !authTokenUser3) {
      console.log('------- Error al obtener tokens para los usuarios, asegúrate de que los correos y contraseñas son correctos -------');
      return;
    }
  
    console.log("------- Buscando usuarios por correo electrónico -------");
    user2Id = await findUserByEmail("jane@example.com", authTokenUser1);
    user3Id = await findUserByEmail("joe@example.com", authTokenUser1);
  
    console.log("------- Estableciendo amistad entre el primer y segundo usuario -------");
    const friendshipId = await sendFriendRequest(user2Id, authTokenUser1);
    if (friendshipId) {
      await acceptFriendRequest(friendshipId, authTokenUser2);
      console.log("------- Amistad confirmada entre dos usuarios -------");
    }
  
    console.log("------- Creando y compartiendo una nota -------");
    const noteId = await createNote(authTokenUser1, "Test Note", "This is a test note");
    if (noteId) {
      await shareNoteWithUser(noteId, user2Id, authTokenUser1);
      console.log(`------- Nota creada y compartida con el usuario ID: ${user2Id} -------`);
    }
  
    console.log("------- Actualización positiva de la nota por el propietario -------");
    await updateNote(noteId, authTokenUser1, "Updated Title by Owner");
  
    console.log("------- Intento de actualización de la nota por un no amigo -------");
    await updateNote(noteId, authTokenUser3, "Attempted Update by Non-Friend");
  
    console.log("------- Intento de compartir la nota con un no amigo -------");
    await shareNoteWithUser(noteId, user3Id, authTokenUser1);
  
    console.log("------- Eliminación de la nota por el propietario -------");
    await deleteNote(noteId, authTokenUser1);
  
    console.log("------- Intento de eliminar la nota por un no propietario -------");
    await deleteNote(noteId, authTokenUser3);
  }
  
  main();
  