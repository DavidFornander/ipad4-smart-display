import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

const NotesWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load notes from localStorage
    try {
      const savedNotes = localStorage.getItem('dashboard_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      setError('Failed to load notes from storage');
    }
  }, []);
  
  useEffect(() => {
    // Save notes to localStorage whenever they change
    try {
      localStorage.setItem('dashboard_notes', JSON.stringify(notes));
    } catch (e) {
      setError('Failed to save notes to storage');
    }
  }, [notes]);
  
  const addNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteObj = {
      id: Date.now().toString(),
      text: newNote,
      createdAt: new Date().toISOString()
    };
    
    setNotes([newNoteObj].concat(notes));
    setNewNote('');
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };
  
  return (
    <div className="widget notes-widget">
      <div className="widget-inner">
        <h3 className="widget-title">Notes</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="note-input-container">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            className="note-input"
          />
          <button onClick={addNote} className="add-note-btn">Add</button>
        </div>
        
        <ul className="notes-list">
          {notes.map(note => (
            <li key={note.id} className="note-item">
              <div className="note-content">{note.text}</div>
              <div className="note-meta">
                <span className="note-date">{formatDate(note.createdAt)}</span>
                <button 
                  onClick={() => deleteNote(note.id)} 
                  className="delete-note-btn"
                  aria-label="Delete note"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotesWidget;
