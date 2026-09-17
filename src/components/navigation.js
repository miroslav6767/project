const navigationButtons =
    document.querySelectorAll(".nav-item");

const pages = {
    dashboard: {
        title: "Übersicht",
        description:
            "Alles Wichtige auf einen Blick."
    },

    tasks: {
        title: "Aufgaben",
        description:
            "Verwalte deine schulischen Aufgaben."
    },

    presentations: {
        title: "Präsentationen",
        description:
            "Speichere und verwalte deine Präsentationen."
    },

    notes: {
        title: "Notizen",
        description:
            "Speichere wichtige Informationen."
    },

    files: {
        title: "Dateien",
        description:
            "Verwalte deine schulischen Dateien."
    },

    subjects: {
        title: "Fächer",
        description:
            "Organisiere deine Inhalte nach Fach."
    }
};

let currentPage = "dashboard";

const pageTitle =
    document.querySelector("#pageTitle");

const pageDescription =
    document.querySelector("#pageDescription");

export function getCurrentPage() {
    return currentPage;
}

export function navigateTo(pageName) {
    if (!pages[pageName]) {
        return;
    }

    currentPage = pageName;

    pageTitle.textContent =
        pages[pageName].title;

    pageDescription.textContent =
        pages[pageName].description;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const target =
        document.querySelector(`#${pageName}Page`);

    target?.classList.add("active-page");

    navigationButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    window.dispatchEvent(
        new CustomEvent("pagechange", {
            detail: {
                page: pageName
            }
        })
    );
}

navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });
});