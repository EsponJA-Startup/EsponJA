# EsponJÁ - Startup MVP 🚀

Welcome to the EsponJÁ MVP repository! This project is the initial Minimum Viable Product (MVP) landing page for EsponJÁ, a platform connecting users with verified household professionals.

If you are new to this codebase—or new to modern frontend development in general—this document is tailored for you. It serves as a Senior-level guide to understanding the architecture, the tools we use, and how to start contributing immediately.

---

## 🛠 The Tech Stack: React + Vite

This project is built using **React** and **Vite**. If you haven't used them before, here is a quick primer:

### What is React?
[React](https://react.dev/) is a JavaScript library for building user interfaces. Instead of writing one massive HTML file, React allows us to break our UI into small, reusable pieces called **Components** (e.g., a Button, a Navbar, a Hero section). 
- **JSX**: You'll see files ending in `.jsx`. JSX is a syntax extension that looks like HTML but lives inside JavaScript, allowing us to seamlessly write UI structure alongside logic.
- **State & Props**: Components can hold their own memory ("state") and pass data to each other via "props" (properties).

### What is Vite?
[Vite](https://vitejs.dev/) (French for "quick", pronounced "veet") is our build tool and development server. 
Historically, React apps were built with tools like Webpack (e.g., Create React App), which could be slow. Vite is incredibly fast because it leverages native ES modules in the browser.
- **HMR (Hot Module Replacement)**: When you save a file, Vite instantly updates the UI in your browser without reloading the page, preserving the state of your application.

---

## 📁 Project Structure

We follow a modular, component-based architecture. Here's how the codebase is organized:

```text
mvp-startup/
├── public/             # Static assets that don't need processing (e.g., favicon)
├── src/
│   ├── assets/         # Images, icons, and other media
│   ├── components/     # Reusable React components (Navbar, Hero, CTA, etc.)
│   ├── pages/          # Full page views (Home, Login, Register) tied to routes
│   ├── App.jsx         # The root component that ties everything together (Routing)
│   ├── main.jsx        # The entry point that mounts React to the DOM
│   └── index.css       # Global CSS styles and design system variables
├── index.html          # The main HTML file
├── package.json        # Project metadata, dependencies, and scripts
└── vite.config.js      # Vite configuration file
```

### Key Concepts in Our Structure:
1. **Pages vs. Components**: A "Page" (like `Home.jsx` or `Login.jsx`) represents a specific route URL. A "Component" (like `Hero.jsx` or `Features.jsx`) is a building block that is placed *inside* a Page.
2. **Styling**: We use standard CSS. Each component usually has its own paired CSS file (e.g., `Hero.jsx` and `Hero.css`). Global design tokens (like our signature EsponJÁ yellow colors) are defined in `src/index.css`.
3. **Icons**: We use `lucide-react` for beautiful, consistent SVG icons.

---

## 🚀 Getting Started

Follow these steps to run the project on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### 1. Install Dependencies
Open your terminal, navigate to the project folder, and run:
```bash
npm install
```
*This reads the `package.json` file and downloads all required libraries (like React, React Router, and Lucide icons) into a `node_modules` folder.*

### 2. Start the Development Server
```bash
npm run dev
```
*This starts Vite. You'll get a local URL (usually `http://localhost:5173`). Open it in your browser. Any changes you make to the code will instantly reflect here!*

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the local development server.
- `npm run build`: Bundles the app for production. It optimizes and minifies the code into a `dist/` folder, ready for deployment.
- `npm run preview`: Boots up a local web server that serves the production build from the `dist/` folder, so you can test the production version locally.
- `npm run lint`: Runs ESLint to analyze the code and find potential errors or formatting issues.

---

## 👨‍💻 Beginner's Guide: Creating Your First Component

If you're tasked with creating a new piece of UI, follow this standard workflow:

1. **Create the files**: In `src/components/`, create `MyComponent.jsx` and `MyComponent.css`.
2. **Write the React Component** (`MyComponent.jsx`):
   ```jsx
   import React from 'react';
   import './MyComponent.css'; // Import the specific CSS file

   const MyComponent = () => {
     return (
       <div className="my-component-wrapper">
         <h2>Hello from EsponJÁ!</h2>
       </div>
     );
   };

   export default MyComponent;
   ```
3. **Use it in a Page**: Open a page like `src/pages/Home.jsx`, import your new component, and drop it into the JSX.
   ```jsx
   import MyComponent from '../components/MyComponent';

   // Inside the return statement:
   return (
     <div>
       <MyComponent />
     </div>
   );
   ```

## 🚀 Recent MVP Features

As part of our continuous development, we recently added the foundation for our authenticated experiences:

### Client and Provider Dashboards
We have prototyped the core dashboards for our users:
- **Client Homepage (`/client/home`)**: Clients can quickly select from 5 distinct cleaning services (Rápida, Padrão, Pesada, Pós-obra, Pré-mudança). It also features a "Matching Inteligente" (Smart Matching) preview to show top-rated professionals nearby.
- **Provider Homepage (`/provider/home`)**: Professionals can manage their schedule through a real-time calendar agenda, track their earnings and "Escrow" (retained) payments, and view their Trust Score.

To see these in action, start the development server (`npm run dev`) and click "Entrar" on the main page!

### Backend Database Schema (SQLModel)
While the frontend is currently in a "Wizard of Oz" prototype phase (mocked data), we have laid the groundwork for our Python FastAPI backend. We defined the core database tables in `server/app/models.py` using **SQLModel**:
- **Client**: Stores client details and contact info.
- **Professional**: Stores the professional's profile, Trust Score, badges, and wallet balances.
- **ServiceRequest**: The heart of the marketplace linking a Client to a Professional (when matched), storing service details, address, date, time, and payment status.

## 🎨 Design System Note

EsponJÁ relies heavily on a custom yellow-themed UI to communicate trust, energy, and cleanliness. When styling new components, always check `index.css` first for existing CSS variables (like `--primary-yellow`, `--text-dark`, etc.) rather than hardcoding hex colors. This ensures consistency across the entire app.

## 🏗️ Upcoming Architecture: The FastAPI Backend

As EsponJÁ scales, we are transitioning from a static frontend MVP to a full-stack application. We have chosen **FastAPI** (Python) for our upcoming backend.

If you haven't worked with this stack before, here is our roadmap and how we are preparing for the integration:

### Why FastAPI?
- **Speed**: It is one of the fastest Python frameworks available, built on modern async Python (Starlette & Pydantic).
- **Type Safety**: It uses Python type hints, catching errors early and making the code highly readable.
- **Automatic Docs**: It generates interactive API documentation (Swagger UI) out-of-the-box. This means frontend developers can easily see what endpoints are available and test them directly in the browser.

### 📂 Repository Restructuring Plan
To support the backend within GitHub, we will be transitioning this repository into a structured workspace. You can expect the root folder to evolve to look like this:

```text
esponja-platform/
├── frontend/           # The current React + Vite app will live here
├── backend/            # The new FastAPI Python app will live here
│   ├── main.py         # FastAPI entry point
│   ├── api/            # API routes/controllers
│   ├── models/         # Database models and schemas
│   └── requirements.txt
└── README.md
```

### 🔌 Frontend API Integration 
The frontend architecture has been prepared to seamlessly communicate with the upcoming FastAPI backend. Here are the core integrations implemented:

1. **Environment Variables**: We introduced `.env` and `.env.example` files. This configuration explicitly manages environment-specific variables like `VITE_API_URL`, allowing smooth transitions across development, staging, and production environments.
2. **Centralized API Service Layer**: `axios` has been integrated to handle HTTP requests. We've established a dedicated service layer in `src/services/api.js`. This creates a robust separation of concerns where UI components handle rendering and the service layer manages data fetching, default headers, and global interceptors (e.g., handling 401 Unauthorized errors).
3. **CORS & Development Proxying**: The Vite configuration (`vite.config.js`) is now set up to proxy all requests starting with `/api` directly to `http://localhost:8000`. This effortlessly sidesteps Cross-Origin Resource Sharing (CORS) issues during local development between the React frontend and the FastAPI server.
4. **State & Error Handling Foundation**: The `axios` interceptors provide a solid groundwork for implementing robust loading states, success notifications, and comprehensive error handling once the frontend connects to live endpoints (e.g., Waitlist registration or User Login).

### ⚙️ MVP Backend Integration (FastAPI + SQLModel)
We have successfully built the initial bridge between our React frontend and the FastAPI backend, utilizing a local SQLite database for the MVP phase.

1. **Authentication (Login & Register)**:
   - The `Client` and `Professional` models were updated to securely hash and store passwords using `passlib[bcrypt]`.
   - The `Register.jsx` and `Login.jsx` components now communicate directly with `POST /api/auth/register` and `POST /api/auth/login`. This effectively saves new users to the database and verifies credentials upon login, dynamically routing them to their respective dashboards.
   > [!NOTE]
   > **Future Implementation Note (JWT Auth)**: Currently, the backend uses a simulated session response (returning the role and user ID). Before launching to production, we must implement robust **JWT-based authentication** (JSON Web Tokens) to secure protected routes.

2. **Waitlist (Lista de Espera)**:
   - A dedicated `Waitlist` table was created in `models.py` to capture early-adopter interest.
   - The waitlist form (`CTA.jsx`) has been upgraded to not only capture the user's `email` but also their intended role (`customer` or `provider`), sending data to `POST /api/waitlist`.

---

## 🚀 Development and Integration History (EsponJÁ MVP)

## 1. Frontend Foundation (UI and UX)
* **Chosen Stack:** We built the application using **React + Vite** to ensure fast and optimized development.
* **Design System:** We implemented a color palette focused on trust and energy (blue and yellow/gold), using custom CSS and `lucide-react` icons.
* **Pages and Routing:** We created routes with `react-router-dom` for the Landing Page (Hero, How It Works, Features, Testimonials), Authentication pages (Login and Register), and specific Dashboards (Client Home and Provider Home).
* **API Service:** We centralized HTTP calls using `axios`, setting up interceptors and error handling (e.g., 401 Unauthorized), and configured a proxy in `vite.config.js` to avoid CORS issues in local development.

## 2. Backend Foundation (Logic and Database)
* **Chosen Stack:** We developed the API with **Python 3.11 and FastAPI**, taking advantage of its strong typing and automatic documentation.
* **Data Modeling (SQLModel):** We structured the initial database (first in SQLite, then migrated to PostgreSQL) with the main tables:
  * `Client`: Client data and contacts.
  * `Professional`: Profile, Trust Score, badges, and wallet of the professionals.
  * `ServiceRequest`: The central table for matching clients and professionals.
  * `Waitlist`: To capture interested leads for the platform.
* **MVP Authentication:** We implemented password hashing using `bcrypt` and created the `POST /api/auth/register` and `POST /api/auth/login` endpoints.

## 3. Cloud Infrastructure and Deployment (Production)
To launch the MVP and make it accessible to the public, we separated the application into three cloud services:

* **Database (Neon.tech):** We migrated from local SQLite to Serverless PostgreSQL on Neon. This provided a robust cloud database that automatically scales (scale-to-zero) when not in use.
* **Backend (Render):** We deployed the FastAPI API as a free *Web Service* on Render. We configured the `DATABASE_URL` variable to connect with Neon and adjusted the startup command (`uvicorn main:app --host 0.0.0.0 --port 10000`).
* **Frontend (Vercel):** We hosted the React app on Vercel, configuring the `VITE_API_URL` environment variable to point to the production URL on Render (`https://esponja.onrender.com/api`).

## 4. DevOps Conflict Resolution (Troubleshooting)
During the cloud-to-cloud integration, we faced and resolved crucial infrastructure challenges:
* **CORS Conflict and 404 Status:** The Frontend (Vercel) had its preflight (`OPTIONS`) requests blocked. We diagnosed that:
  1. There was a strict security inconsistency: using `allow_credentials=True` with `allow_origins=["*"]` caused a silent crash in Uvicorn during startup. We fixed this by setting `allow_credentials=False`.
  2. The Frontend base URL was pointing to an incorrect subdomain (`esponja-backend.onrender.com` instead of `esponja.onrender.com`), which resulted in a 404 error (route not found) even before reaching the API.
* **Database Connection Timeout:** We verified Neon's behavior (which enters sleep mode) during FastAPI's `lifespan`, ensuring the connection time wouldn't exceed Render's health check limit during deployment.

## 5. Next Steps (Roadmap)
* **Robust Authentication:** Replace the current session simulation with real **JWT (JSON Web Tokens)** authentication to protect backend routes.
* **Real Data Integration:** Replace the mocked data in the Client and Professional dashboards with GET requests (e.g., list pending services, schedule, etc.) from the Neon database.

Happy coding! 🧽✨
