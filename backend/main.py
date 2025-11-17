import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # allowed frontend URLs
    allow_credentials=True, # allow cookies or auth headers if needed.
    allow_methods=["*"], # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # allow any header
)

app.include_router(auth.router)

if __name__ == '__main__':
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)