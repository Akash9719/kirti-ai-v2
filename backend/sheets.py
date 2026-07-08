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
