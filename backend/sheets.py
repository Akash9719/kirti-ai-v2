import json
import os
from datetime import datetime

import gspread
from google.oauth2.service_account import Credentials


SPREADSHEET_NAME = "Leads"
