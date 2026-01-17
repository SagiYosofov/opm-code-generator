import uvicorn
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, opm, projects

load_dotenv()

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # allowed frontend URLs
    allow_credentials=True, # allow cookies or auth headers if needed.
    allow_methods=["*"], # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # allow any header
)

app.include_router(auth.router)
app.include_router(opm.router)
app.include_router(projects.router)

@app.get("/")
async def root():
    return {"message": "OPM Code Generator API"}
