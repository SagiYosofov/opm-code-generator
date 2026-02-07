# OPM Code Generator

OPM Code Generator is a web-based application designed to bridge the gap between conceptual system modeling and executable code.  
By leveraging **Object-Process Methodology (OPM)** and **AI-driven logic**, the system enables users to transform structural diagrams into functional source code automatically.

---

## 🚀 Features

- **Diagram Processing**  
  Upload or select OPM diagrams for automated analysis.

- **AI-Powered Generation**  
  Translates OPM models into executable code using a **Gemini AI Agent**.

- **Project Management**  
  Organize, manage, and track generated artifacts within a personalized workspace.

- **Real-time Interaction**  
  Modern, responsive UI for a seamless diagram-to-code workflow.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), JavaScript, HTML/CSS  
- **Backend:** Python (FastAPI)  
- **Database:** MongoDB  
- **AI Engine:** Gemini Agent API  
- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Render  

---

## 📁 Project Structure

The repository is organized into two main directories:

```text
/backend
  ├─ FastAPI server
  ├─ Gemini AI integration
  ├─ OPM parsing logic
  └─ Database schemas

/frontend
  ├─ React application
  ├─ Global state management (Context API)
  └─ UI components
```

---

## ⚙️ Installation & Setup

### Prerequisites

Ensure the following tools are installed on your system:

- **Python:** Version 3.12 or higher  
- **Node.js:** Version v22.11.0 or higher  
- **Git:** For version control  

---

### Local Setup

#### Clone the Repository
```bash
git clone https://github.com/SagiYosofov/opm-code-generator.git
```

#### Navigate to the project's root directory
```bash
cd opm-code-generator 
```

### Frontend Setup

Navigate to the frontend directory, install dependencies and start the development server:

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment  
Windows
```bash
.venv\Scripts\activate
```

macOS / Linux
```bash
source .venv/bin/activate
```

Install dependencies and start the server
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🔐 Environment Variables

The system relies on environment variables for sensitive data and environment-specific configurations.  
These should be stored in `.env` files within their respective directories and **never** committed to version control.

### Backend (`backend/.env`)
Create a file named `.env` in the `backend/` directory and add the following:

```env
# URL where your frontend is hosted
FRONTEND_URL=your_frontend_url

# MongoDB connection string
MONGO_URI=your_mongodb_connection_string

# Name of the MongoDB database
MONGO_DB_NAME=your_database_name

# API key for Gemini AI service
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env`)
Create a file named `.env` in the `frontend/` directory and add the following:

```env
# Base URL of the backend API
VITE_API_URL=your_base_server_url
```

---

## 🌐 Deployment

**Live Frontend:** [https://opm-code-generator.vercel.app/](https://opm-code-generator.vercel.app/)  
**Live Backend:** [https://opm-code-generator-backend.onrender.com/](https://opm-code-generator-backend.onrender.com/)  

> **Note:** The backend uses Render's free tier.  
> If inactive for 15 minutes, it will spin down and may take a moment to "wake up" upon your first request.

---

## ⚠️ Gemini AI Usage Notes

This project uses the **free tier of the Gemini AI API**, which comes with:

- A limited number of tokens per day.
- Restrictions on prompt size and frequency.

> If you exceed these limits, API requests may fail or be delayed until the quota resets.

---