from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str


class LeadRequest(BaseModel):
    name: str
    email: str
    phone: str
    requirement: str = ""


class HealthResponse(BaseModel):
    status: str
