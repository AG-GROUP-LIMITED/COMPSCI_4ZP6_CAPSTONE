from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from fastapi.params import Body
#Database definitions
from sqlalchemy.orm import Session
from .. import models,utils, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Response_User)    #the status_code parameter defines the default status code of the response
def create_user(user_input: schemas.UserCreate, db: Session = Depends(get_db)): 
    #hash passwords - this should probably be done at front end, since anyone who listens
    # to the network would be able to get raw password.
    user_input.PasswordHash = utils.hash(user_input.PasswordHash)
    

    new_user = models.User(**user_input.model_dump())
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user 
    except:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="user creation failed")


@router.get("/{id}", status_code=status.HTTP_200_OK, response_model=schemas.Response_User)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user with id {id} not found")
    return user