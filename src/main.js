import "./style.css";

import {
    getTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask
} from "./features/tasks.js";

import {
    getPresentations,
    addPresentation,
    updatePresentation,
    deletePresentation
} from "./features/presentations.js";

import {
    getNotes,
    addNote,
    updateNote,
    deleteNote
} from "./features/notes.js";

import {
    getFiles,
    addFile,
    updateFile,
    deleteFile
} from "./features/files.js";

import {
    getSubjects,
    addSubject,
    deleteSubject
} from "./features/subjects.js";

import {
    openModal,
    closeModal,
    createField,
    createSelect
} from "./components/modal.js";

import {
    getCurrentPage,
    navigateTo
} from "./components/navigation.js";

import {
    success,
    error
} from "./components/notifications.js";


const addButton = document.querySelector("#addButton");

const taskCount = document.querySelector("#taskCount");
const presentationCount = document.querySelector("#presentationCount");
const noteCount = document.querySelector("#noteCount");
const fileCount = document.querySelector("#fileCount");

const recentTasks = document.querySelector("#recentTasks");
const taskList = document.querySelector("#taskList");
const presentationList =
    document.querySelector("#presentationList");
const noteList = document.querySelector("#noteList");
const fileList = document.querySelector("#fileList");
const subjectList = document.querySelector("#subjectList");


/*
|--------------------------------------------------------------------------
| Utilities
|--------------------------------------------------------------------------
*/

function createElement(tag, className = "", text = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}


function formatDate(date) {
    if (!date) {
        return "Kein Termin";
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(parsed);
}


function formatCreatedDate(timestamp) {
    if (!timestamp) {
        return "";
    }

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(timestamp));
}


function createActionButton(text, className = "") {
    const button = createElement(
        "button",
        `item-action ${className}`,
        text
    );

    button.type = "button";

    return button;
}


function createItemActions({
    onEdit,
    onDelete
}) {
    const actions = createElement(
        "div",
        "item-actions"
    );

    const editButton = createActionButton(
        "Bearbeiten"
    );

    editButton.addEventListener(
        "click",
        onEdit
    );

    const deleteButton = createActionButton(
        "Löschen",
        "danger-action"
    );

    deleteButton.addEventListener(
        "click",
        onDelete
    );

    actions.append(
        editButton,
        deleteButton
    );

    return actions;
}


function showEmptyState(container, text) {
    container.replaceChildren();

    const empty = createElement(
        "div",
        "empty-state",
        text
    );

    container.appendChild(empty);
}


function getSubjectOptions() {
    return [
        {
            value: "",
            label: "Kein Fach"
        },
        ...getSubjects().map(subject => ({
            value: subject.name,
            label: subject.name
        }))
    ];
}


function confirmDelete(message) {
    return window.confirm(message);
}


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

function renderDashboard() {
    const tasks = getTasks();
    const presentations = getPresentations();
    const notes = getNotes();
    const files = getFiles();

    const openTasks = tasks.filter(
        task => !task.completed
    );

    taskCount.textContent = openTasks.length;
    presentationCount.textContent =
        presentations.length;
    noteCount.textContent = notes.length;
    fileCount.textContent = files.length;

    renderRecentTasks();
}


function renderRecentTasks() {
    const tasks = getTasks()
        .filter(task => !task.completed)
        .sort((a, b) => {
            if (!a.deadline) {
                return 1;
            }

            if (!b.deadline) {
                return -1;
            }

            return a.deadline.localeCompare(
                b.deadline
            );
        })
        .slice(0, 5);

    if (tasks.length === 0) {
        showEmptyState(
            recentTasks,
            "Keine offenen Aufgaben vorhanden."
        );

        return;
    }

    recentTasks.replaceChildren();

    tasks.forEach(task => {
        recentTasks.appendChild(
            createTaskElement(task)
        );
    });
}


/*
|--------------------------------------------------------------------------
| Tasks
|--------------------------------------------------------------------------
*/

