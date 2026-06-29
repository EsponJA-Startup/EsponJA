# Prompts Documentation

## MVP - Landing Page

1. You are a top-tier frontend designer and I am a student currently taking a course on entrepreneurship and innovation. Our goal is to develop an MVP (landing page) for our startup. I will send you the ideas, pain points, and solutions we are developing. Help me build this landing page. The interface should be modern and intuitive. Our color palette is rgba(20, 125, 178, 1) and rgba(251, 192, 45, 1). Use React framework. *** description of the project ***

2. This project is an MVP for our startup. I want to improve the landing page with a more clear "client" and "provider" section. Lets add a "Sou um cliente" link in the nav instead of login and register. This will redirect to another page that will have the "Entrar" and "Cadastrar" buttons. So, you need to prototype this new "client" dashboard (not logged yet). Also, add a link in the navbar to the CTA component, like its done with the "Como funciona", "Avaliações", "Segurança".

3. Create logged-in homepage prototypes for Client and Provider. The Client homepage must show service options: Limpeza Rápida, Limpeza Padrão, Limpeza Pesada, Limpeza Pós-obra e Limpeza Pré-mudança. Each has a dropdown that, when selected, redirects to a form page (house/apartment details and client data). No backend—just link the buttons. The Provider homepage must include an "Agenda" section as a monthly calendar. Suggest other relevant market-fit features for each page. Redirects must work as static frontend links.

4. Lets prepare the ground to the backend. The first thing to do is prepare the database schema, the relationship expected is as follows:

    1. Client Model (Client)

        id: UUID (Primary Key)

        name: String

        whatsapp_number: String (Required)

        email: String (Optional)

        created_at: DateTime (Default to current UTC time)

    2. Professional Model (Professional)

        id: UUID (Primary Key)

        name: String

        profile_picture_url: String (Optional)

        rating: Float (Default to 0.0)

        review_count: Integer (Default to 0)

        is_verified: Boolean (Default to False)

        badges: JSON/List of Strings (Use appropriate SQLModel/SQLAlchemy JSON type for SQLite/Postgres compatibility)

        wallet_available: Decimal (Default to 0.00)

        wallet_escrow: Decimal (Default to 0.00)

    3. Service Request Model (ServiceRequest)

        id: UUID (Primary Key)

        client_id: UUID (Foreign Key to Client.id)

        professional_id: UUID (Foreign Key to Professional.id, MUST BE NULLABLE as it starts empty until manually matched)

        status: String (Default to "Pendente")

        service_type: String

        home_type: String

        bedrooms: String

        bathrooms: String

        has_pets: Boolean

        cep: String

        address: String

        scheduled_date: Date

        scheduled_time: Time

        price: Decimal (Optional, to be filled by admin)

        payment_status: String (Default to "Pendente")

Please generate the complete, ready-to-use models.py code based on these specifications.

5. Read client/README first. Then do the following setup:

    Create .env and .env.example with VITE_API_URL=/api

    Install axios and build src/services/api.js with a configured instance, default headers, global interceptors, and 401 error handling

    Update vite.config.js to proxy /api requests to http://localhost:8000

    Rewrite the "Preparing the Frontend for the API" section in client/README.md to document the completed architecture

Goal: Frontend ready to connect to a FastAPI backend with no CORS issues during development.

6. Read again client/README. Then implement the following backend setup and frontend integration:

    Initialize SQLite database and create main.py as FastAPI entry point

    Add password hashing using bcrypt to user models

    Implement POST /api/auth/register and POST /api/auth/login endpoints

    Create a Waitlist model; update CTA.jsx to capture "Contratar" (Customer) or "Trabalhar" (Provider)

    Connect Login.jsx and Register.jsx to FastAPI endpoints with error handling

    Document backend setup in client/README.md with a note about future JWT authentication upgrade

Goal: Fully connected FastAPI backend + React frontend with auth and waitlist functionality.

7. Act as a Senior Full-Stack Engineer specializing in React and FastAPI.

We are building the MVP for a home services marketplace called EsponJÁ. Following Lean Startup methodologies and advice from our mentor, we want to implement a "Painted Door Test" (Fake Door) on our Waitlist.

Our goal is to discover market demand for services beyond basic cleaning. To do this, we want to add an open text field to our waitlist form where customers can explicitly type the service they are looking for (e.g., "Electrician", "Plumber", "AC Repair").

Please provide the updated code for the following requirements:

1. Backend Updates (FastAPI + SQLModel)

    Update the Waitlist model in server/app/models.py. Add a new column called requested_service: str | None = None.

    Update the WaitlistRequest Pydantic schema in server/main.py to accept this new field.

    Ensure the join_waitlist endpoint properly saves this new field to the database.

2. Frontend Updates (React - client/src/components/CTA.jsx)

    Update the CTA.jsx component to include a new state variable for requestedService.

    Add a new text input field to the waitlist form (e.g., placeholder: "Qual serviço você está procurando? Ex: Eletricista, Limpeza...").

    UX Rule: This new input should ideally only be visible if the intendedRole is set to "customer" (Contratar). If they select "provider" (Trabalhar), we don't need to ask this right now.

    Update the api.post('/waitlist', ...) call to include the requested_service in the payload.

Keep the existing styling classes (waitlist-input, waitlist-btn, etc.) intact. Generate only the necessary code snippets for models.py, main.py, and CTA.jsx.


