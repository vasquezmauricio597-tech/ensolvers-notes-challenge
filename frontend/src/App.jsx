import React, { useState, useEffect } from 'react';
import { apiService } from './api';
import './index.css'; // <-- Obliga a Vite a renderizar Tailwind CSS en el navegador

function App() {
  // Estados de control de la UI y datos
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' o 'archived'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados del Formulario (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Traer las notas desde FastAPI
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('No se pudo conectar con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Procesar Guardar (Creación o Edición)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const noteData = {
      title,
      content,
      is_archived: editingNote ? editingNote.is_archived : false,
      tags: tags
    };

    try {
      if (editingNote) {
        await apiService.updateNote(editingNote.id, noteData);
      } else {
        await apiService.createNote(noteData);
      }
      closeModal();
      fetchNotes();
    } catch (err) {
      alert('Error al guardar la nota. Revisa la terminal del backend.');
    }
  };

  // Archivar o Desarchivar una nota
  const toggleArchive = async (note) => {
    try {
      await apiService.updateNote(note.id, {
        title: note.title,
        content: note.content,
        is_archived: !note.is_archived,
        tags: note.tags ? note.tags.map(t => t.name || t) : []
      });
      fetchNotes();
    } catch (err) {
      alert('Error al cambiar el estado de la nota.');
    }
  };

  // Borrar nota
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta nota?')) return;
    try {
      await apiService.deleteNote(id);
      fetchNotes();
    } catch (err) {
      alert('Error al eliminar la nota.');
    }
  };

  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setTagsInput(note.tags ? note.tags.map(t => t.name || t).join(', ') : '');
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setTagsInput('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  // Filtrado rápido en memoria
  const filteredNotes = notes.filter(note => {
    const matchesTab = activeTab === 'active' ? !note.is_archived : note.is_archived;
    if (selectedCategory === 'All') return matchesTab;
    const noteTagNames = note.tags ? note.tags.map(t => (t.name || t).toLowerCase()) : [];
    return matchesTab && noteTagNames.includes(selectedCategory.toLowerCase());
  });

  // Mapear categorías dinámicas para el sidebar
  const allCategories = ['All', ...new Set(
    notes.flatMap(note => note.tags ? note.tags.map(t => t.name || t) : [])
  )];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          📝 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Ensolvers Notes</span>
        </h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-sm text-sm"
        >
          + Nueva Nota
        </button>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Izquierdo */}
        <section className="md:col-span-1 space-y-6">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex md:flex-col gap-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'active' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📂 Notas Activas
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'archived' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📦 Archivadas
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtrar por Categoría</h3>
            <div className="flex flex-wrap md:flex-col gap-1">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition text-left truncate ${
                    selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? '🏷️ Mostrar Todas' : `# ${cat}`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Panel de Notas Derecho */}
        <section className="md:col-span-3">
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-4">
              ⚠️ {error} - Recuerda ejecutar el backend con tu entorno virtual activo.
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando notas...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-400">
              <p className="text-lg font-medium mb-1">No hay notas en esta sección</p>
              <p className="text-xs text-slate-400">Crea una nota o cambia los filtros del panel lateral.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between p-5">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{note.title}</h2>
                      <div className="flex gap-2 text-sm cursor-pointer">
                        <button onClick={() => openModal(note)} className="hover:scale-110 transition" title="Editar">✏️</button>
                        <button onClick={() => toggleArchive(note)} className="hover:scale-110 transition" title={note.is_archived ? "Desarchivar" : "Archivar"}>
                          {note.is_archived ? "📂" : "📦"}
                        </button>
                        <button onClick={() => handleDelete(note.id)} className="hover:scale-110 transition text-red-500" title="Eliminar">🗑️</button>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-line line-clamp-4 mb-4">{note.content}</p>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100">
                      {note.tags.map((tag, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          #{tag.name || tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingNote ? 'Editar Nota' : 'Crear Nueva Nota'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contenido</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categorías (Separadas por comas)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ej. trabajo, urgente, ideas"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                >
                  {editingNote ? 'Guardar Cambios' : 'Crear Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;