from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "Kirti AI")

    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    MODEL_NAME = os.getenv(
        "MODEL_NAME",
        "llama-3.3-70b-versatile"
    )

    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "*"
    ).split(",")


settings = Settings()   
