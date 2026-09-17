import {
    set,
    get,
    remove,
    exists,
    clear
} from "./data/storage.js";

export function saveData(key, data) {
    return set(key, data);
}

export function loadData(key, fallback = []) {
    return get(key, fallback);
}

export function removeData(key) {
    return remove(key);
}

export function hasData(key) {
    return exists(key);
}

export function clearData() {
    return clear();
}