# 🧽 EsponJÁ

**An MVP marketplace for household services, focused on trust and safety.**

![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![Frontend: React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Backend: FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database: PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20(Neon)-336791?logo=postgresql&logoColor=white)
![AI-assisted development](https://img.shields.io/badge/development-AI--assisted-9cf)

---

## About the Project

EsponJÁ connects urban customers with **pre-verified** cleaning professionals, replacing informal hiring channels (WhatsApp groups, word-of-mouth referrals) with a curated and secure workflow featuring identity verification, structured scheduling, active confirmation, and service guarantee.

This repository contains the complete MVP:

- **Frontend:** React + Vite (`/client`)
- **Backend:** FastAPI + SQLModel (`/server`)
- **Database:** PostgreSQL via Neon (production) / SQLite (development)
- **Email Automation:** n8n (`/n8n_workflows`, `docker-compose.yml`)
- **Scheduling Chatbot:** Google Gemini with Function Calling

For complete technical documentation—including architecture, data modeling, authentication, and business workflows with diagrams—see the **[Project Wiki](#documentation)**.

## 🎓 Academic Context

EsponJÁ was originally developed as part of the **PMI3817 – Entrepreneurship and Innovation in Engineering** course at the University of São Paulo, serving as a practical exercise in validating a real business model through MVP development, Lean Startup principles, Painted Door Tests for new service categories, and related entrepreneurship methodologies.

The project later became a **case study** for the **MAC0350 – Introduction to Software Systems Development** course at the Institute of Mathematics and Statistics (IME-USP), where it is used as a practical example of full-stack architecture, data modeling, and modern software engineering practices.

As a result, some implementation decisions and scope limitations reflect this educational context. EsponJÁ is an academic MVP under continuous evolution rather than a production-ready commercial platform.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router DOM, Axios, Lucide Icons |
| Backend | Python 3.11+, FastAPI, SQLModel (SQLAlchemy + Pydantic) |
| Database | PostgreSQL (Neon) in production / SQLite in development |
| Authentication | JWT stored in `HttpOnly` cookies, password hashing with `bcrypt` |
| Automation | Self-hosted n8n via Docker + SMTP |
| AI / Chatbot | Google Gemini (`gemini-2.5-flash`) via `google-genai` with Function Calling |
| Hosting | Vercel (frontend) + Render (backend) |
| Testing | Vitest, React Testing Library, Pytest, HTTPX |
| CI/CD | GitHub Actions |
| Code Quality | Pylint + Radon (Halstead Metrics, Cyclomatic Complexity, Maintainability Index) |
| License | AGPL-3.0 |

## Repository Structure

```text
esponja/
├── api/                 # Serverless layer (Vercel) exposing FastAPI under /api
├── client/              # React + Vite frontend
│   └── src/tests/       # Frontend automated tests (Vitest)
├── server/
│   ├── app/
│   │   ├── routers/     # Domain-based API routes
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── limiter.py   # Centralized Rate Limiting configuration
│   │   └── ...
│   └── tests/           # Backend automated tests (Pytest)
├── metrics/             # Code quality reports
├── .github/
│   └── workflows/       # CI/CD pipelines
├── n8n_workflows/
├── docker-compose.yml
├── vercel.json
└── LICENSE
```

## Running the Project Locally

```bash
# 1. Clone the repository
git clone https://github.com/EsponJA-Startup/EsponJA.git
cd EsponJA

# 2. Backend (Terminal 1)
cd server
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Configure SECRET_KEY, ADMIN_EMAIL, etc.
uvicorn main:app --reload --port 8000

# 3. Frontend (Terminal 2)
cd client
npm install
cp .env.example .env
npm run dev

# 4. (Optional) Email automation via n8n
docker-compose up -d
# Open http://localhost:5678 and import n8n_workflows/automation_esponja.json
```

For complete setup instructions (environment variables, API endpoints, security configuration, etc.), refer to [`server/README.md`](./server/README.md) and [`client/README.md`](./client/README.md).

## Software Engineering

Beyond implementing the MVP's core functionality, the project has progressively incorporated modern software engineering practices aimed at improving maintainability, reliability, and code quality.

Key improvements include:

- A modular backend architecture based on **FastAPI APIRouter** and **SOLID principles**, reducing coupling between application modules.
- An automated testing suite using **Vitest** for the frontend and **Pytest** for the backend.
- A **Continuous Integration (CI)** pipeline powered by **GitHub Actions**, ensuring all changes are automatically validated before integration.
- Continuous code quality monitoring through **Halstead Metrics**, **Cyclomatic Complexity**, **Maintainability Index**, and **Pylint**.

These improvements make the project easier to maintain, extend, and test, while also strengthening its value as an educational software engineering case study.

## Documentation

The complete technical documentation is available in the project's **Wiki**:

- [Home / Overview](https://github.com/EsponJA-Startup/EsponJA/wiki/Home) — project overview, technology stack, and high-level architecture
- [Data Modeling](https://github.com/EsponJA-Startup/EsponJA/wiki/01-Modelagem-de-Dados) — entities and ER diagram
- [Authentication and Security](https://github.com/EsponJA-Startup/EsponJA/wiki/02-Autenticacao-e-Seguranca) — JWT, `HttpOnly` cookies, First Access flow, and RBAC
- [Business Workflows](https://github.com/EsponJA-Startup/EsponJA/wiki/03-Fluxos-de-Negocio) — scheduling flow, n8n integration, and Gemini chatbot
- [Backend Architecture](https://github.com/EsponJA-Startup/EsponJA/wiki/04-Backend-Architecture) — modular architecture using APIRouter and SOLID principles
- [Automated Testing and CI/CD](https://github.com/EsponJA-Startup/EsponJA/wiki/05-Testing-CICD) — testing strategy, GitHub Actions, and continuous integration
- [Code Quality](https://github.com/EsponJA-Startup/EsponJA/wiki/06-Metrics-Code-Quality) — software quality metrics, reports, and project evolution

## Use of Artificial Intelligence

In the interest of transparency, we acknowledge that AI tools were used throughout nearly every stage of the project—from software development to product brainstorming and documentation. The use of these tools was explicitly permitted by the academic courses associated with the project.

| Tool | Primary Use |
|---|---|
| **Antigravity** | Primary AI-assisted development environment for frontend and backend implementation |
| **Google Gemini** | Technical research, brainstorming, and product ideation |
| **ChatGPT** | Technical research, brainstorming, and product ideation |
| **PMI3817 Course AI Assistant** | Guidance on business modeling activities required by the course (Lean Startup, CAC, acquisition funnel, pitch development) |
| **Claude (Anthropic)** | Assistance in structuring the technical documentation for this repository (README and Wiki) |

### Academic Integrity Statement

The use of AI tools was explicitly authorized by the academic courses associated with this project and therefore does not constitute academic misconduct. Nevertheless, we disclose their use in the interest of transparency.

AI served strictly as a **support tool** for brainstorming, code generation, code review, and documentation. All architectural decisions, business modeling, feature prioritization, and technical validation were carried out, reviewed, and fully understood by the development team, who remain solely responsible for the final deliverables.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [`LICENSE`](./LICENSE) file for the complete license text.
