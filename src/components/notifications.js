let container = null;

function getContainer() {
    if (container) {
        return container;
    }

    container = document.createElement("div");

    container.className = "notifications";

    document.body.appendChild(container);

    return container;
}

export function notify(
    message,
    type = "info"
) {
    const notification =
        document.createElement("div");

    notification.className =
        `notification notification-${type}`;

    notification.textContent = message;

    getContainer().appendChild(
        notification
    );

    requestAnimationFrame(() => {
        notification.classList.add("visible");
    });

    setTimeout(() => {
        notification.classList.remove(
            "visible"
        );

        setTimeout(() => {
            notification.remove();
        }, 200);
    }, 3000);
}

export function success(message) {
    notify(message, "success");
}

export function error(message) {
    notify(message, "error");
}

export function info(message) {
    notify(message, "info");
}