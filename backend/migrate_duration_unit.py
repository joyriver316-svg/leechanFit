import psycopg2
from database import db

def migrate():
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='duration_unit'
        """)
        
        if not cursor.fetchone():
            print("Adding duration_unit column...")
            cursor.execute("ALTER TABLE products ADD COLUMN duration_unit VARCHAR(10) DEFAULT 'months'")
            conn.commit()
            print("✅ Migration successful: duration_unit column added.")
        else:
            print("ℹ️ Column duration_unit already exists.")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
    finally:
        db.return_connection(conn)

if __name__ == "__main__":
    migrate()
