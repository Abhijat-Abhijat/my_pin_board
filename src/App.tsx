import React, { useEffect, useState } from "react";
import { X, Pin, Save, BadgePlus, Image } from "lucide-react";
import "./App.css";

const App = () => {
  interface Note {
    id: number;
    text: string;
    x: number;
    y: number;
    pinned: boolean;
    image?: string;
  }
  // use-states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes
      ? JSON.parse(savedNotes)
      : [
          {
            id: 1,
            text: "To edit the note click on it . To save just press enter",
            x: 120,
            y: 120,
            pinned: false,
          },
        ];
  });

  // use-effects
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // functions for drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    if (notes.find((note) => note.id === id && note.pinned)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", id.toString());
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");

    const updatedNotes = notes.map((note) => {
      if (note.id === parseInt(draggedId)) {
        if (!note.pinned) {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          return { ...note, x: offsetX - 100, y: offsetY - 100 };
        }
      }
      return note;
    });

    setNotes(updatedNotes);
  };
  // functions for adding
  const addNote = () => {
    const newNoteId = notes.length + 1;
    const newNote = {
      id: newNoteId,
      text: `Add Text`,
      x: 50,
      y: 50,
      pinned: false,
    };
    setNotes([...notes, newNote]);
  };
  // functions for deleting
  const deleteNote = (id: number) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
  };

  // functions for editing
  const handleTextClick = (note: Note) => {
    const {
      id = 0,
      text = "",
      x = 0,
      y = 0,
      pinned = false,
      image = "",
    } = note;

    setEditingNote({
      id,
      text,
      x,
      y,
      pinned,
      image,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        text: e.target.value,
        id: editingNote.id || 0,
      });
    }
  };

  const saveChanges = () => {
    if (editingNote) {
      const updatedNotes = notes.map((note) =>
        note.id === editingNote.id ? editingNote : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  };

  // functions for pinning
  const togglePin = (id: number) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
    setNotes(updatedNotes);
  };

  // functions for uploading images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event.target?.result) {
          const newNoteId = notes.length + 1;
          const newNote: Note = {
            id: newNoteId,
            text: "Uploaded Image",
            image: event.target.result as string,
            x: 150,
            y: 150,
            pinned: false,
          };
          setNotes([...notes, newNote]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="App" onDragOver={handleDragOver} onDrop={handleDrop}>
      <h1>Sticky Notes</h1>
      <button onClick={addNote} className="addNew">
        <BadgePlus color="#DBB73F" />
      </button>
      <label className="addNew addNewImage">
        <input type="file" onChange={handleFileUpload} accept="image/*" />
        <Image color="#DBB73F" />
      </label>

      {notes.map((note) => (
        <div
          key={note.id}
          className="sticky-note"
          draggable
          onDragStart={(e) => handleDragStart(e, note.id)}
          style={{
            top: note.y + "px",
            left: note.x + "px",
            backgroundColor: note.pinned ? "lightblue" : "yellow",
            cursor: note.pinned ? "default" : "grab",
            zIndex: note.pinned ? 2 : 1,
          }}
        >
          {note.image && <img src={note.image} alt="note" />}
          {editingNote && editingNote.id === note.id ? (
            <div>
              <textarea
                value={editingNote.text}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                onKeyDown={handleKeyPress}
              />
            </div>
          ) : (
            <div onClick={() => handleTextClick(note)}>
              {note.text && <p>{note.text}</p>}
            </div>
          )}
          <div className="button">
            <button onClick={() => deleteNote(note.id)} className="delete-btn">
              <X />
            </button>
            {editingNote && editingNote.id === note.id && (
              <button onClick={saveChanges}>
                <Save />
              </button>
            )}
            <button
              onClick={() => togglePin(note.id)}
              style={{ cursor: "pointer" }}
            >
              <Pin />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
