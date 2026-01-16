
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db
from routers import users, coaches, attendance, products, upload, auth

app = FastAPI(
    title="출석 관리 시스템 API",
    description="Python FastAPI로 마이그레이션된 출석 관리 시스템 백엔드",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시에는 구체적인 도메인으로 제한하는 것이 좋습니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(coaches.router)
app.include_router(attendance.router)
app.include_router(products.router)
app.include_router(upload.router)
app.include_router(auth.router)

@app.on_event("startup")
async def startup_event():
    db.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    db.close_all()

@app.get("/")
def read_root():
    return {
        "message": "출석 관리 시스템 API 서버 (FastAPI)",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
