# This file defines ORM: a Sqlalchemy instance

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

member_password = os.environ['GRID_POSTGRES_MEMBER_PASS']
# to local database - TODO: auto fall back to local postgres if remote database server not responding
# SQLALCHEMY_DATABASE_URL = 'postgresql://ag_member:AG_GROUP@localhost/grid_data'
SQLALCHEMY_DATABASE_URL = 'postgresql://ag_member:' + member_password + '@130.113.68.135/grid_data'

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit = False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()