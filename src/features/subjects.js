import { loadData, saveData } from "../save.js";

const STORAGE_KEY = "subjects";

let subjects = loadData(STORAGE_KEY, []);

export function getSubjects() {
    return subjects;
}

export function addSubject(name) {
    const trimmedName = name.trim();

    if (!trimmedName) {
        return null;
    }

    const existing = subjects.find(
        subject =>
            subject.name.toLowerCase() ===
            trimmedName.toLowerCase()
    );

    if (existing) {
        return existing;
    }

    const subject = {
        id: crypto.randomUUID(),
        name: trimmedName,
        createdAt: Date.now()
    };

    subjects.push(subject);

    saveData(STORAGE_KEY, subjects);

    return subject;
}

export function deleteSubject(id) {
    subjects = subjects.filter(
        subject => subject.id !== id
    );

    saveData(STORAGE_KEY, subjects);
}