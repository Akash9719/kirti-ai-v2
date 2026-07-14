// ======================================
// Kirti AI UI Controller
// Module 1
// ======================================

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatButton = document.getElementById("clearChatButton");


// ======================================
// Initialization
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    initializeChat();

});

function initializeChat() {

    messageInput.focus();

    scrollToBottom();

}


// ======================================
// Utilities
// ======================================

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

function showTyping() {

    typingIndicator.classList.remove("hidden");

    scrollToBottom();

}

function hideTyping() {

    typingIndicator.classList.add("hidden");

}

function disableInput() {

    messageInput.disabled = true;

    sendButton.disabled = true;

}

function enableInput() {

    messageInput.disabled = false;

    sendButton.disabled = false;

    messageInput.focus();

}


// ======================================
// Auto Resize
// ======================================

messageInput.addEventListener("input", () => {

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 120) + "px";

});


// ======================================
// Clear Chat
// ======================================

clearChatButton.addEventListener("click", () => {

    chatbot.newSession();

    chatMessages.innerHTML = `

<div class="message-row bot-row">

<div class="message-avatar">

<img src="${CONFIG.BOT_AVATAR}" alt="">

</div>

<div class="message-content">

<div class="message-bubble bot-message">

${CONFIG.GREETING}

</div>

<span class="message-time">

${getCurrentTime()}

</span>

</div>

</div>

`;

    scrollToBottom();

});
