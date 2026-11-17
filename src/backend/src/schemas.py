from pydantic import BaseModel, EmailStr
from datetime import datetime
# Different from the post in the models, this post is the expected structure of an user input
# Sometimes the input provides less info that what's really being recorded in database - which is defined in models. 
class CreateProject(BaseModel):
    OwnerId: int
    Title: str
    Description: str

class ResponseProject(CreateProject):
    id: int
    Created: datetime

