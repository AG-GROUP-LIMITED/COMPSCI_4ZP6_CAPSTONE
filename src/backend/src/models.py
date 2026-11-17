# This file defines tables, which allows sqlalchemy to create them in connected database.


from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import null, text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from .database import Base


class Project(Base):
    __tablename__ = "Project"

    id = Column(Integer, primary_key=True, nullable=False)
    OwnerId = Column(Integer, ForeignKey("User.id" , ondelete="CASCADE"), nullable = False)
    Title = Column(String, nullable=False)
    Diescription = Column(String, nullable=True)    
    Created = Column(TIMESTAMP(timezone=True), server_default = text('now()')  , nullable = False)
    owner = relationship("User")

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key = True, nullable = False)
    Name = Column(String, nullable = False)
    Email = Column(String, nullable = False)
    PasswordHash = Column(String, nullable = False)
    created = Column(TIMESTAMP(timezone=True), server_default = text('now()')  , nullable = False)