function createTaskElement(task) {
    const item = createElement(
        "article",
        "list-item"
    );

    const main = createElement(
        "div",
        "item-main"
    );

    const checkbox = createElement(
        "input",
        "task-checkbox"
    );

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
        "aria-label",
        `${task.title} erledigt`
    );

    checkbox.addEventListener(
        "change",
        () => {
            toggleTask(task.id);

            renderAll();

            success(
                task.completed
                    ? "Aufgabe erledigt."
                    : "Aufgabe wieder geöffnet."
            );
        }
    );

    const content = createElement(
        "div",
        "item-content"
    );

    const title = createElement(
        "h4",
        "",
        task.title
    );

    if (task.completed) {
        title.classList.add(
            "completed-text"
        );
    }

    const meta = createElement(
        "div",
        "item-meta"
    );

    if (task.subject) {
        meta.appendChild(
            createElement(
                "span",
                "item-tag",
                task.subject
            )
        );
    }

    if (task.deadline) {
        meta.appendChild(
            createElement(
                "span",
                "",
                `Fällig: ${formatDate(task.deadline)}`
            )
        );
    }

    content.append(
        title,
        meta
    );

    main.append(
        checkbox,
        content
    );

    const actions = createItemActions({
        onEdit: () => openTaskModal(task),

        onDelete: () => {
            if (!confirmDelete(
                `Möchtest du "${task.title}" wirklich löschen?`
            )) {
                return;
            }

            deleteTask(task.id);

            renderAll();

            success("Aufgabe gelöscht.");
        }
    });

    item.append(
        main,
        actions
    );

    return item;
}


function renderTasks() {
    const tasks = getTasks();

    if (tasks.length === 0) {
        showEmptyState(
            taskList,
            "Keine Aufgaben vorhanden."
        );

        return;
    }

    taskList.replaceChildren();

    const sortedTasks = [...tasks].sort(
        (a, b) => {
            if (a.completed !== b.completed) {
                return a.completed
                    ? 1
                    : -1;
            }

            if (!a.deadline) {
                return 1;
            }

            if (!b.deadline) {
                return -1;
            }

            return a.deadline.localeCompare(
                b.deadline
            );
        }
    );

    sortedTasks.forEach(task => {
        taskList.appendChild(
            createTaskElement(task)
        );
    });
}


/*
|--------------------------------------------------------------------------
| Task modal
|--------------------------------------------------------------------------
*/

function openTaskModal(existingTask = null) {
    const isEditing = Boolean(existingTask);

    const form = createElement(
        "div",
        "modal-form"
    );

    const titleField = createField({
        label: "Titel",
        placeholder: "z. B. Mathe Hausaufgaben",
        value: existingTask?.title ?? "",
        name: "title",
        required: true
    });

    const subjectField = createSelect({
        label: "Fach",
        name: "subject",
        options: getSubjectOptions(),
        value: existingTask?.subject ?? ""
    });

    const deadlineField = createField({
        label: "Abgabetermin",
        type: "date",
        value: existingTask?.deadline ?? "",
        name: "deadline"
    });

    const priorityField = createSelect({
        label: "Priorität",
        name: "priority",
        options: [
            {
                value: "low",
                label: "Niedrig"
            },
            {
                value: "normal",
                label: "Normal"
            },
            {
                value: "high",
                label: "Hoch"
            }
        ],
        value: existingTask?.priority ?? "normal"
    });

    form.append(
        titleField,
        subjectField,
        deadlineField,
        priorityField
    );

    openModal({
        title: isEditing
            ? "Aufgabe bearbeiten"
            : "Neue Aufgabe",

        content: form,

        onSubmit: () => {
            const title =
                titleField.querySelector("input")
                    .value.trim();

            if (!title) {
                error(
                    "Bitte einen Titel eingeben."
                );

                return;
            }

            const subject =
                subjectField.querySelector("select")
                    .value;

            const deadline =
                deadlineField.querySelector("input")
                    .value;

            const priority =
                priorityField.querySelector("select")
                    .value;

            if (isEditing) {
                updateTask(
                    existingTask.id,
                    {
                        title,
                        subject,
                        deadline,
                        priority
                    }
                );

                success(
                    "Aufgabe aktualisiert."
                );
            } else {
                addTask(
                    title,
                    subject,
                    deadline
                );

                const tasks = getTasks();

                const created =
                    tasks[tasks.length - 1];

                if (created) {
                    updateTask(
                        created.id,
                        {
                            priority
                        }
                    );
                }

                success(
                    "Aufgabe hinzugefügt."
                );
            }

            closeModal();
            renderAll();
        }
    });
}


