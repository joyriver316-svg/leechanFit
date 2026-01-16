from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import db
import psycopg2.extras

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # 사용자 조회
        # *주의*: 현재는 평문 비밀번호를 사용합니다. 
        # 실제 운영 환경에서는 bcrypt 등을 사용하여 해시된 비밀번호를 비교해야 합니다.
        query = "SELECT * FROM admins WHERE username = %s AND password = %s"
        cursor.execute(query, (request.username, request.password))
        admin = cursor.fetchone()
        
        if not admin:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다.")
            
        return {
            "id": admin['id'],
            "username": admin['username'],
            "name": admin['name'],
            "role": admin['role']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"로그인 오류: {e}")
        raise HTTPException(status_code=500, detail="로그인 처리 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
