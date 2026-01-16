import psycopg2
import psycopg2.extras
from database import db

def check_users():
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        names = ['이소윤', '김민희']
        
        print(f"Checking for users: {names}")
        
        for name in names:
            cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
            users = cursor.fetchall()
            if users:
                print(f"\n[FOUND] {name}:")
                for u in users:
                    print(f"  - ID: {u['id']}, Phone: {u['phone']}, ProductID: {u['product_id']}")
            else:
                print(f"\n[NOT FOUND] {name}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.return_connection(conn)

if __name__ == "__main__":
    check_users()
