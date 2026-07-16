from groq import Groq

from config import settings
from prompts import SYSTEM_PROMPT
from knowledge import load_knowledge
from memory import get_history, add_message

from lead_capture import (
    create_lead_session,
    get_question_for_field,
    process_lead_input,
    get_lead_data,
    mark_lead_saved,
    is_lead_capture_active,
)

from sheets import save_to_google_sheets


client = Groq(api_key=settings.GROQ_API_KEY)


LEAD_TRIGGER_PHRASES = [
    "contact me",
    "call me",
    "connect me",
    "contact us",
    "call us",
    "get in touch",
    "speak to your team",
    "talk to your team",
    "connect with your team",
    "want a consultation",
    "need a consultation",
    "book a consultation",
    "schedule a consultation",
    "interested in your services",
    "i am interested",
]


def wants_contact(user_message: str) -> bool:
    message = user_message.lower().strip()

    return any(
        phrase in message
        for phrase in LEAD_TRIGGER_PHRASES
    )


def generate_response(
    session_id: str,
    user_message: str,
):

    # ---------------------------------
    # 1. Continue active lead collection
    # ---------------------------------

    if is_lead_capture_active(session_id):

        result = process_lead_input(
            session_id=session_id,
            user_message=user_message,
        )

        if result["ready_to_save"]:

            lead = get_lead_data(session_id)

            try:
                save_to_google_sheets(
                    name=lead["name"],
                    email=lead["email"],
                    phone=lead["phone"],
                    requirement=lead["requirement"],
                )

                mark_lead_saved(session_id)

                reply = (
                    "Thank you! Your details have been shared "
                    "successfully. Our team will contact you soon."
                )

            except Exception:
                reply = (
                    "I’m sorry, I could not save your details right now. "
                    "Please try again shortly."
                )

            add_message(
                session_id,
                "user",
                user_message,
            )

            add_message(
                session_id,
                "assistant",
                reply,
            )

            return reply

        reply = result["reply"]

        add_message(
            session_id,
            "user",
            user_message,
        )

        add_message(
            session_id,
            "assistant",
            reply,
        )

        return reply

    # ---------------------------------
    # 2. Start lead collection
    # ---------------------------------

    if wants_contact(user_message):

        create_lead_session(session_id)

        reply = get_question_for_field("name")

        add_message(
            session_id,
            "user",
            user_message,
        )

        add_message(
            session_id,
            "assistant",
            reply,
        )

        return reply

    # ---------------------------------
    # 3. Normal AI conversation
    # ---------------------------------

    knowledge = load_knowledge()
    history = get_history(session_id)

    messages = [
        {
            "role": "system",
            "content": (
                SYSTEM_PROMPT
                + "\n\nKnowledge Base:\n"
                + knowledge
            ),
        }
    ]

    messages.extend(history)

    messages.append(
        {
            "role": "user",
            "content": user_message,
        }
    )

    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=messages,
        temperature=0.3,
    )

    answer = response.choices[0].message.content

    add_message(
        session_id,
        "user",
        user_message,
    )

    add_message(
        session_id,
        "assistant",
        answer,
    )

    return answer
