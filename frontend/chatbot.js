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
    // Clean AI Response
    //---------------------------------------

    cleanResponse(text) {

        if (!text)
            return "";

        return text

            // Remove Markdown headings
            .replace(/^#{1,6}\s*/gm, "")

            // Remove Markdown horizontal lines
            .replace(/^[-*_]{3,}\s*$/gm, "")

            // Remove Markdown table separator rows
            .replace(
                /^\s*\|?[\s:-]+\|[\s|:-]+\|.*$/gm,
                ""
            )

            // Remove unnecessary table pipes
            .replace(/^\s*\|\s*/gm, "")
            .replace(/\s*\|\s*$/gm, "")

            // Remove repeated decorative symbols
            .replace(/={3,}/g, "")
            .replace(/-{5,}/g, "")

            // Remove excessive blank lines
            .replace(/\n{3,}/g, "\n\n")

            // Clean spaces at line endings
            .replace(/[ \t]+$/gm, "")

            // Final trim
            .trim();

    }

    //---------------------------------------
    // Markdown / Display Formatting
    //---------------------------------------

    format(text) {

        text = this.cleanResponse(text);

        // Escape HTML first for safety
        text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        if (!CONFIG.ENABLE_MARKDOWN) {

            return text.replace(/\n/g, "<br>");

        }

        return text
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(
                /(https?:\/\/[^\s<]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
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
