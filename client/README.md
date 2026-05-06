# EsponJÁ - Frontend Client 🚀

Welcome to the EsponJÁ frontend repository! This folder contains the user interface and components for the EsponJÁ MVP marketplace, a platform connecting users with verified household professionals.

If you are new to this codebase—or new to modern frontend development in general—this document is tailored for you. It serves as a beginner-friendly guide to understanding the architecture, the tools we use, and how to start contributing immediately.

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
client/
├── public/             # Static assets that don't need processing (e.g., favicon)
├── src/
│   ├── assets/         # Images, icons, and other media
│   ├── components/     # Reusable React components (Navbar, Hero, CTA, etc.)
│   ├── pages/          # Full page views (Home, Login, Register) tied to routes
│   ├── services/       # API integration logic (e.g., api.js with Axios)
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

Follow these steps to run the frontend on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### 1. Install Dependencies
Open your terminal, navigate to the `client/` folder, and run:
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

---

## 🔌 API Integration

The frontend seamlessly communicates with the FastAPI backend located in the `server/` directory.

1. **Centralized API Service Layer**: We use `axios` to handle HTTP requests in `src/services/api.js`. This file acts as the central hub for data fetching. It automatically injects the **JWT Authentication Token** into outgoing requests and globally handles unauthorized (401) errors by logging the user out.
2. **Development Proxying**: The Vite configuration (`vite.config.js`) proxies all requests starting with `/api` directly to `http://localhost:8000`. This effortlessly sidesteps CORS issues during local development.

## 🎨 Design System Note

EsponJÁ relies heavily on a custom yellow-themed UI to communicate trust, energy, and cleanliness. When styling new components, always check `index.css` first for existing CSS variables (like `--primary-yellow`, `--text-dark`, etc.) rather than hardcoding hex colors. This ensures consistency across the entire app.

---

Happy coding! 🧽✨
