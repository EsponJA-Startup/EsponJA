import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv() # Load variables from .env file into os.environ

from app.database import create_db_and_tables
from app.limiter import limiter

# Import Routers
from app.routers.auth import router as auth_router
from app.routers.waitlist import router as waitlist_router
from app.routers.services import router as services_router
from app.routers.users import router as users_router
from app.routers.chat import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(waitlist_router)
app.include_router(services_router)
app.include_router(users_router)
app.include_router(chat_router)
