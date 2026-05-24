const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const apiService = {
  // Obtener todas las notas
  getNotes: async () => {
    const response = await fetch(`${API_BASE_URL}/notes/`);
    if (!response.ok) throw new Error('Error al obtener las notas');
    return await response.json();
  },

  // Crear una nota nueva
  createNote: async (noteData) => {
    const response = await fetch(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Error al crear la nota');
    return await response.json();
  },

  // Actualizar una nota (editar o archivar)
  updateNote: async (id, noteData) => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Error al actualizar la nota');
    return await response.json();
  },

  // Eliminar una nota físicamente
  deleteNote: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la nota');
    return await response.json();
  }
};