/*
|--------------------------------------------------------------------------
| Presentations
|--------------------------------------------------------------------------
*/

function createPresentationElement(
    presentation
) {
    const item = createElement(
        "article",
        "list-item"
    );

    const content = createElement(
        "div",
        "item-content"
    );

    const title = createElement(
        "h4",
        "",
        presentation.title
    );

    const meta = createElement(
        "div",
        "item-meta"
    );

    if (presentation.subject) {
        meta.appendChild(
            createElement(
                "span",
                "item-tag",
                presentation.subject
            )
        );
    }

    if (presentation.date) {
        meta.appendChild(
            createElement(
                "span",
                "",
                `Termin: ${formatDate(
                    presentation.date
                )}`
            )
        );
    }

    content.append(
        title,
        meta
    );

    if (presentation.description) {
        const description =
            createElement(
                "p",
                "item-description",
                presentation.description
            );

        content.appendChild(
            description
        );
    }

    const actions = createItemActions({
        onEdit: () =>
            openPresentationModal(
                presentation
            ),

        onDelete: () => {
            if (!confirmDelete(
                `Möchtest du "${presentation.title}" wirklich löschen?`
            )) {
                return;
            }

            deletePresentation(
                presentation.id
            );

            renderAll();

            success(
                "Präsentation gelöscht."
            );
        }
    });

    item.append(
        content,
        actions
    );

    return item;
}


function renderPresentations() {
    const presentations =
        getPresentations();

    if (presentations.length === 0) {
        showEmptyState(
            presentationList,
            "Keine Präsentationen vorhanden."
        );

        return;
    }

    presentationList.replaceChildren();

    [...presentations]
        .sort(
            (a, b) =>
                (a.date || "9999")
                    .localeCompare(
                        b.date || "9999"
                    )
        )
        .forEach(presentation => {
            presentationList.appendChild(
                createPresentationElement(
                    presentation
                )
            );
        });
}


function openPresentationModal(
    existingPresentation = null
) {
    const isEditing =
        Boolean(existingPresentation);

    const form = createElement(
        "div",
        "modal-form"
    );

    const titleField = createField({
        label: "Titel",
        placeholder:
            "z. B. Referat über die Französische Revolution",
        value:
            existingPresentation?.title ?? "",
        name: "title",
        required: true
    });

    const subjectField = createSelect({
        label: "Fach",
        name: "subject",
        options: getSubjectOptions(),
        value:
            existingPresentation?.subject ?? ""
    });

    const dateField = createField({
        label: "Präsentationstermin",
        type: "date",
        value:
            existingPresentation?.date ?? "",
        name: "date"
    });

    const descriptionField = createField({
        label: "Beschreibung",
        type: "textarea",
        placeholder:
            "Thema, wichtige Punkte oder Informationen...",
        value:
            existingPresentation?.description ?? "",
        name: "description"
    });

    form.append(
        titleField,
        subjectField,
        dateField,
        descriptionField
    );

    openModal({
        title: isEditing
            ? "Präsentation bearbeiten"
            : "Neue Präsentation",

        content: form,

        onSubmit: () => {
            const title =
                titleField.querySelector(
                    "input"
                ).value.trim();

            if (!title) {
                error(
                    "Bitte einen Titel eingeben."
                );

                return;
            }

            const subject =
                subjectField.querySelector(
                    "select"
                ).value;

            const date =
                dateField.querySelector(
                    "input"
                ).value;

            const description =
                descriptionField.querySelector(
                    "textarea"
                ).value.trim();

            if (isEditing) {
                updatePresentation(
                    existingPresentation.id,
                    {
                        title,
                        subject,
                        date,
                        description
                    }
                );

                success(
                    "Präsentation aktualisiert."
                );
            } else {
                addPresentation(
                    title,
                    subject,
                    date,
                    description
                );

                success(
                    "Präsentation hinzugefügt."
                );
            }

            closeModal();
            renderAll();
        }
    });
}


