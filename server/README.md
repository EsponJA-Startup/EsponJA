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

### 3. Security & Authentication (`app/auth.py` & `main.py`)
Security is a top priority for the EsponJÁ MVP. We use a robust **JWT (JSON Web Tokens)** system combined with strict data validation:
- **HttpOnly Cookies**: When a user logs in, their JWT is stored in a secure, `HttpOnly` cookie. This means malicious scripts (XSS) cannot access the token, making the app much more secure than storing tokens in `localStorage`.
- **Protected Routes**: We use the `get_current_user` dependency to verify the token. It also enforces Role-Based Access Control (RBAC), ensuring that clients, providers, and admins can only access data they own (preventing IDOR - Insecure Direct Object Reference).
- **Secure Logout**: Our `/api/auth/logout` endpoint actively destroys the session cookie on the browser, guaranteeing the session is completely terminated.
- **Data Validation & DoS Protection**: Thanks to Pydantic and `SQLModel`, every incoming request is strictly validated. We enforce max string lengths (e.g., `Field(max_length=255)`) to prevent attackers from sending massive payloads that could exhaust server memory (Denial of Service).
- **Timing Attack Mitigation**: Sensitive checks, like the Admin password login, use `hmac.compare_digest()` to securely compare strings in constant time.


## 🤖 Automation Setup (n8n)

EsponJÁ uses **n8n** for handling email sending and other automated workflows. Follow these steps to set up your local environment:

### 1. Start the Containers
From the root directory of the project (where the `docker-compose.yml` is located), spin up Docker:
```bash
sudo docker-compose up -d
```
Access the interface at `http://localhost:5678`.

### 2. Import the Workflow
Inside n8n, go to **Workflow Settings > Import from File** and select the `.json` file located in the `n8n_workflows/` folder.

### 3. Configure Email Credentials
*For security reasons, credentials are not committed to the repository.*
- On the **Send Email** node, go to **Set up credential > Create New (SMTP)**.
- **Host:** `smtp.gmail.com`
- **Port:** `465` (with SSL/TLS enabled)
- **User:** Your testing email address
- **Password:** Your Google App Password (do not use your main personal password).

### 4. Activate the Workflow
- Click the **Publish** button (top right corner) to activate the automation.
- Open the **Webhook** node, switch to **Production URL**, and copy the link.
- Update this URL in your backend code (`main.py` or your `.env` file) to ensure production-ready communication.


---

Happy coding! 🧽✨
