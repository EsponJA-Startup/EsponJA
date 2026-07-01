import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text

# 1. Tenta pegar a URL do Neon nas variáveis de ambiente do Render
DATABASE_URL = os.environ.get("DATABASE_URL")

# 2. Configura os argumentos de conexão e a URL dependendo do ambiente
if not DATABASE_URL:
    # --- MODO LOCAL (Sua máquina) ---
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "database.db").replace("\\", "/")
    DATABASE_URL = f"sqlite:///{db_path}"
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
    from .models import Client, Professional, Waitlist, ServiceRequestRejection, ServiceRescheduleProposal
    SQLModel.metadata.create_all(engine)
    
    # Migração automática para o Postgres (Render/Neon)
    if "postgresql" in str(engine.url):
        with engine.connect() as conn:
            queries = [
                "ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS first_access_password VARCHAR;",
                "ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS is_registered BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE client ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE client ADD COLUMN IF NOT EXISTS verification_token VARCHAR;",
                "ALTER TABLE professional ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE professional ADD COLUMN IF NOT EXISTS verification_token VARCHAR;"
            ]
            for q in queries:
                try:
                    conn.execute(text(q))
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    print(f"Postgres migration notice: {e}")

def get_session():
    with Session(engine) as session:
        yield session

# For Vercel Serverless environment where FastAPI lifespan is not triggered,
# we need to ensure the database and tables are created/migrated on module load.
try:
    create_db_and_tables()
except Exception as e:
    print(f"Failed to auto-migrate on startup: {e}")