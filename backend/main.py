from fastapi import FastAPI
from routers import auth
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # allowed frontend URLs
    allow_credentials=True, # allow cookies or auth headers if needed.
    allow_methods=["*"], # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # allow any header
)

app.include_router(auth.router)
