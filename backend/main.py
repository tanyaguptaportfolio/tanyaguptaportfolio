import json
import sqlite3
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Lock
from time import monotonic
from typing import Annotated

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend.models import Portfolio

ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="PORTFOLIO_")
    database_path: Path = ROOT / "data" / "messages.db"
    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    allowed_hosts: list[str] = ["localhost", "127.0.0.1", "testserver"]


class ContactMessage(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=100)]
    email: EmailStr
    subject: Annotated[str, Field(min_length=3, max_length=150)]
    message: Annotated[str, Field(min_length=20, max_length=5000)]
    website: Annotated[str, Field(max_length=200)] = ""

    @field_validator("name", "subject", "message", mode="before")
    @classmethod
    def strip_whitespace(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings or Settings()
    attempts: dict[str, deque[float]] = defaultdict(deque)
    rate_lock = Lock()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        config.database_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(config.database_path) as database:
            database.execute(
                "CREATE TABLE IF NOT EXISTS messages ("
                "id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, "
                "subject TEXT NOT NULL, message TEXT NOT NULL, "
                "created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
            )
        yield

    application = FastAPI(title="Tanya Portfolio API", version="0.1.0", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=config.allowed_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    application.add_middleware(TrustedHostMiddleware, allowed_hosts=config.allowed_hosts)

    @application.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    @application.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.get("/api/portfolio", response_model=Portfolio)
    def portfolio() -> Portfolio:
        content = json.loads((ROOT / "content" / "portfolio.json").read_text())
        return Portfolio.model_validate(content)

    @application.post("/api/contact", status_code=201)
    def contact(payload: ContactMessage, request: Request) -> dict[str, str]:
        address = request.client.host if request.client else "unknown"
        now = monotonic()
        with rate_lock:
            stale = [key for key, values in attempts.items() if not values or values[-1] < now - 60]
            for key in stale:
                del attempts[key]
            recent = attempts[address]
            while recent and recent[0] <= now - 60:
                recent.popleft()
            if len(recent) >= 5:
                raise HTTPException(429, "Please wait a minute before sending another message")
            recent.append(now)
        if payload.website:
            raise HTTPException(400, "Unable to accept this submission")
        with sqlite3.connect(config.database_path, timeout=10) as database:
            database.execute(
                "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
                (payload.name, str(payload.email), payload.subject, payload.message),
            )
        return {"message": "Your message has been received. Thank you for reaching out."}

    return application


app = create_app()
