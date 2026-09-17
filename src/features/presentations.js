import { loadData, saveData } from "../save.js";

const STORAGE_KEY = "presentations";

let presentations = loadData(STORAGE_KEY, []);

export function getPresentations() {
    return presentations;
}

export function addPresentation(
    title,
    subject = "",
    date = "",
    description = ""
) {
    const presentation = {
        id: crypto.randomUUID(),
        title,
        subject,
        date,
        description,
        createdAt: Date.now()
    };

    presentations.push(presentation);
    saveData(STORAGE_KEY, presentations);

    return presentation;
}

export function updatePresentation(id, changes) {
    const presentation = presentations.find(
        item => item.id === id
    );

    if (!presentation) {
        return null;
    }

    Object.assign(presentation, changes);

    saveData(STORAGE_KEY, presentations);

    return presentation;
}

export function deletePresentation(id) {
    presentations = presentations.filter(
        item => item.id !== id
    );

    saveData(STORAGE_KEY, presentations);
}