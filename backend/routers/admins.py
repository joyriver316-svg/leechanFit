from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import db
import psycopg2.extras

router = APIRouter(prefix="/api/admins", tags=["admins"])

class AdminCreate(BaseModel):
    username: str
    password: str
    name: str
    role: Optional[str] = 'admin'

class AdminUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

@router.get("/")
def get_admins():
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT id, username, name, role, created_at FROM admins ORDER BY created_at DESC")
        admins = cursor.fetchall()
        return admins
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="관리자 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.post("/")
def create_admin(admin: AdminCreate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if username already exists
        cursor.execute("SELECT id FROM admins WHERE username = %s", (admin.username,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

        cursor.execute(
            "INSERT INTO admins (username, password, name, role) VALUES (%s, %s, %s, %s) RETURNING id, username, name, role, created_at",
            (admin.username, admin.password, admin.name, admin.role)
        )
        new_admin = cursor.fetchone()
        conn.commit()
        return new_admin
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="관리자 추가 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.put("/{id}")
def update_admin(id: int, admin: AdminUpdate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        updates = []
        values = []
        if admin.name is not None:
            updates.append("name = %s")
            values.append(admin.name)
        if admin.password is not None:
            updates.append("password = %s")
            values.append(admin.password)
        if admin.role is not None:
            updates.append("role = %s")
            values.append(admin.role)

        if not updates:
            raise HTTPException(status_code=400, detail="수정할 내용이 없습니다.")

        values.append(id)
        query = f"UPDATE admins SET {', '.join(updates)} WHERE id = %s RETURNING id, username, name, role, created_at"
        cursor.execute(query, values)
        updated = cursor.fetchone()

        if not updated:
            raise HTTPException(status_code=404, detail="관리자를 찾을 수 없습니다.")

        conn.commit()
        return updated
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="관리자 수정 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.delete("/{id}")
def delete_admin(id: int):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if it's the default admin
        cursor.execute("SELECT username FROM admins WHERE id = %s", (id,))
        admin = cursor.fetchone()
        if admin and admin['username'] == 'admin':
            raise HTTPException(status_code=400, detail="기본 관리자 계정은 삭제할 수 없습니다.")

        cursor.execute("DELETE FROM admins WHERE id = %s", (id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="관리자를 찾을 수 없습니다.")
        conn.commit()
        return {"message": "관리자가 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="관리자 삭제 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
