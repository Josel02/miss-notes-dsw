const axios = require('axios');

const usersBaseURL = 'http://localhost:3000/users';
const notesBaseURL = 'http://localhost:3000/notes';

describe('Notes API', () => {
  let userId;
  let noteId;

  // Crear un usuario para las pruebas si no existe
  beforeAll(async () => {
    try {
      // Intenta obtener el listado de usuarios
      const usersResponse = await axios.get(usersBaseURL);
      if (usersResponse.data.length === 0) {
        // Si no hay usuarios, crea uno
        const userResponse = await axios.post(usersBaseURL, {
          name: 'Test User',
          email: 'test@example.com',
          passwordHash: 'hashed_password_test',
          role: 'User'
        });
        userId = userResponse.data._id;
      } else {
        // Usa el primer usuario disponible para las pruebas
        userId = usersResponse.data[0]._id;
      }
    } catch (error) {
      console.error('Error preparing for notes tests:', error.message);
    }
  });

  it('should create a new note', async () => {
    const response = await axios.post(notesBaseURL, {
      title: 'Test Note',
      content: [{ type: 'text', data: ['Note content for testing'] }],
      userId: userId,
    });
    noteId = response.data._id;
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('title', 'Test Note');
  });

  it('should get all notes', async () => {
    const response = await axios.get(notesBaseURL);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: noteId })]));
  });

  it('should update a note', async () => {
    const updatedTitle = 'Updated Test Note';
    const response = await axios.put(`${notesBaseURL}/${noteId}`, {
      title: updatedTitle,
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('title', updatedTitle);
  });

  it('should delete a note', async () => {
    const response = await axios.delete(`${notesBaseURL}/${noteId}`);
    expect(response.status).toBe(204);
  });
});
