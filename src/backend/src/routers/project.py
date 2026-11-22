from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
#from fastapi.params import Body
from typing import List
#Database definitions
from sqlalchemy.orm import Session
from .. import models, schemas,utils, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)

@router.get("/", response_model=List[schemas.ResponseProject])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()

    return projects  #fastapi will convert list of dict into JSON automatically


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.ResponseProject)    #the status_code parameter defines the default status code of the response
def create_project(user_input: schemas.CreateProject,  db: Session = Depends(get_db), current_user = Depends(oauth2.get_current_user)): 
    new_project = models.Project(OwnerId = current_user.id, **user_input.model_dump())
    #new_project.OwnerId = 
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project 

