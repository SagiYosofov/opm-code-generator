from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")
USERS_COLLECTION_NAME = "users"
OPM_GENERATIONS_COLLECTION_NAME = "opm_generations"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db[USERS_COLLECTION_NAME]
opm_generations_collection = db[OPM_GENERATIONS_COLLECTION_NAME]
