import os
import sqlite3

# Delete the old database
db_path = "database.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"✅ Deleted old database: {db_path}")

# Recreate database with fresh schema
from backend.database import create_db_and_tables, engine
from backend.models import User
from backend.auth import get_password_hash
from sqlmodel import Session


print("Creating new database...")
create_db_and_tables()
print("✅ Database created successfully!")

# Create test user
with Session(engine) as session:
    test_user = User(
        email="test@example.com",
        password_hash=get_password_hash("test123")
    )
    session.add(test_user)
    session.commit()
    print("\n✅ Test user created!")
    print("=" * 50)
    print("   📧 Email: test@example.com")
    print("   🔑 Password: test123")
    print("=" * 50)
