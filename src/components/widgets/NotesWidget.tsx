import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { Loading, Error } from '../shared/LoadingError';
import { retrieveWidgetSettings, storeWidgetSettings } from '../../utils/storageService';

interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string; // ISO date string
}

const NotesWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Auto-save when editing
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (isEditing && activeNoteId && (editTitle || editContent)) {
        saveCurrentNote();
      }
    }, 10000); // Auto-save every 10 seconds while editing

    return () => clearInterval(saveInterval);
  }, [isEditing, activeNoteId, editTitle, editContent]);

  const loadNotes = () => {
    try {
      setLoading(true);
      const storedNotes = retrieveWidgetSettings<Note[]>('notes') || [];
      setNotes(storedNotes);
      
      // If there are notes and none is active, select the first one
      if (storedNotes.length > 0 && !activeNoteId) {
        const mostRecentNote = storedNotes.reduce((latest, note) => 
          new Date(note.lastEdited) > new Date(latest.lastEdited) ? note : latest, 
          storedNotes[0]
        );
        setActiveNoteId(mostRecentNote.id);
        setEditTitle(mostRecentNote.title);
        setEditContent(mostRecentNote.content);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
      setLoading(false);
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      lastEdited: new Date().toISOString()
    };

    setNotes(prevNotes => {
      const updatedNotes = [newNote, ...prevNotes];
      storeWidgetSettings('notes', updatedNotes);
      return updatedNotes;
    });

    setActiveNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
  };

  const saveCurrentNote = () => {
    if (!activeNoteId) return;

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            title: editTitle || 'Untitled Note',
            content: editContent,
            lastEdited: new Date().toISOString()
          };
        }
        return note;
      });
      storeWidgetSettings('notes', updatedNotes);
      return updatedNotes;
    });
  };

  const deleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prevNotes => {
        const filteredNotes = prevNotes.filter(note => note.id !== noteId);
        storeWidgetSettings('notes', filteredNotes);
        
        // If we're deleting the active note, select a different one
        if (noteId === activeNoteId) {
          if (filteredNotes.length > 0) {
            const newActiveNote = filteredNotes[0];
            setActiveNoteId(newActiveNote.id);
            setEditTitle(newActiveNote.title);
            setEditContent(newActiveNote.content);
          } else {
            setActiveNoteId(null);
            setEditTitle('');
            setEditContent('');
            setIsEditing(false);
          }
        }
        
        return filteredNotes;
      });
    }
  };

  const selectNote = (noteId: string) => {
    // Save current note before switching
    if (isEditing && activeNoteId) {
      saveCurrentNote();
    }

    const selectedNote = notes.find(note => note.id === noteId);
    if (selectedNote) {
      setActiveNoteId(noteId);
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setIsEditing(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getExcerpt = (content: string, maxLength: number = 60): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const filteredNotes = searchTerm 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : notes;

  if (loading) {
    return <Loading message="Loading notes..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadNotes} />;
  }

  const activeNote = notes.find(note => note.id === activeNoteId);

  return (
    <div className={styles.notesWidget}>
      <div className={styles.notesSidebar}>
        <div className={styles.notesControls}>
          <button 
            className={styles.iconButton}
            onClick={createNewNote}
            aria-label="New note"
            title="New note"
          >
            <span role="img" aria-hidden="true">➕</span>
          </button>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredNotes.length === 0 ? (
          <div className={styles.noNotes}>
            {searchTerm ? 'No notes matching your search' : 'No notes yet. Create one?'}
          </div>
        ) : (
          <ul className={styles.noteList}>
            {filteredNotes.map(note => (
              <li 
                key={note.id} 
                className={`${styles.noteListItem} ${note.id === activeNoteId ? styles.activeNote : ''}`}
                onClick={() => selectNote(note.id)}
              >
                <div className={styles.noteListItemContent}>
                  <div className={styles.noteListItemTitle}>{note.title}</div>
                  <div className={styles.noteListItemPreview}>{getExcerpt(note.content)}</div>
                  <div className={styles.noteListItemDate}>{formatDate(note.lastEdited)}</div>
                </div>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  aria-label="Delete note"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className={styles.noteEditor}>
        {activeNote ? (
          <>
            <div className={styles.noteEditorControls}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    className={styles.noteTitleInput}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Note title"
                  />
                  <button
                    className={styles.saveButton}
                    onClick={() => {
                      saveCurrentNote();
                      setIsEditing(false);
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.noteViewTitle}>{activeNote.title}</div>
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            
            {isEditing ? (
              <textarea
                className={styles.noteContentInput}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Write your note here..."
              />
            ) : (
              <div className={styles.noteContent}>
                {activeNote.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Select a note or create a new one</p>
            <button onClick={createNewNote} className={styles.createButton}>
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesWidget;