/*
|--------------------------------------------------------------------------
| Notes
|--------------------------------------------------------------------------
*/

function createNoteElement(note) {
    const item = createElement(
        "article",
        "list-item"
    );

    const content = createElement(
        "div",
        "item-content"
    );

    const title = createElement(
        "h4",
        "",
        note.title
    );

    const meta = createElement(
        "div",
        "item-meta"
    );

    if (note.subject) {
        meta.appendChild(
            createElement(
                "span",
                "item-tag",
                note.subject
            )
        );
    }

    if (note.createdAt) {
        meta.appendChild(
            createElement(
                "span",
                "",
                `Erstellt: ${formatCreatedDate(
                    note.createdAt
                )}`
            )
        );
    }

    content.append(
        title,
        meta
    );

    if (note.content) {
        const description =
            createElement(
                "p",
                "item-description",
                note.content
            );

        content.appendChild(
            description
        );
    }

    const actions = createItemActions({
        onEdit: () =>
            openNoteModal(note),

        onDelete: () => {
            if (!confirmDelete(
                `Möchtest du "${note.title}" wirklich löschen?`
            )) {
                return;
            }

            deleteNote(note.id);

            renderAll();

            success(
                "Notiz gelöscht."
            );
        }
    });

    item.append(
        content,
        actions
    );

    return item;
}


function renderNotes() {
    const notes = getNotes();

    if (notes.length === 0) {
        showEmptyState(
            noteList,
            "Keine Notizen vorhanden."
        );

        return;
    }

    noteList.replaceChildren();

    [...notes]
        .sort(
            (a, b) =>
                b.createdAt - a.createdAt
        )
        .forEach(note => {
            noteList.appendChild(
                createNoteElement(note)
            );
        });
}


function openNoteModal(
    existingNote = null
) {
    const isEditing =
        Boolean(existingNote);

    const form = createElement(
        "div",
        "modal-form"
    );

    const titleField = createField({
        label: "Titel",
        placeholder:
            "z. B. Wichtige Matheformeln",
        value:
            existingNote?.title ?? "",
        name: "title",
        required: true
    });

    const subjectField = createSelect({
        label: "Fach",
        name: "subject",
        options: getSubjectOptions(),
        value:
            existingNote?.subject ?? ""
    });

    const contentField = createField({
        label: "Notiz",
        type: "textarea",
        placeholder:
            "Schreibe deine Notiz hier...",
        value:
            existingNote?.content ?? "",
        name: "content",
        required: true
    });

    form.append(
        titleField,
        subjectField,
        contentField
    );

    openModal({
        title: isEditing
            ? "Notiz bearbeiten"
            : "Neue Notiz",

        content: form,

        onSubmit: () => {
            const title =
                titleField.querySelector(
                    "input"
                ).value.trim();

            const content =
                contentField.querySelector(
                    "textarea"
                ).value.trim();

            if (!title || !content) {
                error(
                    "Titel und Notiz dürfen nicht leer sein."
                );

                return;
            }

            const subject =
                subjectField.querySelector(
                    "select"
                ).value;

            if (isEditing) {
                updateNote(
                    existingNote.id,
                    {
                        title,
                        content,
                        subject
                    }
                );

                success(
                    "Notiz aktualisiert."
                );
            } else {
                addNote(
                    title,
                    content,
                    subject
                );

                success(
                    "Notiz hinzugefügt."
                );
            }

            closeModal();
            renderAll();
        }
    });
}


/*
|--------------------------------------------------------------------------
| Files
|--------------------------------------------------------------------------
*/

