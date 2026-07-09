import re
from typing import Optional


lead_sessions = {}


def create_lead_session(session_id: str):
    lead_sessions[session_id] = {
        "active": True,
        "name": None,
        "email": None,
        "phone": None,
        "requirement": None,
        "consent": False,
        "saved": False,
    }


def get_lead_session(session_id: str) -> Optional[dict]:
    return lead_sessions.get(session_id)


def is_lead_capture_active(session_id: str) -> bool:
    lead = get_lead_session(session_id)

    return bool(
        lead
        and lead["active"]
        and not lead["saved"]
    )


def validate_email(email: str) -> bool:
    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    return bool(re.match(pattern, email.strip()))


def clean_phone(phone: str) -> str:
    return re.sub(r"[^\d+]", "", phone.strip())


def validate_phone(phone: str) -> bool:
    cleaned_phone = clean_phone(phone)
    digits_only = re.sub(r"\D", "", cleaned_phone)

    return 10 <= len(digits_only) <= 15


def get_next_missing_field(session_id: str) -> Optional[str]:
    lead = get_lead_session(session_id)

    if not lead:
        return None

    for field in ["name", "email", "phone", "requirement"]:
        if not lead.get(field):
            return field

    if not lead["consent"]:
        return "consent"

    return None


def get_question_for_field(field: str) -> str:
    questions = {
        "name": "Great. May I know your name?",
        "email": "Thank you. What is the best email address to reach you?",
        "phone": "What phone number can our team contact you on?",
        "requirement": (
            "Please briefly describe your requirement so our team can "
            "understand how best to help you."
        ),
        "consent": (
            "Thank you. May I save these details and share them with our "
            "team so they can contact you?"
        ),
    }

    return questions.get(field, "")


def process_lead_input(session_id: str, user_message: str) -> dict:
    lead = get_lead_session(session_id)

    if not lead:
        return {
            "handled": False,
            "reply": None,
            "ready_to_save": False,
        }

    field = get_next_missing_field(session_id)
    value = user_message.strip()

    if field == "name":
        if len(value) < 2:
            return {
                "handled": True,
                "reply": "Please enter your name.",
                "ready_to_save": False,
            }

        lead["name"] = value

    elif field == "email":
        if not validate_email(value):
            return {
                "handled": True,
                "reply": (
                    "That email address does not look valid. "
                    "Please enter a valid email address."
                ),
                "ready_to_save": False,
            }

        lead["email"] = value.lower()

    elif field == "phone":
        if not validate_phone(value):
            return {
                "handled": True,
                "reply": (
                    "Please enter a valid phone number with "
                    "10 to 15 digits."
                ),
                "ready_to_save": False,
            }

        lead["phone"] = clean_phone(value)

    elif field == "requirement":
        if len(value) < 5:
            return {
                "handled": True,
                "reply": (
                    "Please provide a little more detail about "
                    "your requirement."
                ),
                "ready_to_save": False,
            }

        lead["requirement"] = value

    elif field == "consent":
        normalized = value.lower()

        yes_answers = {
            "yes",
            "y",
            "yes please",
            "sure",
            "okay",
            "ok",
            "i agree",
            "agree",
            "confirm",
        }

        no_answers = {
            "no",
            "n",
            "no thanks",
            "no thank you",
            "cancel",
        }

        if normalized in yes_answers:
            lead["consent"] = True
            lead["active"] = False

            return {
                "handled": True,
                "reply": None,
                "ready_to_save": True,
            }

        if normalized in no_answers:
            lead["active"] = False

            return {
                "handled": True,
                "reply": (
                    "No problem. I have not saved your details. "
                    "How else can I help you?"
                ),
                "ready_to_save": False,
            }

        return {
            "handled": True,
            "reply": (
                "Please reply yes if you would like me to share "
                "your details with our team, or no if you prefer not to."
            ),
            "ready_to_save": False,
        }

    next_field = get_next_missing_field(session_id)

    return {
        "handled": True,
        "reply": get_question_for_field(next_field),
        "ready_to_save": False,
    }


def get_lead_data(session_id: str) -> Optional[dict]:
    lead = get_lead_session(session_id)

    if not lead:
        return None

    return {
        "name": lead["name"],
        "email": lead["email"],
        "phone": lead["phone"],
        "requirement": lead["requirement"],
    }


def mark_lead_saved(session_id: str):
    lead = get_lead_session(session_id)

    if lead:
        lead["saved"] = True
        lead["active"] = False


def clear_lead_session(session_id: str):
    lead_sessions.pop(session_id, None)
