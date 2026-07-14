// =========================================
// Kirti AI Chat Engine
// =========================================

class KirtiAI {

    constructor() {

        this.apiUrl = CONFIG.API_URL;

        this.sessionId = this.loadSession();

    }

    //---------------------------------------
    // Session
    //---------------------------------------

    loadSession() {

        let id = localStorage.getItem(CONFIG.SESSION_KEY);

        if (!id) {

            id = crypto.randomUUID();

            localStorage.setItem(
                CONFIG.SESSION_KEY,
                id
            );

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
    // API
    //---------------------------------------

    async send(message) {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {

                controller.abort();

            }, CONFIG.REQUEST_TIMEOUT);

        try {

            const response =
                await fetch(
                    this.apiUrl,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            session_id:
                                this.sessionId,

                            message

                        }),

                        signal:
                            controller.signal

                    }
                );

            clearTimeout(timeout);

            if (!response.ok) {

                throw new Error(
                    "API Error"
                );

            }

            const data =
                await response.json();

            return {

                success: true,

                reply: data.reply || "I couldn't generate a response.",
                raw: data
            };

        }

        catch (error) {

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

        if (!CONFIG.ENABLE_MARKDOWN) {

            return text;

        }

        return text

            .replace(
                /\n/g,
                "<br>"
            )

            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            .replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            )

            .replace(

                /(https?:\/\/[^\s]+)/g,

                '<a href="$1" target="_blank">$1</a>'

            );

    }

    //---------------------------------------
    // Typing delay
    //---------------------------------------

    async typingDelay() {

        if (!CONFIG.ENABLE_TYPING_ANIMATION) {

            return;

        }

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    CONFIG.TYPING_DELAY

                )

        );

    }

}

const chatbot = new KirtiAI();