function createFileElement(file) {
    const item = createElement(
        "article",
        "list-item"
    );

    const content = createElement(
        "div",
        "item-content"
    );

    const title = createElement(
        "h4",
        "",
        file.name
    );

    const meta = createElement(
        "div",
        "item-meta"
    );

    if (file.type) {
        meta.appendChild(
            createElement(
                "span",
                "item-tag",
                file.type
            )
        );
    }

    if (file.subject) {
        meta.appendChild(
            createElement(
                "span",
                "item-tag",
                file.subject
            )
        );
    }

    content.append(
        title,
        meta
    );

    if (file.url) {
        const link = document.createElement(
            "a"
        );

        link.href = file.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent =
            "Datei öffnen";

        link.className =
            "item-link";

        content.appendChild(link);
    }

    const actions = createItemActions({
        onEdit: () =>
            openFileModal(file),

        onDelete: () => {
            if (!confirmDelete(
                `Möchtest du "${file.name}" wirklich löschen?`
            )) {
                return;
            }

            deleteFile(file.id);

            renderAll();

            success(
                "Datei gelöscht."
            );
        }
    });

    item.append(
        content,
        actions
    );

    return item;
}


function renderFiles() {
    const files = getFiles();

    if (files.length === 0) {
        showEmptyState(
            fileList,
            "Keine Dateien vorhanden."
        );

        return;
    }

    fileList.replaceChildren();

    [...files]
        .sort(
            (a, b) =>
                b.createdAt - a.createdAt
        )
        .forEach(file => {
            fileList.appendChild(
                createFileElement(file)
            );
        });
}


function openFileModal(
    existingFile = null
) {
    const isEditing =
        Boolean(existingFile);

    const form = createElement(
        "div",
        "modal-form"
    );

    const nameField = createField({
        label: "Dateiname",
        placeholder:
            "z. B. Referat-Geschichte.pdf",
        value:
            existingFile?.name ?? "",
        name: "name",
        required: true
    });

    const typeField = createSelect({
        label: "Dateityp",
        name: "type",
        options: [
            {
                value: "",
                label: "Nicht angegeben"
            },
            {
                value: "PDF",
                label: "PDF"
            },
            {
                value: "Dokument",
                label: "Dokument"
            },
            {
                value: "Präsentation",
                label: "Präsentation"
            },
            {
                value: "Bild",
                label: "Bild"
            },
            {
                value: "Sonstiges",
                label: "Sonstiges"
            }
        ],
        value:
            existingFile?.type ?? ""
    });

    const subjectField = createSelect({
        label: "Fach",
        name: "subject",
        options: getSubjectOptions(),
        value:
            existingFile?.subject ?? ""
    });

    const urlField = createField({
        label: "Link",
        type: "url",
        placeholder:
            "https://...",
        value:
            existingFile?.url ?? "",
        name: "url"
    });

    form.append(
        nameField,
        typeField,
        subjectField,
        urlField
    );

    openModal({
        title: isEditing
            ? "Datei bearbeiten"
            : "Neue Datei",

        content: form,

        onSubmit: () => {
            const name =
                nameField.querySelector(
                    "input"
                ).value.trim();

            if (!name) {
                error(
                    "Bitte einen Dateinamen eingeben."
                );

                return;
            }

            const type =
                typeField.querySelector(
                    "select"
                ).value;

            const subject =
                subjectField.querySelector(
                    "select"
                ).value;

            const url =
                urlField.querySelector(
                    "input"
                ).value.trim();

            if (isEditing) {
                updateFile(
                    existingFile.id,
                    {
                        name,
                        type,
                        subject,
                        url
                    }
                );

                success(
                    "Datei aktualisiert."
                );
            } else {
                addFile(
                    name,
                    type,
                    subject,
                    url
                );

                success(
                    "Datei hinzugefügt."
                );
            }

            closeModal();
            renderAll();
        }
    });
}


/*
|--------------------------------------------------------------------------
| Subjects
|--------------------------------------------------------------------------
*/

