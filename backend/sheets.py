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
