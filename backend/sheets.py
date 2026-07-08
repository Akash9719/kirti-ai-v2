import json
import os
from datetime import datetime

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

    # Supports credentials stored either as normal JSON
    # or as a JSON-encoded string
    try:
        credentials_data = json.loads(secret_value)

        if isinstance(credentials_data, str):
            credentials_data = json.loads(credentials_data)
