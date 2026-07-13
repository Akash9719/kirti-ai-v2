// ==============================
// Kirti AI Frontend
// ==============================

// IMPORTANT:
// Replace this URL with your own Codespaces backend URL.
const API_URL = "https://YOUR-8000-PORT.app.github.dev/chat";

// Generate one session ID per browser session
const SESSION_ID =
    localStorage.getItem("kirti_session") ||
    crypto.randomUUID();

localStorage.setItem("kirti_session", SESSION_ID);

// DOM Elements
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const messages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");

// Auto-scroll
function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

// Current time
function getTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Add message to chat
function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className =
        sender === "user"
            ? "message-row user-row"
            : "message-row bot-row";

    if (sender === "bot") {
        row.innerHTML = `
            <div class="message-avatar">
                <img src="logo.png" alt="">
            </div>

            <div class="message-content">
                <div class="message-bubble bot-message">
                    ${text}
                </div>

                <span class="message-time">
                    ${getTime()}
                </span>
            </div>
        `;
    } else {
        row.innerHTML = `
            <div class="message-content">
                <div class="message-bubble user-message">
                    ${text}
                </div>

                <span class="message-time">
                    ${getTime()}
                </span>
            </div>
        `;
    }

    messages.appendChild(row);
    scrollToBottom();
}

// Send message
async function sendMessage() {
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";

    sendButton.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                session_id: SESSION_ID,
                message: message,
            }),
        });

        const data = await response.json();

        addMessage(data.reply, "bot");
    } catch (error) {
        addMessage(
            "Unable to connect to Kirti AI.",
            "bot"
        );
    }

    sendButton.disabled = false;

    input.focus();
}

// Form submit
form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
});

// Enter to send
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
