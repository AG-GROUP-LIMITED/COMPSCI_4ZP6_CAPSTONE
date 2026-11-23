from fastapi import FastAPI, Response, status, HTTPException, Depends, APIRouter
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
#Database definitions
from sqlalchemy.orm import Session
from .. import models,utils, schemas, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post('/login', response_model=schemas.Token)
def login(creadential: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.Email == creadential.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="credential invalid")

    if not utils.verify(creadential.password, user.PasswordHash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="creadentail invalid")
        
    #Create token

    token = oauth2.create_access_token({"user_id": user.id})
    #Return token
    return {"token": token, "token_type": "bearer"}