from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")

def hash(raw: str):
    return pwd_context.hash(raw)

def verify(input_password: str, stored_hash: str):
    return pwd_context.verify(input_password, stored_hash)