const axios = require('axios');


const baseURL = 'http://localhost:3000/users'; 

describe('User API', () => {
  let userId;

  it('should create a new user', async () => {
    const response = await axios.post(baseURL, {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password',
      role: 'User'
    });
    userId = response.data._id; // Guardar ID del usuario para pruebas futuras
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('name', 'John Doe');
  });

  it('should get all users', async () => {
    const response = await axios.get(baseURL);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: userId })]));
  });

  it('should get a user by ID', async () => {
    const response = await axios.get(`${baseURL}/${userId}`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('_id', userId);
  });

  it('should update a user', async () => {
    const response = await axios.put(`${baseURL}/${userId}`, {
      name: 'John Updated',
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name', 'John Updated');
  });

  it('should delete a user', async () => {
    const response = await axios.delete(`${baseURL}/${userId}`);
    expect(response.status).toBe(204);
  });
});
