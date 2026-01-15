
from fastapi import APIRouter, HTTPException
from database import db
import psycopg2.extras

router = APIRouter(prefix="/api/coaches", tags=["coaches"])

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
