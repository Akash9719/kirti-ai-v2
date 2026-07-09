import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import gspread
from google.oauth2.service_account import Credentials


SPREADSHEET_NAME = "Leads"

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def get_google_credentials():
    secret_value = os.getenv("GOOGLE_CREDENTIALS")

    if not secret_value:
        raise RuntimeError(
            "GOOGLE_CREDENTIALS environment variable is not configured."
        )

    try:
        # First decode: removes the outer quotation marks
        if secret_value.strip().startswith('"'):
            secret_value = json.loads(secret_value)

        # Second decode: converts JSON text into a Python dictionary
        credentials_data = json.loads(secret_value)

    except (json.JSONDecodeError, TypeError) as error:
        raise RuntimeError(
            "GOOGLE_CREDENTIALS contains invalid JSON."
        ) from error

    return Credentials.from_service_account_info(
        credentials_data,
        scopes=SCOPES,
    )


def get_worksheet():
    credentials = get_google_credentials()

    client = gspread.authorize(credentials)

    spreadsheet = client.open(SPREADSHEET_NAME)

    return spreadsheet.sheet1


def save_to_google_sheets(
    name: str,
    email: str,
    phone: str,
    requirement: str,
):
    worksheet = get_worksheet()

    worksheet.append_row(
        [
            name.strip(),
            email.strip(),
            phone.strip(),
            requirement.strip(),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        ]
    )

    return True
