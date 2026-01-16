
from fastapi import APIRouter, HTTPException
from typing import Optional
from database import db
from models import AttendanceCreate
import psycopg2.extras

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("/")
def get_attendance(startDate: Optional[str] = None, endDate: Optional[str] = None, userId: Optional[str] = None):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT a.*, u.name as user_name, 'General' as user_type
            FROM attendance a
            JOIN users u ON a.user_id = u.id
        """
        params = []
        conditions = []

        if startDate:
            conditions.append("a.date >= %s")
            params.append(startDate)
        
        if endDate:
            conditions.append("a.date <= %s")
            params.append(endDate)
        
        if userId:
            conditions.append("a.user_id = %s")
            params.append(userId)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY a.date DESC, a.time DESC"
        
        cursor.execute(query, tuple(params))
        attendance_records = cursor.fetchall()
        
        # Transform to camelCase for frontend
        result = []
        for record in attendance_records:
            result.append({
                'id': record['id'],
                'userId': record['user_id'],
                'userName': record['user_name'],
                'userType': record['user_type'],
                'date': str(record['date']),
                'time': str(record['time']),
                'status': record.get('status', 'Present')
            })
        
        return result
    except Exception as e:
        print(f"Error in get_attendance: {e}")
        raise HTTPException(status_code=500, detail=f"출석 조회 중 오류가 발생했습니다: {str(e)}")
    finally:
        db.return_connection(conn)

@router.post("/", status_code=201)
def check_attendance(attendance: AttendanceCreate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # 회원 존재 여부 확인
        cursor.execute("SELECT id FROM users WHERE id = %s", (attendance.userId,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다.")

        query = """
            INSERT INTO attendance (user_id, date, time, status)
            VALUES (%s, %s, %s, %s)
            RETURNING *
        """
        cursor.execute(query, (
            attendance.userId, attendance.date, attendance.time, attendance.status
        ))
        conn.commit()
        new_attendance = cursor.fetchone()
        return new_attendance
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="이미 해당 시간에 출석 기록이 존재합니다.")
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="출석 체크 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.get("/stats")
def get_attendance_stats(startDate: Optional[str] = None, endDate: Optional[str] = None):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT 
                DATE(date) as attendance_date,
                COUNT(*) as total_count,
                COUNT(DISTINCT user_id) as unique_users
            FROM attendance
        """
        params = []
        conditions = []

        if startDate:
            conditions.append("date >= %s")
            params.append(startDate)
        
        if endDate:
            conditions.append("date <= %s")
            params.append(endDate)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " GROUP BY DATE(date) ORDER BY attendance_date DESC"
        
        cursor.execute(query, tuple(params))
        stats = cursor.fetchall()
        return stats
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="출석 통계 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
