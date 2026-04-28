import os
from sqlmodel import SQLModel, create_engine, Session

# 1. Tenta pegar a URL do Neon nas variáveis de ambiente do Render
DATABASE_URL = os.environ.get("DATABASE_URL")

# 2. Configura os argumentos de conexão e a URL dependendo do ambiente
if not DATABASE_URL:
    # --- MODO LOCAL (Sua máquina) ---
    DATABASE_URL = "sqlite:///./database.db"
    connect_args = {"check_same_thread": False}  # Exigência apenas do SQLite
else:
    # --- MODO PRODUÇÃO (Render + Neon) ---
    connect_args = {}  # Postgres não usa aquele argumento do SQLite
    
    # O SQLAlchemy (motor do SQLModel) exige que a URL comece com postgresql://
    # Se o Neon forneceu postgres://, nós corrigimos automaticamente:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Cria o motor do banco de dados com a URL correta
engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)

def create_db_and_tables():
    # Importa os modelos para o SQLModel criar as tabelas
    from .models import Client, Professional, Waitlist
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session