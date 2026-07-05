# Prompts Documentation

This document contains highly descriptive prompts mapped to our GitHub milestones. These prompts are designed to be submitted to an AI agent (like ChatGPT, Claude, or Gemini) to independently reproduce the exact implementation of the EsponJA platform, step-by-step.

## v0.1.0 - Landing Page + Client and Service Provider Sections
**Goal:** Launch the digital presence and core interfaces for both sides of the marketplace. 
**Success Criteria:** Fully responsive (mobile-friendly). Seamless navigation between all three sections. Basic Auth/Database integration functional.

**Prompt for AI Agent:**
> "Act as a Senior Full-Stack Engineer. Initialize a React frontend project using Vite (`npm create vite@latest client -- --template react`).
> 
> **Design Requirements:**
> - Implement a modern, intuitive, and responsive landing page.
> - Color Palette: Primary Blue `rgba(20, 125, 178, 1)` and Primary Yellow `rgba(251, 192, 45, 1)`. 
> - Create a clear value proposition section, highlighting client pain points (finding reliable cleaners) and our solution (verified professionals).
> 
> **Navigation & Routing:**
> - Set up `react-router-dom`.
> - The Navbar must include: 'Como funciona', 'Avaliações', 'Segurança', and two main action buttons: 'Sou um cliente' and 'Sou um profissional'.
> - 'Sou um cliente' redirects to a `/client` route. 'Sou um profissional' redirects to a `/provider` route.
>
> **Dashboard Prototypes (Static Frontend):**
> - **Client Page:** Display a grid of service options (Limpeza Rápida, Padrão, Pesada, Pós-obra, Pré-mudança). Clicking a service opens a dropdown/form to input house details (bedrooms, bathrooms) and address.
> - **Provider Page:** Display a monthly calendar view (Agenda) to show availability.
> - Do not implement backend connectivity yet. Use mock data for the UI."

## v0.2.0 - Initial Backend + The "Wizard of Oz" Engine
**Goal:** Launch the backend foundation to systematically capture user intent and manage verified providers through a manual concierge interface.
**Success Criteria:** Request Form submits to Database. Dynamic Catalog populates from API.

**Prompt for AI Agent:**
> "Act as a Backend Architect. We need to build the foundational backend for our marketplace.
> 
> **Backend Setup:**
> - Initialize a FastAPI project in a `server` directory.
> - Use `SQLModel` and `SQLite` for the database.
> 
> **Database Schema (models.py):**
> - `Client`: id (UUID), name (str), whatsapp_number (str), email (str, optional), created_at (datetime).
> - `Professional`: id (UUID), name (str), profile_picture_url (str, optional), rating (float), review_count (int), is_verified (bool), badges (JSON), wallet_available (decimal), wallet_escrow (decimal).
> - `ServiceRequest`: id (UUID), client_id (FK), professional_id (FK, nullable), status (str), service_type, home_type, bedrooms, bathrooms, has_pets, cep, address, scheduled_date, scheduled_time, price, payment_status.
>
> **API & Frontend Integration:**
> - Create a simple 'Wizard of Oz' setup: create endpoints (`POST /api/requests`) that capture the ServiceRequest data into the database. 
> - On the frontend, configure `axios` in `client/src/services/api.js`. Set up Vite proxy (`vite.config.js`) to redirect `/api` calls to `http://localhost:8000` to avoid CORS during development.
> - Connect the Client service form to submit data to the FastAPI backend."

## v0.3.0 - Deploy Waitlist MVP to Production
**Goal:** Verify if users can submit email addresses to the waiting list and if subscriptions are permanently stored in the cloud database.
**Success Criteria:** Forms submit to DB, N8N webhook triggers email.

**Prompt for AI Agent:**
> "Act as a Full-Stack Engineer and DevOps Specialist.
> 
> **Database & API:**
> - Create a `Waitlist` model in FastAPI with fields: `email` (str), `role` (str: 'customer' or 'provider'), and `requested_service` (str, optional).
> - Create a `POST /api/waitlist` endpoint.
> 
> **Frontend Updates:**
> - Update the CTA (Call to Action) component. When a user clicks 'Entrar na fila', open a form.
> - Add a 'Painted Door Test': If the user selects the customer role ('Contratar'), dynamically show an input: 'Qual serviço você está procurando? Ex: Eletricista, Limpeza...'. Send this as `requested_service` to the backend.
> 
> **N8N Automation:**
> - In the `/api/waitlist` endpoint, after saving to the database, dispatch an HTTP POST request to our N8N Webhook URL with the user's data.
> - Implement robust error handling (e.g., `try-except` block, log non-200 responses) so the waitlist doesn't fail if the webhook is down.
>
> **Deployment:**
> - Prepare `vercel.json` for frontend deployment with SPA fallback to prevent 404s on refresh.
> - Add necessary dependencies to `requirements.txt` for backend deployment."

