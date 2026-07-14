// ======================================
// Kirti AI UI Controller
// Part 1
// ======================================

// ---------- DOM ----------
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatButton = document.getElementById("clearChatButton");

// ---------- State ----------
let isSending = false;

// ---------- Initialize ----------
initializeChat();

function initializeChat() {
    bindEvents();
    messageInput.focus();
    scrollToBottom();
}

// ---------- Event Binding ----------
function bindEvents() {

    chatForm.addEventListener("submit", handleSubmit);

    messageInput.addEventListener("keydown", handleKeyDown);

    messageInput.addEventListener("input", autoResize);

    clearChatButton.addEventListener(
        "click",
        clearConversation
    );

}

// ---------- Utilities ----------

function scrollToBottom() {

    if (!CONFIG.ENABLE_AUTO_SCROLL) return;

    requestAnimationFrame(() => {

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    });

}

function getCurrentTime() {

    return new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}

function autoResize() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";

}

function disableInput() {

    isSending = true;

    messageInput.disabled = true;

    sendButton.disabled = true;

}

function enableInput() {

    isSending = false;

    messageInput.disabled = false;

    sendButton.disabled = false;

    messageInput.focus();

}

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

// ---------- Typing Indicator ----------

function showTyping() {

    typingIndicator.classList.remove("hidden");

    scrollToBottom();

}

function hideTyping() {

    typingIndicator.classList.add("hidden");

}

// ---------- Message Rendering ----------

function renderMessage(
    text,
    sender
) {

    const row =
        document.createElement("div");

    row.className =
        sender === "user"
            ? "message-row user-row"
            : "message-row bot-row";

    if (sender === "bot") {

        row.innerHTML = `
<div class="message-avatar">
    <img src="${CONFIG.BOT_AVATAR}" alt="">
</div>

<div class="message-content">

    <div class="message-bubble bot-message">

        ${chatbot.format(text)}

    </div>

    <span class="message-time">

        ${getCurrentTime()}

    </span>

</div>
`;

    } else {

        row.innerHTML = `
<div class="message-content">

    <div class="message-bubble user-message">

        ${escapeHtml(text)}

    </div>

    <span class="message-time">

        ${getCurrentTime()}

    </span>

</div>
`;

    }

    chatMessages.appendChild(row);

    scrollToBottom();

}

// ======================================
// Part 2
// ======================================

// ---------- Send Message ----------

async function handleSubmit(event) {

    event.preventDefault();

    if (isSending) return;

    const message = messageInput.value.trim();

    if (!message) return;

    await sendMessage(message);

}

async function sendMessage(message) {

    disableInput();

    renderMessage(message, "user");

    messageInput.value = "";

    messageInput.style.height = "auto";

    showTyping();

    try {

        await chatbot.typingDelay();

        const response =
            await chatbot.send(message);

        hideTyping();

        renderMessage(
            response.reply,
            "bot"
        );

    }

    catch (error) {

        hideTyping();

        renderMessage(

            "⚠️ Something went wrong while contacting Kirti AI. Please try again.",

            "bot"

        );

        console.error(error);

    }

    enableInput();

}


// ---------- Keyboard ----------

function handleKeyDown(event) {

    if (

        event.key === "Enter"

        &&

        !event.shiftKey

    ) {

        event.preventDefault();

        chatForm.requestSubmit();

    }

}


// ---------- Clear Conversation ----------

function clearConversation() {

    chatbot.newSession();

    chatMessages.innerHTML = `

<div class="message-row bot-row">

<div class="message-avatar">

<img src="${CONFIG.BOT_AVATAR}" alt="">

</div>

<div class="message-content">

<div class="message-bubble bot-message">

${chatbot.format(CONFIG.GREETING)}

</div>

<span class="message-time">

${getCurrentTime()}

</span>

</div>

</div>

`;

    hideTyping();

    messageInput.value = "";

    messageInput.style.height = "auto";

    enableInput();

    scrollToBottom();

}


// ---------- Initial Resize ----------

autoResize();


// ---------- Export ----------

window.KirtiUI = {

    renderMessage,

    clearConversation,

    showTyping,

    hideTyping,

    enableInput,

    disableInput

};
