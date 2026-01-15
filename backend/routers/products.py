
from fastapi import APIRouter, HTTPException
from database import db
from models import ProductCreate, ProductUpdate
import psycopg2.extras

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/")
def get_products():
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute("SELECT * FROM products ORDER BY id")
        products = cursor.fetchall()
        # CamelCase 변환
        return [{
            "id": p["id"],
            "name": p["name"],
            "regMonths": p["reg_months"],
            "price": p["price"],
            "description": p["description"],
            "active": p["active"],
            "createdAt": p["created_at"]
        } for p in products]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="상품 조회 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.post("/", status_code=201)
def create_product(product: ProductCreate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            INSERT INTO products (name, reg_months, price, description, active)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """
        cursor.execute(query, (product.name, product.regMonths, product.price, product.description, product.active))
        conn.commit()
        new_product = cursor.fetchone()
        return {
            "id": new_product["id"],
            "name": new_product["name"],
            "regMonths": new_product["reg_months"],
            "price": new_product["price"],
            "description": new_product["description"],
            "active": new_product["active"],
            "createdAt": new_product["created_at"]
        }
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="상품 등록 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.put("/{id}")
def update_product(id: int, product: ProductUpdate):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            UPDATE products 
            SET name = %s, reg_months = %s, price = %s, description = %s, active = %s
            WHERE id = %s
            RETURNING *
        """
        cursor.execute(query, (product.name, product.regMonths, product.price, product.description, product.active, id))
        conn.commit()
        updated_product = cursor.fetchone()
        if not updated_product:
            raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
        return {
            "id": updated_product["id"],
            "name": updated_product["name"],
            "regMonths": updated_product["reg_months"],
            "price": updated_product["price"],
            "description": updated_product["description"],
            "active": updated_product["active"],
            "createdAt": updated_product["created_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="상품 수정 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)

@router.delete("/{id}")
def delete_product(id: int):
    conn = db.get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if used by any user
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE product_id = %s", (id,))
        user_count = cursor.fetchone()['count']
        
        if user_count > 0:
            # Soft delete: deactivate instead of deleting
            cursor.execute("""
                UPDATE products 
                SET active = false 
                WHERE id = %s 
                RETURNING *
            """, (id,))
            conn.commit()
            deactivated_product = cursor.fetchone()
            if not deactivated_product:
                raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
            return {
                "message": f"해당 상품을 사용 중인 회원이 {user_count}명 있어 비활성화 처리되었습니다.",
                "deactivated": True
            }
        else:
            # Hard delete: no members using this product
            cursor.execute("DELETE FROM products WHERE id = %s RETURNING *", (id,))
            conn.commit()
            deleted_product = cursor.fetchone()
            if not deleted_product:
                raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
            return {
                "message": "상품이 삭제되었습니다.",
                "deactivated": False
            }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="상품 삭제 중 오류가 발생했습니다.")
    finally:
        db.return_connection(conn)
