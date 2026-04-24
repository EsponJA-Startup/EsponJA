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

### 🔌 Preparing the Frontend for the API
We won't write the backend code just yet, but here are the architectural changes we will plan for the React frontend to communicate with FastAPI:

1. **Environment Variables**: We will introduce `.env` files (e.g., `VITE_API_URL=http://localhost:8000`). This ensures the frontend knows where to send requests, allowing seamless transitions between local development, staging, and production.
2. **API Service Layer**: Instead of scattering `fetch` or `axios` calls directly inside our UI components, we will create a `src/services/` directory. This creates a clean boundary: components handle the UI, and services handle the data fetching.
3. **CORS & Proxying**: We will configure Vite's `vite.config.js` to proxy API requests during development to avoid Cross-Origin Resource Sharing (CORS) errors between `localhost:5173` (React) and `localhost:8000` (FastAPI).
4. **State & Error Handling**: We will design robust loading states, success messages, and error boundaries for when the frontend is waiting for the FastAPI server to respond (e.g., during Waitlist registration or User Login).

---

Happy coding! 🧽✨
