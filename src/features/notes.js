import { loadData, saveData } from "../save.js";

const STORAGE_KEY = "notes";

let notes = loadData(STORAGE_KEY, []);

export function getNotes() {
    return notes;
}

export function addNote(
    title,
    content,
    subject = ""
) {
    const note = {
        id: crypto.randomUUID(),
        title,
        content,
        subject,
        createdAt: Date.now()
    };

    notes.push(note);
    saveData(STORAGE_KEY, notes);

    return note;
}

export function updateNote(id, changes) {
    const note = notes.find(
        item => item.id === id
    );

    if (!note) {
        return null;
    }

    Object.assign(note, changes);

    saveData(STORAGE_KEY, notes);

    return note;
}

export function deleteNote(id) {
    notes = notes.filter(
        item => item.id !== id
    );

    saveData(STORAGE_KEY, notes);
}