## v0.4.0 - ChatBot integration
**Goal:** Add a chatbot tab inside our platform.
**Success Criteria:** AI responds contextually to EsponJA queries.

**Prompt for AI Agent:**
> "Act as an AI Integration Engineer.
> 
> **Backend Integration:**
> - Add `google-genai` to `requirements.txt`.
> - Create a `POST /api/chat` endpoint in FastAPI.
> - Integrate with Google GenAI (Gemini). Inject a strict system prompt instructing the AI to act as a helpful assistant for EsponJA. Restrict its scope so it only answers questions related to home services, the platform's mechanics, and safety.
> - Implement token-saving mechanisms (limit max tokens in generation).
> 
> **Frontend Integration:**
> - Build a Chatbot interface in React. Use a floating chat widget or a dedicated tab in the Navbar.
> - Ensure the Chatbot UI matches the brand palette (Primary Blue and Yellow). 
> - Keep a history of the chat locally in state, displaying user messages on the right and AI messages on the left.
> - Refine the Chatbot interface colors to ensure readability and contrast."

## v0.5.0 - Robust Security and Authentication
**Goal:** Ensure secure user sign-ups and data protection.
**Success Criteria:** JWT Auth implemented, 2-factor/email verification flow.

**Prompt for AI Agent:**
> "Act as a Security-focused Backend Engineer.
> 
> **Authentication Flow:**
> - Upgrade the authentication system to use JWT (JSON Web Tokens). 
> - Implement bcrypt password hashing for all users.
> - In FastAPI, create `POST /api/auth/register` and `POST /api/auth/login`.
> - Add a two-phase registration system (Código de Confirmação). When users register, generate a 6-digit code and require them to verify it before their account becomes active.
> 
> **Frontend Logic:**
> - In `Register.jsx`, implement a double password logic (Password and Confirm Password) and enforce password complexity rules (e.g., min length, numbers, special characters).
> - After successful login, store the JWT in `localStorage` or HttpOnly cookies.
> - Implement React Router protected routes. Redirect users automatically to `/client/dashboard` or `/provider/dashboard` based on their JWT role."

## v0.6.0 - Client and Provider Journey Improvements
**Goal:** Redesign and enhance the frontend experience and integrate it with backend for both Client and Provider journeys, from homepage to dashboard.
**Success Criteria:** Full lifecycle of a service request is functional.

**Prompt for AI Agent:**
> "Act as a Senior Product Engineer.
> 
> **Service Lifecycle (Backend & Frontend):**
> - Implement the backend logic and frontend UI for a verified Professional to view available service requests.
> - Add 'Accept' and 'Reject' actions for the Provider. When accepted, link the `professional_id` to the `ServiceRequest`.
> - Add a 'Reschedule' flow: allow both Clients and Providers to propose a new `scheduled_date` and `scheduled_time`. The other party must accept the new time.
> 
> **Provider Calendar Integration:**
> - Enhance the dynamic calendar on the Provider's homepage. It must fetch accepted service requests from the backend and populate the calendar, clearly blocking out busy days/times.
>
> **UI Cleanup:**
> - Remove redundant 'Dashboard' sections on both Client and Provider pages to streamline the user experience.
> - Update Navbar buttons and styling to improve visual hierarchy."

## v1.0.0 - EsponJA
**Goal:** Prove the core value of the business allowing a Client to request a service and for a verified Professional to accept and manage that request autonomously.
**Success Criteria:** Real Security and Authentication Custom integration fully operational.

**Prompt for AI Agent:**
> "Act as a QA and Full-Stack Polish Engineer.
> 
> **End-to-End Validation:**
> - Ensure the entire flow is seamless: A user registers as a Client -> Requests a cleaning service -> A user registers as a Professional -> Passes verification -> Logs in -> Sees the request on their calendar/feed -> Accepts it.
> - Ensure all database queries strictly filter by role and user ID (e.g., Providers only see requests in their region or available requests; Clients only see their own requests).
> 
> **Production Fixes:**
> - Remove global database migrations on startup to prevent Vercel deployment timeouts.
> - Ensure SPA fallback works in Vercel to fix 404s on page refresh.
> - Conduct a comprehensive review of all `.env` configurations to ensure `SECRET_KEY` and N8N Webhook URLs are securely loaded in the production environment."
