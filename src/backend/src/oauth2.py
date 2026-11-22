from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from . import schemas
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from . import database, models
from sqlalchemy.orm import Session
import os
print()

oauth_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRETE_KEY = os.environ['GRID_AUTH_KEY']
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(_payload: dict):
    payload = _payload.copy()
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire_time})
    #print(datetime.now(timezone.utc).isoformat())
    #print(expire_time.isoformat())
    token = jwt.encode(payload, SECRETE_KEY, algorithm=ALGORITHM)
    return token 


# raise exception if the given token failed to be decoded with the secrete key
# Otherwise, return the payload, which contains the user id 
def verify_access_token(token: str, credentials_exception):
    try:
        decoded_token = jwt.decode(token, SECRETE_KEY, algorithms=[ALGORITHM])
        #print(decoded_token)
        #print(datetime.now(timezone.utc).isoformat())
        id = decoded_token.get("user_id")

        if id is None:
            raise credentials_exception
        token_payload = schemas.TokenData(id=id)
    except ExpiredSignatureError:
        print("token expired")
        raise credentials_exception
    except JWTError:
        raise credentials_exception
    return token_payload

# Return user id, if token from login is valid
def get_current_user(token: str = Depends(oauth_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"})

    payload = verify_access_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.id == payload.id).first()
    return user