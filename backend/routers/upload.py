from fastapi import APIRouter, UploadFile, File, HTTPException
from database import db
import psycopg2.extras
import openpyxl
from io import BytesIO
from datetime import date
import calendar

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("/upload-users")
async def upload_users(file: UploadFile = File(...)):
    """
    Excel 파일로 회원 일괄 등록
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="엑셀 파일만 업로드 가능합니다.")
    
    try:
        # Read Excel file
        contents = await file.read()
        wb = openpyxl.load_workbook(BytesIO(contents))
        ws = wb.active
        
        conn = db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        success_count = 0
        failed_count = 0
        errors = []
        
        # Skip header row, start from row 2
        for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            try:
                # Expected columns: 이름, 성별, 전화번호, 상품명, 접수일, 시작일, 종료일, 잔여 횟수
                if not row or all(cell is None for cell in row):
                    continue
                
                name = str(row[0]).strip() if row[0] else None
                gender = str(row[1]).strip() if row[1] else None
                phone = str(row[2]).strip() if row[2] else None
                product_name = str(row[3]).strip() if row[3] else None
                reg_date = row[4] if row[4] else date.today()
                start_date = row[5] if row[5] else date.today()
                end_date = row[6] if row[6] else None
                remaining = int(row[7]) if row[7] and str(row[7]).strip() else 100
                
                # Validate required fields
                if not all([name, gender, phone, product_name]):
                    errors.append(f"행 {row_idx}: 필수 정보 누락")
                    failed_count += 1
                    continue
                
                # Convert dates if they're strings
                if isinstance(reg_date, str):
                    reg_date = date.fromisoformat(reg_date)
                if isinstance(start_date, str):
                    start_date = date.fromisoformat(start_date)
                if end_date and isinstance(end_date, str):
                    end_date = date.fromisoformat(end_date)
                
                # Find product by name
                cursor.execute("SELECT id, reg_months FROM products WHERE name = %s AND active = true", (product_name,))
                product = cursor.fetchone()
                
                if not product:
                    errors.append(f"행 {row_idx}: 상품 '{product_name}'을 찾을 수 없습니다")
                    failed_count += 1
                    continue
                
                product_id = product['id']
                reg_months = product['reg_months']
                
                # Calculate end_date only if reg_months > 0 (not FPT/횟수권)
                if not end_date and reg_months and reg_months > 0:
                    target_month = start_date.month + reg_months
                    year_diff = (target_month - 1) // 12
                    new_year = start_date.year + year_diff
                    new_month = (target_month - 1) % 12 + 1
                    last_day_of_new_month = calendar.monthrange(new_year, new_month)[1]
                    new_day = min(start_date.day, last_day_of_new_month)
                    end_date = date(new_year, new_month, new_day)
                # If reg_months is 0 or None (FPT), end_date remains None
                
                # Generate user ID
                cursor.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users WHERE id ~ '^[0-9]+$'")
                result = cursor.fetchone()
                max_id = result['max_id'] if result and result['max_id'] else 0
                user_id = str(max_id + 1 + success_count)
                
                # Insert user (end_date can be NULL for FPT)
                query = """
                    INSERT INTO users (id, name, gender, phone, product_id, reg_date, start_date, end_date, remaining)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    user_id, name, gender, phone, product_id,
                    reg_date, start_date, end_date, remaining
                ))
                
                success_count += 1
                
            except Exception as e:
                errors.append(f"행 {row_idx}: {str(e)}")
                failed_count += 1
                continue
        
        conn.commit()
        
        return {
            "success": success_count,
            "failed": failed_count,
            "errors": errors[:10]  # Return first 10 errors
        }
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"업로드 처리 중 오류: {str(e)}")
    finally:
        if 'conn' in locals():
            db.return_connection(conn)
