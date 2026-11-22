from pydantic import BaseModel, EmailStr
from datetime import datetime
# Different from the post in the models, this post is the expected structure of an user input
# Sometimes the input provides less info that what's really being recorded in database - which is defined in models. 
class CreateProject(BaseModel):
    Title: str
    Description: str

class ResponseProject(CreateProject):
    id: int
    Created: datetime
    OwnerId: int
    owner: Response_User

# User Authentication
class UserCreate(BaseModel):
    Name: str 
    Email: EmailStr
    PasswordHash: str

class Response_User(BaseModel): 
    Name: str
    Email: EmailStr
    created: datetime

    # The returned record is alchemy data, need to convert back to a pydantic model for validation
    class Config:
        from_attributes = True


class User_Login(BaseModel):
    Email: EmailStr
    PasswordHash: str

class Token(BaseModel):
    token: str
    token_type: str

class TokenData(BaseModel):
    id: int