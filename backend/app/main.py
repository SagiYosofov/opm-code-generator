from fastapi import FastAPI
from routers import auth  # import your router

app = FastAPI()

app.include_router(auth.router)
