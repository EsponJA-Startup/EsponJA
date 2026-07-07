from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.database import get_session
from app.auth import get_current_user
from app.schemas import ChatMessage
from app.utils.chatbot import generate_chat_response
from app.limiter import limiter

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("")
@limiter.limit("20/minute")
def chat_endpoint(request: Request, data: ChatMessage, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "customer":
        return {"reply": "Você precisa estar logado como cliente para usar o assistente virtual.", "booked": False}
    result = generate_chat_response(data.history, current_user["user_id"], db_session=session)
    return {"reply": result["text"], "booked": result["booked"]}
