const STORAGE_PREFIX = "schulorganizer_";

function getKey(key) {
    return `${STORAGE_PREFIX}${key}`;
}

export function set(key, value) {
    try {
        localStorage.setItem(
            getKey(key),
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            "[Schulorganizer] Fehler beim Speichern:",
            error
        );

        return false;
    }
}

export function get(key, fallback = null) {
    try {
        const stored = localStorage.getItem(
            getKey(key)
        );

        if (stored === null) {
            return fallback;
        }

        return JSON.parse(stored);
    } catch (error) {
        console.error(
            "[Schulorganizer] Fehler beim Laden:",
            error
        );

        return fallback;
    }
}

export function remove(key) {
    try {
        localStorage.removeItem(
            getKey(key)
        );

        return true;
    } catch (error) {
        console.error(
            "[Schulorganizer] Fehler beim Löschen:",
            error
        );

        return false;
    }
}

export function exists(key) {
    return localStorage.getItem(
        getKey(key)
    ) !== null;
}

export function clear() {
    try {
        const keys = [];

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {
            const key = localStorage.key(i);

            if (key?.startsWith(STORAGE_PREFIX)) {
                keys.push(key);
            }
        }

        keys.forEach(key => {
            localStorage.removeItem(key);
        });

        return true;
    } catch (error) {
        console.error(
            "[Schulorganizer] Fehler beim Leeren des Speichers:",
            error
        );

        return false;
    }
}