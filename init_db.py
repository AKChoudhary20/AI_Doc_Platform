from backend.database import create_db_and_tables, engine
from backend.models import User, Project, DocumentSection
from sqlmodel import Session, select

print("Initializing database...")
create_db_and_tables()
print("Database initialized.")

# Create a test user
with Session(engine) as session:
    user = session.exec(select(User).where(User.email == "test@example.com")).first()
    if not user:
        print("Creating test user...")
        from backend.auth import get_password_hash
        user = User(email="test@example.com", password_hash=get_password_hash("password"))
        session.add(user)
        session.commit()
        print("Test user created.")
    else:
        print("Test user already exists.")
