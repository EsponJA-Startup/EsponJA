# 🧽 EsponJÁ

**Um MVP de marketplace de serviços domésticos, focado em confiança e segurança.**

![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![Frontend: React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Backend: FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database: PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20(Neon)-336791?logo=postgresql&logoColor=white)
![AI-assisted development](https://img.shields.io/badge/development-AI--assisted-9cf)

---

## Sobre o Projeto

O EsponJÁ conecta clientes urbanos a profissionais de limpeza **pré-verificados**, substituindo a contratação informal (grupos de WhatsApp, indicação de boca a boca) por um fluxo curado e seguro: identidade verificada, agendamento formal, confirmação ativa e garantia de refação.

Este repositório contém o MVP completo:

- **Frontend**: React + Vite (`/client`)
- **Backend**: FastAPI + SQLModel (`/server`)
- **Banco de dados**: PostgreSQL via Neon (produção) / SQLite (desenvolvimento)
- **Automação de e-mail**: n8n (`/n8n_workflows`, `docker-compose.yml`)
- **Chatbot de agendamento**: Google Gemini com Function Calling

Para a documentação técnica completa — arquitetura, modelagem de dados, autenticação e fluxos de negócio, todos com diagramas — veja a **[Wiki do Projeto](#documentação)**.

## 🎓 Contexto Acadêmico

O EsponJÁ nasceu como projeto da disciplina **PMI3817 – Empreendedorismo e Inovação na Engenharia**, na Universidade de São Paulo, como exercício prático de validação de um modelo de negócio real (MVP, princípios de Lean Startup, Painted Door Test para novas categorias de serviço, etc.).

A partir daí, o projeto passou a ser utilizado **também** como estudo de caso na disciplina de **MAC0350 - Introdução ao Desenvolvimento de Sistemas de Software**, do Departamento de Ciência da Computação do IME-USP, servindo como exemplo prático de arquitetura full-stack, modelagem de dados e boas práticas de engenharia de software.

Por isso, algumas decisões de escopo e simplificações no código refletem esse contexto didático — é um MVP acadêmico em evolução contínua, não um produto comercial com todos os requisitos de um sistema em produção completo.

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite, React Router DOM, Axios, Lucide Icons |
| Backend | Python 3.11+, FastAPI, SQLModel (SQLAlchemy + Pydantic) |
| Banco de Dados | PostgreSQL (Neon) em produção / SQLite em desenvolvimento |
| Autenticação | JWT em cookie `HttpOnly`, hashing de senha com `bcrypt` |
| Automação | n8n (self-hosted via Docker) + SMTP |
| IA / Chatbot | Google Gemini (`gemini-2.5-flash`) via `google-genai`, com Function Calling |
| Hospedagem | Vercel (frontend) + Render (backend) |
| Testes    | Vitest, React Testing Library, Pytest, HTTPX|
| CI/CD     | GitHub Actions|
| Qualidade | Pylint + Radon (Halstead, Complexidade Ciclomática e Maintainability Index) |
| Licença | AGPL-3.0 |

## Estrutura do Repositório

```text
esponja/
├── api/                 # Camada serverless (Vercel) que expõe o FastAPI via /api
├── client/              # Frontend React + Vite
│   └── src/tests/       # Testes automatizados do frontend (Vitest)
├── server/
│   ├── app/
│   │   ├── routers/     # Rotas organizadas por domínio
│   │   ├── schemas.py   # Schemas Pydantic
│   │   ├── limiter.py   # Configuração centralizada de Rate Limiting
│   │   └── ...
│   └── tests/           # Testes automatizados do backend (Pytest)
├── metrics/             # Relatórios de métricas de qualidade
├── .github/
│   └── workflows/       # Pipeline de CI/CD
├── n8n_workflows/
├── docker-compose.yml
├── vercel.json
└── LICENSE
```

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/EsponJA-Startup/EsponJA.git
cd EsponJA

# 2. Backend (em um terminal)
cd server
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # preencha SECRET_KEY, ADMIN_EMAIL, etc.
uvicorn main:app --reload --port 8000

# 3. Frontend (em outro terminal)
cd client
npm install
cp .env.example .env
npm run dev

# 4. (Opcional) Automação de e-mail via n8n, na raiz do projeto
docker-compose up -d
# acesse http://localhost:5678 e importe n8n_workflows/automation_esponja.json
```

Para detalhes completos de configuração de cada camada (variáveis de ambiente, endpoints, segurança), veja [`server/README.md`](./server/README.md) e [`client/README.md`](./client/README.md).

## Engenharia de Software

Além da implementação funcional do MVP, o projeto evoluiu para incorporar práticas modernas de engenharia de software voltadas à manutenção, confiabilidade e qualidade do código.

Entre as principais melhorias estão:

arquitetura modular no backend utilizando FastAPI APIRouter e princípios SOLID, reduzindo o acoplamento entre módulos;
suíte de testes automatizados utilizando Vitest (frontend) e Pytest (backend);
pipeline de Integração Contínua (CI) com GitHub Actions para validação automática da aplicação;
monitoramento contínuo de qualidade através de métricas como Halstead, Complexidade Ciclomática, Maintainability Index e Pylint.

Essas melhorias tornam o projeto mais fácil de evoluir, testar e manter, além de servirem como material de estudo para disciplinas relacionadas ao desenvolvimento de software.

## Documentação

A documentação técnica aprofundada está na **Wiki** do repositório:

- [Home / Overview](https://github.com/EsponJA-Startup/EsponJA/wiki/Home) — proposta de valor, stack e arquitetura macro
- [Modelagem de Dados](https://github.com/EsponJA-Startup/EsponJA/wiki/01-Modelagem-de-Dados) — entidades e diagrama ER
- [Autenticação e Segurança](https://github.com/EsponJA-Startup/EsponJA/wiki/02-Autenticacao-e-Seguranca) — JWT, cookies `HttpOnly`, fluxo de Primeiro Acesso e RBAC
- [Fluxos de Negócio](https://github.com/EsponJA-Startup/EsponJA/wiki/03-Fluxos-de-Negocio) — agendamento, integração com n8n e chatbot com Gemini
- [Arquitetura do Backend](https://github.com/EsponJA-Startup/EsponJA/wiki/04-Backend-Architecture) — organização modular com APIRouter e aplicação de princípios SOLID
- [Testes Automatizados e CI/CD](https://github.com/EsponJA-Startup/EsponJA/wiki/05-Testing-CICD) — estratégia de testes, GitHub Actions e integração contínua
- [Qualidade de Código](https://github.com/EsponJA-Startup/EsponJA/wiki/06-Metrics-Code-Quality) — métricas, relatórios e acompanhamento da evolução do projeto

## Uso de Inteligência Artificial

Em nome da transparência, registramos que ferramentas de IA foram usadas para assistir praticamente todas as etapas do projeto — desde a escrita de código até o brainstorming de produto e a documentação. O uso dessas ferramentas foi expressamente permitido pelas disciplinas envolvidas.

| Ferramenta | Uso principal |
|---|---|
| **Antigravity** | Principal ferramenta de desenvolvimento assistido por IA para o código do projeto (frontend e backend) |
| **Google Gemini** | Brainstorming, pesquisa e ideação técnica e de produto |
| **ChatGPT** | Brainstorming, pesquisa e ideação técnica e de produto |
| **Agente de IA da disciplina PMI3817** | Orientação nos exercícios de modelagem de negócio exigidos pela disciplina (Lean Startup, CAC, funil de aquisição, pitch) |
| **Claude (Anthropic)** | Apoio na estruturação da documentação técnica deste repositório (este README e a Wiki) |

### Nota de Integridade Acadêmica

O uso de IA foi permitido pelas disciplinas envolvidas e não constitui, portanto, violação de conduta acadêmica. Ainda assim, registramos por transparência que a IA foi empregada como **ferramenta de apoio** — para acelerar brainstorming, geração de código, revisão e documentação — e não como substituta do raciocínio da equipe. Todas as decisões de arquitetura, modelagem de negócio, priorização de funcionalidades e validação técnica foram tomadas e compreendidas pelos integrantes do time, que permanecem responsáveis pelo conteúdo final entregue.

## Licença

Este projeto está licenciado sob a **GNU Affero General Public License v3.0 (AGPL-3.0)**. Veja o arquivo [`LICENSE`](./LICENSE) para o texto completo.
