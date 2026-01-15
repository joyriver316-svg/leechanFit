
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def init_db():
    conn = None
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        cursor = conn.cursor()

        # Read schema.sql
        with open('database/schema.sql', 'r', encoding='utf-8') as f:
            schema = f.read()
            print("Running schema.sql...")
            cursor.execute(schema)

        # Read seed.sql
        with open('database/seed.sql', 'r', encoding='utf-8') as f:
            seed = f.read()
            print("Running seed.sql...")
            cursor.execute(seed)

        conn.commit()
        print("✅ Database initialized successfully.")

    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_db()
