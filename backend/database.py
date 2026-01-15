
import os
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

class Database:
    _pool = None

    @classmethod
    def initialize(cls):
        if cls._pool is None:
            try:
                cls._pool = psycopg2.pool.SimpleConnectionPool(
                    1, 20,
                    host=os.getenv("DB_HOST"),
                    port=os.getenv("DB_PORT"),
                    database=os.getenv("DB_NAME"),
                    user=os.getenv("DB_USER"),
                    password=os.getenv("DB_PASSWORD")
                )
                print("✅ PostgreSQL 데이터베이스에 연결되었습니다.")
            except Exception as e:
                print(f"❌ 데이터베이스 연결 오류: {e}")
                raise e

    @classmethod
    def get_connection(cls):
        if cls._pool is None:
            cls.initialize()
        return cls._pool.getconn()

    @classmethod
    def return_connection(cls, conn):
        if cls._pool:
            cls._pool.putconn(conn)

    @classmethod
    def close_all(cls):
        if cls._pool:
            cls._pool.closeall()
            print("데이터베이스 연결이 닫혔습니다.")

db = Database()
