// =========================================
// Kirti AI Chat Engine (Production Version)
// =========================================

class KirtiAI {

    constructor() {

        this.apiUrl = CONFIG.API_URL;
        this.sessionId = this.loadSession();

        console.log("================================");
        console.log("Kirti AI Initialized");
        console.log("API:", this.apiUrl);
        console.log("Session:", this.sessionId);
        console.log("================================");

    }

    //---------------------------------------
    // Session
    //---------------------------------------

    loadSession() {

        let id = localStorage.getItem(CONFIG.SESSION_KEY);

        if (!id) {

            id = crypto.randomUUID();

            localStorage.setItem(CONFIG.SESSION_KEY, id);

        }

        return id;

    }

    newSession() {

        this.sessionId = crypto.randomUUID();

        localStorage.setItem(
            CONFIG.SESSION_KEY,
            this.sessionId
        );

    }

    //---------------------------------------
    // Send Message
    //---------------------------------------

    async send(message) {

        console.group("Kirti AI Request");

        console.log("Message:", message);

        const controller = new AbortController();

        const timeout = setTimeout(() => {

            console.warn("Request Timeout");

            controller.abort();

        }, CONFIG.REQUEST_TIMEOUT);

        try {

            const start = performance.now();

            const response = await fetch(this.apiUrl, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    session_id: this.sessionId,

                    message

                }),

                signal: controller.signal

            });

            const end = performance.now();

            clearTimeout(timeout);

            console.log(
                "Response Time:",
                Math.round(end - start) + " ms"
            );

            console.log(
                "HTTP Status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            const data = await response.json();

            console.log("Backend Response:", data);

            console.groupEnd();

            return {

                success: true,

                reply:
                    data.reply ||
                    "I couldn't generate a response."

            };

        }

        catch (error) {

            clearTimeout(timeout);

            console.error(error);

            console.groupEnd();

            if (error.name === "AbortError") {

                return {

                    success: false,

                    reply:
                        "⚠️ Kirti AI is taking longer than expected. Please try again."

                };

            }

            return {

                success: false,

                reply:
                    "⚠️ Unable to connect to Kirti AI. Please try again."

            };

        }

    }

    //---------------------------------------
    // Markdown
    //---------------------------------------

    format(text) {

        if (!CONFIG.ENABLE_MARKDOWN)
            return text;

        return text
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank">$1</a>'
            );

    }

    //---------------------------------------
    // Typing Animation
    //---------------------------------------

    async typingDelay() {

        if (!CONFIG.ENABLE_TYPING_ANIMATION)
            return;

        return new Promise(resolve =>
            setTimeout(
                resolve,
                CONFIG.TYPING_DELAY
            )
        );

    }

}

const chatbot = new KirtiAI();
