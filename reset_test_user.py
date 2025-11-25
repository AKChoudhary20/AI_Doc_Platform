from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash
from sqlmodel import Session, select

print("Resetting test user password...")

with Session(engine) as session:
    # Delete existing test user
    user = session.exec(select(User).where(User.email == "test@example.com")).first()
    if user:
        session.delete(user)
        session.commit()
        print("Deleted existing test user")
    
    # Create fresh test user with known password
    new_user = User(
        email="test@example.com",
        password_hash=get_password_hash("test123")
    )
    session.add(new_user)
    session.commit()
    print("✅ Test user created successfully!")
    print("   Email: test@example.com")
    print("   Password: test123")
