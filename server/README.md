# EsponJÁ - Backend Server 🚀

Welcome to the EsponJÁ backend repository! This folder contains the API and database logic that powers the EsponJÁ MVP marketplace. 

If you are new to this codebase—or new to Python backend development—this document is tailored for you. It serves as a beginner-friendly guide to understanding the architecture, the tools we use, and how to start contributing immediately.

---

## 🛠 The Tech Stack: FastAPI + SQLModel

Our backend is built for speed, simplicity, and modern Python practices.

### What is FastAPI?
[FastAPI](https://fastapi.tiangolo.com/) is a modern, fast, web framework for building APIs with Python. 
- **Type Safety**: It uses standard Python type hints. This means you get great editor support (autocompletion) and automatic data validation. If a route expects an integer and gets a string, FastAPI handles the error automatically.
- **Automatic Docs**: It generates interactive API documentation out-of-the-box. You can see and test all available endpoints by visiting `/docs` in your browser when the server is running.

### What is SQLModel?
[SQLModel](https://sqlmodel.tiangolo.com/) is a library for interacting with SQL databases from Python code. It is designed to be used with FastAPI. It combines **SQLAlchemy** (the industry standard for database interaction) with **Pydantic** (data validation), meaning you write classes once, and they work as both database tables and API data schemas.

---

## 📁 Project Structure

We follow a modular architecture. Here's how the backend is organized:

```text
server/
├── app/
│   ├── auth.py         # JWT Token creation and validation
│   ├── database.py     # Database engine setup and connection
│   └── models.py       # SQLModel classes (Tables: Client, Professional, etc.)
├── main.py             # The core FastAPI application and API routes
├── requirements.txt    # Python dependencies list
├── .env                # Secret environment variables (e.g., SECRET_KEY)
└── database.db         # Local SQLite database file (created automatically)
```

---

## 🚀 Getting Started

Follow these steps to run the backend on your local machine.

### Prerequisites
Make sure you have [Python 3.10+](https://www.python.org/) installed.

### 1. Set Up a Virtual Environment
It's a best practice to keep Python dependencies isolated. Navigate to the `server/` folder and create a virtual environment:
```bash
python -m venv venv
```
Activate it:
- **Mac/Linux**: `source venv/bin/activate`
- **Windows**: `venv\Scripts\activate`

### 2. Install Dependencies
With the virtual environment active, install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `server/` directory. It should contain secure keys:
```text
SECRET_KEY=your_generated_random_secret_here
```

### 4. Start the Development Server
Run the FastAPI application using Uvicorn (an ASGI web server):
```bash
uvicorn main:app --reload --port 8000
```
*The `--reload` flag means the server will automatically restart whenever you make changes to the code. The API will be available at `http://localhost:8000`.*

---

## 📖 API Documentation & Testing

One of the best features of FastAPI is the automatic documentation. While the server is running, open your browser and navigate to:
**[http://localhost:8000/docs](http://localhost:8000/docs)**

You will see a beautiful interface (Swagger UI) where you can explore every endpoint, see what data they require, and even test them directly!

---

## 👨‍💻 Beginner's Guide: Understanding the Code

### 1. Database Models (`app/models.py`)
This is where we define what data we store. For example, the `Waitlist` class defines a table in our SQLite database. Adding a new field here automatically adds it to the database when the app starts.

### 2. API Routes (`main.py`)
This file handles the incoming web requests. An endpoint looks like this:
```python
@app.get("/api/hello")
def say_hello():
    return {"message": "Hello from EsponJÁ!"}
```
This tells FastAPI: "When someone visits `/api/hello` with a GET request, run this function and return the data."

### 3. Authentication (`app/auth.py`)
We use **JWT (JSON Web Tokens)** for secure authentication. 
- When a user logs in, `main.py` calls `create_access_token` to generate a secure badge (token) valid for 24 hours.
- For protected routes, we use the `get_current_user` dependency. It checks if the user's request includes a valid token before letting them access the data.

---

Happy coding! 🧽✨
