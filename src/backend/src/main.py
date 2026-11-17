from fastapi import FastAPI, Response, status, HTTPException, Depends
# from fastapi.params import Body
from typing import Optional, List
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import time
#Database definitions
from sqlalchemy.orm import Session
from . import models#,utils, schemas
from .database import engine, SessionLocal
#from .routers import post, user, auth
#User

models.Base.metadata.create_all(bind=engine)    # Creates tables defined in models


app = FastAPI()

#decorator - that bounds this function to app instance. A GET request will be sent to server, and the client will receive the return of the root() function: a message
#A decorator will modify the decorated function. Here, I guess the app.get("/") decorator enables the root() function to be called when the app is requested at root path.
@app.get("/")   
async def root():
    return {"message": "heeeello world", "user": "AG Group"}
