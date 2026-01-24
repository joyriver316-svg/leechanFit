from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import db
import psycopg2.extras

router = APIRouter(prefix="/api/coaches", tags=["coaches"])

class CoachCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    specialty: Optional[str] = 'FPT'
    status: Optional[str] = 'active'

class CoachUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
def get_coaches():
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM coaches ORDER BY name")
        coaches = cursor.fetchall()
        return coaches
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="코치 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.get("/{id}")
def get_coach(id: str):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM coaches WHERE id = %s", (id,))
        coach = cursor.fetchone()
        if not coach:
            raise HTTPException(status_code=404, detail="코치를 찾을 수 없습니다.")
        return coach
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="코치 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.post("/")
def create_coach(coach: CoachCreate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Generate new ID
        cursor.execute("SELECT id FROM coaches WHERE id ~ '^C[0-9]+$' ORDER BY id DESC LIMIT 1")
        last = cursor.fetchone()
        if last:
            num = int(last['id'][1:]) + 1
        else:
            num = 1
        new_id = f"C{num:03d}"

        cursor.execute(
            "INSERT INTO coaches (id, name, phone, specialty, status) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (new_id, coach.name, coach.phone, coach.specialty, coach.status)
        )
        new_coach = cursor.fetchone()
        conn.commit()
        return new_coach
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="코치 추가 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.put("/{id}")
def update_coach(id: str, coach: CoachUpdate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        updates = []
        values = []
        if coach.name is not None:
            updates.append("name = %s")
            values.append(coach.name)
        if coach.phone is not None:
            updates.append("phone = %s")
            values.append(coach.phone)
        if coach.specialty is not None:
            updates.append("specialty = %s")
            values.append(coach.specialty)
        if coach.status is not None:
            updates.append("status = %s")
            values.append(coach.status)

        if not updates:
            raise HTTPException(status_code=400, detail="수정할 내용이 없습니다.")

        values.append(id)
        query = f"UPDATE coaches SET {', '.join(updates)} WHERE id = %s RETURNING *"
        cursor.execute(query, values)
        updated = cursor.fetchone()

        if not updated:
            raise HTTPException(status_code=404, detail="코치를 찾을 수 없습니다.")

        conn.commit()
        return updated
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="코치 수정 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.delete("/{id}")
def delete_coach(id: str):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM coaches WHERE id = %s", (id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="코치를 찾을 수 없습니다.")
        conn.commit()
        return {"message": "코치가 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="코치 삭제 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
