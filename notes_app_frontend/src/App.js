import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import CalendarView from './components/CalendarView';
import MusicPlayer from './components/MusicPlayer';

/**
 * Monochrome Theme Tokens are defined via CSS variables in App.css.
 * All interactive accents use black/white and neutral grays only.
 */

// Helpers
const uuid = () => Math.random().toString(36).slice(2, 10);

/**
 * Note shape
 * id: string
 * title: string
 * content: string
 * createdAt: number
 * updatedAt: number
 */

// PUBLIC_INTERFACE
export default function App() {
  /** Theme handling with persistent preference (light/dark) */
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  /** Notes state in-memory; persisted to localStorage for demo usability */
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem('notes-demo');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('notes-demo', JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes]);

  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'

  const activeNote = useMemo(() => notes.find((n) => n.id === activeId) || null, [notes, activeId]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, query]);

  // PUBLIC_INTERFACE
  const openCreateModal = () => {
    setDraft({ title: '', content: '' });
    setModalMode('create');
    setModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const openEditModal = (note) => {
    setDraft({ title: note.title, content: note.content });
    setModalMode('edit');
    setActiveId(note.id);
    setModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const closeModal = () => {
    setModalOpen(false);
    setDraft({ title: '', content: '' });
  };

  // PUBLIC_INTERFACE
  const saveDraft = () => {
    if (!draft.title.trim()) {
      alert('Please provide a title.');
      return;
    }
    if (modalMode === 'create') {
      const newNote = {
        id: uuid(),
        title: draft.title.trim(),
        content: draft.content.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveId(newNote.id);
    } else if (modalMode === 'edit' && activeNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === activeNote.id ? { ...n, title: draft.title.trim(), content: draft.content.trim(), updatedAt: Date.now() } : n))
      );
    }
    closeModal();
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    const confirmed = window.confirm('Delete this note? This cannot be undone.');
    if (!confirmed) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) setActiveId(null);
  };

  // PUBLIC_INTERFACE
  const selectNote = (id) => setActiveId(id);

  // PUBLIC_INTERFACE
  const getEnvConfig = () => {
    /**
     * Placeholder to demonstrate respect for env variables for future API use.
     * No network calls are made in this in-memory version.
     */
    return {
      apiBase: process.env.REACT_APP_API_BASE,
      backendUrl: process.env.REACT_APP_BACKEND_URL,
      frontendUrl: process.env.REACT_APP_FRONTEND_URL,
      wsUrl: process.env.REACT_APP_WS_URL,
      nodeEnv: process.env.REACT_APP_NODE_ENV,
    };
  };

  // Initialize demo data if empty for better first-run experience
  useEffect(() => {
    if (notes.length === 0) {
      const seed = [
        {
          id: uuid(),
          title: 'Welcome to Notes',
          content: 'This is your personal notes app. Create, edit, and delete notes with ease.',
          createdAt: Date.now() - 1000 * 60 * 60,
          updatedAt: Date.now() - 1000 * 60 * 30,
        },
        {
          id: uuid(),
          title: 'Monochrome Theme',
          content: 'Black-and-white palette with neutral grays, high contrast, and smooth transitions.',
          createdAt: Date.now() - 1000 * 60 * 20,
          updatedAt: Date.now() - 1000 * 60 * 10,
        },
      ];
      setNotes(seed);
      setActiveId(seed[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString();

  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem('nav-active-view') || 'notes'; // 'notes' | 'calendar' | 'music'
    } catch {
      return 'notes';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nav-active-view', activeView);
    } catch {
      // ignore
    }
  }, [activeView]);

  return (
    <div className="App">
      <header className="ocean-header sheen">
        <div className="ocean-header-content">
          <div className="brand">
            <span className="brand-logo" aria-hidden>🗒️</span>
            <div className="brand-text">
              <h1 className="brand-title">Personal Notes</h1>
              <p className="brand-subtitle">Organize your thoughts effortlessly</p>
            </div>
          </div>
          <div className="header-actions">
            <nav className="top-nav" aria-label="Primary">
              <button
                className={`ocean-btn ${activeView === 'notes' ? 'primary' : 'secondary'}`}
                onClick={() => setActiveView('notes')}
                aria-current={activeView === 'notes' ? 'page' : undefined}
              >
                Notes
              </button>
              <button
                className={`ocean-btn ${activeView === 'calendar' ? 'primary' : 'secondary'}`}
                onClick={() => setActiveView('calendar')}
                aria-current={activeView === 'calendar' ? 'page' : undefined}
              >
                Calendar
              </button>
              <button
                className={`ocean-btn ${activeView === 'music' ? 'primary' : 'secondary'}`}
                onClick={() => setActiveView('music')}
                aria-current={activeView === 'music' ? 'page' : undefined}
              >
                Music
              </button>
            </nav>
            <div className="search-wrap" style={{ display: activeView === 'notes' ? 'block' : 'none' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
                placeholder="Search notes..."
                aria-label="Search notes"
              />
            </div>
            <button
              className="theme-toggle ocean-btn ghost"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {activeView === 'notes' && (
        <main className="ocean-main">
          <aside className="ocean-sidebar sheen" aria-label="Notes navigation">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Your Notes</h2>
              <span className="sidebar-count">{filteredNotes.length}</span>
            </div>
            <ul className="note-list">
              {filteredNotes.map((n) => (
                <li
                  key={n.id}
                  className={`note-list-item hover-elevate ${activeId === n.id ? 'active' : ''}`}
                  onClick={() => selectNote(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') selectNote(n.id);
                  }}
                >
                  <div className="note-item-title">{n.title || 'Untitled'}</div>
                  <div className="note-item-meta">{formatDate(n.updatedAt)}</div>
                </li>
              ))}
              {filteredNotes.length === 0 && (
                <li className="note-empty">No notes found. Create your first note!</li>
              )}
            </ul>
          </aside>

          <section className="ocean-content sheen streak" aria-live="polite">
            {activeNote ? (
              <div className="note-view">
                <div className="note-view-header">
                  <h2 className="note-view-title">{activeNote.title || 'Untitled'}</h2>
                  <div className="note-view-actions">
                    <button
                      className="ocean-btn secondary"
                      onClick={() => openEditModal(activeNote)}
                      aria-label="Edit note"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="ocean-btn danger"
                      onClick={() => deleteNote(activeNote.id)}
                      aria-label="Delete note"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div className="note-view-meta">
                  <span>Created: {formatDate(activeNote.createdAt)}</span>
                  <span>Updated: {formatDate(activeNote.updatedAt)}</span>
                </div>
                <article className="note-view-content">
                  {activeNote.content ? activeNote.content : <em>No content</em>}
                </article>
              </div>
            ) : (
              <div className="note-placeholder">
                <div className="placeholder-card">
                  <h3>Welcome!</h3>
                  <p>Select a note from the left, or create a new one to get started.</p>
                  <button className="ocean-btn primary" onClick={openCreateModal}>
                    ➕ Create Note
                  </button>
                </div>
              </div>
            )}
          </section>

          <button
            className="fab-create"
            onClick={openCreateModal}
            aria-label="Create a new note"
            title="Create note"
          >
            +
          </button>
        </main>
      )}

      {activeView === 'calendar' && (
        <main className="ocean-main" style={{ gridTemplateColumns: '1fr' }}>
          <section className="ocean-content sheen streak">
            <CalendarView />
          </section>
        </main>
      )}

      {activeView === 'music' && (
        <main className="ocean-main" style={{ gridTemplateColumns: '1fr' }}>
          <section className="ocean-content">
            <MusicPlayer />
          </section>
        </main>
      )}

      {isModalOpen && (
        <div className="ocean-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ocean-modal sheen">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'create' ? 'Create Note' : 'Edit Note'}
              </h3>
              <button className="ocean-btn ghost" onClick={closeModal} aria-label="Close modal">
                ✖
              </button>
            </div>
            <div className="modal-body">
              <label className="field">
                <span className="field-label">Title</span>
                <input
                  className="field-input"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </label>
              <label className="field">
                <span className="field-label">Content</span>
                <textarea
                  className="field-textarea"
                  rows={8}
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  placeholder="Write your note here..."
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="ocean-btn ghost" onClick={closeModal}>
                Cancel
              </button>
              <button className="ocean-btn primary" onClick={saveDraft}>
                {modalMode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
