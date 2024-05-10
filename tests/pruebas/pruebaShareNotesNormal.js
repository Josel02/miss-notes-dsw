const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

async function performRegister(name, email, password) {
  try {
    const response = await api.post('/users/register', { name, email, password });
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

async function shareNote(token, noteId, friendIds) {
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

async function createNote(token, title, content) {
  try {
    const response = await api.post('/notes', {
      title,
      content: [{ type: 'text', data: content }]
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

async function updateNote(token, noteId, title, content) {
  try {
    const response = await api.put(`/notes/${noteId}`, {
      title,
      content: [{ type: 'text', data: content }]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Note '${noteId}' updated successfully with title '${title}'`);
    console.log(response.data);  // Mostrar la respuesta del backend
  } catch (error) {
    console.error(`Error updating note ${noteId}: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function main() {
  console.log("-------- STARTING SCRIPT --------");
  //await performRegister("John Doe", "john@example.com", "password123");
  //await performRegister("Jane Doe", "jane@example.com", "password123");
  
  const john = await performLogin("john@example.com", "password123");
  const jane = await performLogin("jane@example.com", "password123");

  if (john && jane) {
    console.log("-------- CREATING AND SHARING NOTE --------");
    const noteId = await createNote(john.token, "My First Note", "This is the content of my first note.");

    if (noteId) {
      await shareNote(john.token, noteId, [jane.userId]);

      console.log("-------- ATTEMPTING TO UPDATE NOTE AS NON-OWNER --------");
      await updateNote(jane.token, noteId, "Updated Title", "This is updated content by non-owner.");

      console.log("-------- ATTEMPTING TO UPDATE NOTE AS OWNER --------");
      await updateNote(john.token, noteId, "Updated Title by Owner", "This is updated content by owner.");
    }
  }

  console.log("-------- Test script completed --------");
}

main();