function createSubjectElement(subject) {
    const card = createElement(
        "article",
        "subject-card"
    );

    const name = createElement(
        "h4",
        "",
        subject.name
    );

    const taskAmount =
        getTasks().filter(
            task =>
                task.subject === subject.name
        ).length;

    const presentationAmount =
        getPresentations().filter(
            presentation =>
                presentation.subject ===
                subject.name
        ).length;

    const noteAmount =
        getNotes().filter(
            note =>
                note.subject === subject.name
        ).length;

    const info = createElement(
        "p",
        "",
        `${taskAmount} Aufgaben · ${presentationAmount} Präsentationen · ${noteAmount} Notizen`
    );

    const deleteButton =
        createActionButton(
            "Löschen",
            "danger-action"
        );

    deleteButton.addEventListener(
        "click",
        () => {
            if (!confirmDelete(
                `Möchtest du das Fach "${subject.name}" wirklich löschen?`
            )) {
                return;
            }

            deleteSubject(
                subject.id
            );

            renderAll();

            success(
                "Fach gelöscht."
            );
        }
    );

    card.append(
        name,
        info,
        deleteButton
    );

    return card;
}


function renderSubjects() {
    const subjects = getSubjects();

    if (subjects.length === 0) {
        showEmptyState(
            subjectList,
            "Keine Fächer vorhanden."
        );

        return;
    }

    subjectList.replaceChildren();

    subjects.forEach(subject => {
        subjectList.appendChild(
            createSubjectElement(
                subject
            )
        );
    });
}


function openSubjectModal() {
    const form = createElement(
        "div",
        "modal-form"
    );

    const nameField = createField({
        label: "Fachname",
        placeholder:
            "z. B. Mathematik",
        name: "name",
        required: true
    });

    form.appendChild(
        nameField
    );

    openModal({
        title: "Neues Fach",

        content: form,

        onSubmit: () => {
            const name =
                nameField.querySelector(
                    "input"
                ).value.trim();

            if (!name) {
                error(
                    "Bitte einen Fachnamen eingeben."
                );

                return;
            }

            const existing =
                getSubjects().find(
                    subject =>
                        subject.name
                            .toLowerCase() ===
                        name.toLowerCase()
                );

            if (existing) {
                error(
                    "Dieses Fach existiert bereits."
                );

                return;
            }

            addSubject(name);

            closeModal();

            renderAll();

            success(
                "Fach hinzugefügt."
            );
        }
    });
}


/*
|--------------------------------------------------------------------------
| Add button
|--------------------------------------------------------------------------
*/

function openAddModal() {
    switch (getCurrentPage()) {
        case "dashboard":
        case "tasks":
            openTaskModal();
            break;

        case "presentations":
            openPresentationModal();
            break;

        case "notes":
            openNoteModal();
            break;

        case "files":
            openFileModal();
            break;

        case "subjects":
            openSubjectModal();
            break;

        default:
            openTaskModal();
            break;
    }
}


addButton.addEventListener(
    "click",
    openAddModal
);


/*
|--------------------------------------------------------------------------
| Page changes
|--------------------------------------------------------------------------
*/

window.addEventListener(
    "pagechange",
    event => {
        const page =
            event.detail?.page;

        if (page === "dashboard") {
            renderDashboard();
        }

        if (page === "tasks") {
            renderTasks();
        }

        if (page === "presentations") {
            renderPresentations();
        }

        if (page === "notes") {
            renderNotes();
        }

        if (page === "files") {
            renderFiles();
        }

        if (page === "subjects") {
            renderSubjects();
        }
    }
);


/*
|--------------------------------------------------------------------------
| Re-render everything
|--------------------------------------------------------------------------
*/

function renderAll() {
    renderDashboard();
    renderTasks();
    renderPresentations();
    renderNotes();
    renderFiles();
    renderSubjects();
}


/*
|--------------------------------------------------------------------------
| Initial application state
|--------------------------------------------------------------------------
*/

renderAll();

navigateTo("dashboard");