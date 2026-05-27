import React, { useState, useEffect } from 'react';
import { apiService } from './api';
import './index.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotes();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

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
      alert('Error saving the note. Check the backend terminal.');
    }
  };

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
      alert('Error updating note status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this note?')) return;
    try {
      await apiService.deleteNote(id);
      fetchNotes();
    } catch (err) {
      alert('Error deleting the note.');
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

  const filteredNotes = notes.filter(note => {
    const matchesTab = activeTab === 'active' ? !note.is_archived : note.is_archived;
    if (selectedCategory === 'All') return matchesTab;
    const noteTagNames = note.tags ? note.tags.map(t => (t.name || t).toLowerCase()) : [];
    return matchesTab && noteTagNames.includes(selectedCategory.toLowerCase());
  });

  const allCategories = ['All', ...new Set(
    notes.flatMap(note => note.tags ? note.tags.map(t => t.name || t) : [])
  )];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          📝 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Ensolvers Notes</span>
        </h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition shadow-sm text-sm"
        >
          + New Note
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <section className="md:col-span-1 space-y-6">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex md:flex-col gap-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'active' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📂 Active Notes
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'archived' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📦 Archived
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Category</h3>
            <div className="flex flex-wrap md:flex-col gap-1">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition text-left truncate ${
                    selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? '🏷️ Show All' : `# ${cat}`}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="md:col-span-3">
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-4">
              ⚠️ {error} - Remember to run the backend with your virtual environment active.
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-400">
              <p className="text-lg font-medium mb-1">No notes in this section</p>
              <p className="text-xs text-slate-400">Create a note or change the filters in the sidebar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between p-5">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{note.title}</h2>
                      <div className="flex gap-2 text-sm cursor-pointer">
                        <button onClick={() => openModal(note)} className="hover:scale-110 transition" title="Edit">✏️</button>
                        <button onClick={() => toggleArchive(note)} className="hover:scale-110 transition" title={note.is_archived ? "Unarchive" : "Archive"}>
                          {note.is_archived ? "📂" : "📦"}
                        </button>
                        <button onClick={() => handleDelete(note.id)} className="hover:scale-110 transition text-red-500" title="Delete">🗑️</button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categories (Comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. work, urgent, ideas"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
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