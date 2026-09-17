import { loadData, saveData } from "../save.js";

const STORAGE_KEY = "files";

let files = loadData(STORAGE_KEY, []);

export function getFiles() {
    return files;
}

export function addFile(
    name,
    type = "",
    subject = "",
    url = ""
) {
    const file = {
        id: crypto.randomUUID(),
        name,
        type,
        subject,
        url,
        createdAt: Date.now()
    };

    files.push(file);
    saveData(STORAGE_KEY, files);

    return file;
}

export function updateFile(id, changes) {
    const file = files.find(
        item => item.id === id
    );

    if (!file) {
        return null;
    }

    Object.assign(file, changes);

    saveData(STORAGE_KEY, files);

    return file;
}

export function deleteFile(id) {
    files = files.filter(
        item => item.id !== id
    );

    saveData(STORAGE_KEY, files);
}