from groq import Groq

from config import settings
from prompts import SYSTEM_PROMPT
from knowledge import load_knowledge
from memory import get_history, add_message


client = Groq(api_key=settings.GROQ_API_KEY)


def generate_response(session_id: str, user_message: str):
    knowledge = load_knowledge()
    history = get_history(session_id)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + "\n\nKnowledge Base:\n" + knowledge,
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

    add_message(session_id, "user", user_message)
    add_message(session_id, "assistant", answer)

    return answer
