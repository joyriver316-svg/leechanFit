
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from database import db
from models import UserCreate, UserUpdate
import psycopg2.extras
from datetime import timedelta, date # Import date class explicitly

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/export")
def export_users(type: Optional[str] = None):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Join with products to get product name
        query = """
            SELECT u.*, p.name as product_name, p.reg_months 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
        """
        params = []
        if type: # type filter usually meant membership type, now product name? Let's assume user passes product_id or we filter by joined name. 
                 # For backward compatibility or simplicity, let's filter by product_id if passed as 'type' or just ignore for now if not critical.
                 # User asked to "change type to product_id", so client likely sends product_id.
                 # But sticking to previous logic, let's assume 'type' parameter might be used for product_id filtering.
            if type.isdigit():
                 query += " WHERE u.product_id = %s"
                 params.append(type)
        
        query += " ORDER BY u.created_at DESC"
        
        cursor.execute(query, tuple(params))
        users = cursor.fetchall()
        
        import openpyxl
        from io import BytesIO
        from fastapi.responses import StreamingResponse
        from datetime import datetime
        from urllib.parse import quote

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "회원 목록"
        
        headers = ['ID', '이름', '성별', '전화번호', '회원권 유형', '등록 개월', '등록일', '시작일', '종료일', '잔여 횟수']
        ws.append(headers)
        
        for user in users:
            ws.append([
                user['id'], user['name'], user['gender'], user['phone'], user['product_name'] or 'Unknown',
                user['reg_months'], user['reg_date'], user['start_date'], user['end_date'], user['remaining']
            ])
            
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        today = datetime.now().strftime("%Y-%m-%d")
        filename = f"회원목록_{today}.xlsx"
        encoded_filename = quote(filename)
        
        headers = {
            'Content-Disposition': f'attachment; filename="{encoded_filename}"'
        }
        return StreamingResponse(buffer, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="엑셀 다운로드 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.get("/template")
def get_template():
    try:
        import openpyxl
        from io import BytesIO
        from fastapi.responses import StreamingResponse
        from urllib.parse import quote

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "회원 양식"
        
        # Modified headers to match new structure concepts (User puts product ID? Or Product Name? 
        # Ideally user puts Product Name and we look it up, or we provide a list. 
        # For simplicity, let's keep "회원권 유형" and expect the user to input the Product ID or Name. 
        # Giving Product ID is safer for now.)
        headers = ['이름', '성별', '전화번호', '상품명', '접수일', '시작일', '종료일', '잔여 횟수']
        ws.append(headers)
        
        # Sample data
        samples = [
            ['홍길동', '남', '010-1234-5678', 'FPT 12개월', '2026-01-15', '2026-01-15', '2027-01-15', 100],
            ['김영희', '여', '010-2345-6789', 'FPT 6개월', '2026-01-15', '2026-01-15', '2026-07-15', 50]
        ]
        for row in samples:
            ws.append(row)
            
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        filename = "회원등록양식.xlsx"
        encoded_filename = quote(filename)
        
        headers = {
            'Content-Disposition': f'attachment; filename="{encoded_filename}"'
        }
        return StreamingResponse(buffer, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="양식 다운로드 중 오류가 발생했습니다.")

@router.get("/")
def get_users(type: Optional[str] = None, search: Optional[str] = None):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Join with products
        query = """
            SELECT u.*, p.name as product_name, p.reg_months 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
        """
        params = []
        conditions = []

        if type and type.isdigit():
            conditions.append("u.product_id = %s")
            params.append(type)
        
        if search:
            conditions.append("(u.name ILIKE %s OR u.phone ILIKE %s)")
            params.append(f"%{search}%")
            params.append(f"%{search}%")
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY u.created_at DESC"
        
        cursor.execute(query, tuple(params))
        users = cursor.fetchall()
        
        # Transform for frontend if needed (map snake_case to CamelCase or keep as is? 
        # Pydantic models expect CamelCase inputs but outputs are usually determined by response_model or dict.
        # Let's map key fields to what frontend expects if it expects 'type' and 'regMonths'.
        # Actually frontend likely expects 'productName' and 'regMonths' now, or we adapt.
        # Let's return flattened structure with camelCase.
        return [{
            "id": u["id"],
            "name": u["name"],
            "gender": u["gender"],
            "phone": u["phone"],
            "productId": u["product_id"],
            "productName": u["product_name"],
            "regMonths": u["reg_months"],
            "regDate": u["reg_date"],
            "startDate": u["start_date"],
            "endDate": u["end_date"],
            "remaining": u["remaining"]
        } for u in users]

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="회원 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.get("/{id}")
def get_user(id: str):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT u.*, p.name as product_name, p.reg_months 
            FROM users u
            LEFT JOIN products p ON u.product_id = p.id
            WHERE u.id = %s
        """
        cursor.execute(query, (id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다.")
        
        return {
            "id": user["id"],
            "name": user["name"],
            "gender": user["gender"],
            "phone": user["phone"],
            "productId": user["product_id"],
            "productName": user["product_name"],
            "regMonths": user["reg_months"],
            "regDate": user["reg_date"],
            "startDate": user["start_date"],
            "endDate": user["end_date"],
            "remaining": user["remaining"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="회원 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.post("/", status_code=201)
def create_user(user: UserCreate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # ID 자동 생성 (입력되지 않은 경우)
        if not user.id:
            cursor.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users WHERE id ~ '^[0-9]+$'")
            row = cursor.fetchone()
            max_id = row['max_id'] if row and row['max_id'] else 0
            user.id = str(max_id + 1)

        # 상품 정보 조회 (등록 개월 수 및 종료일 계산을 위해)
        cursor.execute("SELECT reg_months FROM products WHERE id = %s", (user.productId,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=400, detail="유효하지 않은 회원권(상품)입니다.")
        
        reg_months = product['reg_months']
        
        # Calculate end_date only if reg_months > 0 (not FPT)
        # If user provided endDate, use it; otherwise calculate or leave as None
        if user.endDate:
            # User explicitly provided end date, use it
            calculated_end_date = user.endDate
        elif reg_months and reg_months > 0:
            # Calculate end date for regular memberships
            start_date = user.startDate if user.startDate else (user.regDate if user.regDate else date.today())
            
            import calendar
            
            target_month = start_date.month + reg_months
            year_diff = (target_month - 1) // 12
            new_year = start_date.year + year_diff
            new_month = (target_month - 1) % 12 + 1
            last_day_of_new_month = calendar.monthrange(new_year, new_month)[1]
            new_day = min(start_date.day, last_day_of_new_month)
            
            calculated_end_date = date(new_year, new_month, new_day)
        else:
            # FPT or no reg_months: end_date is None
            calculated_end_date = None
        
        user.endDate = calculated_end_date

        query = """
            INSERT INTO users (id, name, gender, phone, product_id, reg_date, start_date, end_date, remaining)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """
        cursor.execute(query, (
            user.id, user.name, user.gender, user.phone, user.productId, 
            user.regDate, user.startDate, user.endDate, user.remaining
        ))
        conn.commit()
        new_user = cursor.fetchone()
        
        # Return with product info?
        new_user['productId'] = new_user['product_id']
        del new_user['product_id']
        return new_user
        
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="이미 등록된 이름과 전화번호입니다.")
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="회원 등록 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.put("/{id}")
def update_user(id: str, user: UserUpdate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # If product changed, might need to recalc end date? 
        # For UPDATE, usually we respect what's passed, but if product is changed, we might check.
        # Let's update what is passed.
        
        query = """
            UPDATE users 
            SET name = %s, gender = %s, phone = %s, product_id = %s, 
                reg_date = %s, start_date = %s, end_date = %s, remaining = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        """
        cursor.execute(query, (
            user.name, user.gender, user.phone, user.productId,
            user.regDate, user.startDate, user.endDate, user.remaining, id
        ))
        conn.commit()
        updated_user = cursor.fetchone()
        if not updated_user:
            raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다.")
        
        updated_user['productId'] = updated_user['product_id']
        del updated_user['product_id']
        return updated_user
        
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="이미 등록된 이름과 전화번호입니다.")
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="회원 수정 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.delete("/{id}")
def delete_user(id: str):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("DELETE FROM users WHERE id = %s RETURNING *", (id,))
        conn.commit()
        deleted_user = cursor.fetchone()
        if not deleted_user:
            raise HTTPException(status_code=404, detail="회원을 찾을 수 없습니다.")
        return {"message": "회원이 삭제되었습니다.", "user": deleted_user}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="회원 삭제 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
