import sys
import mysql.connector
from mysql.connector import Error
import os
from typing import List, Dict
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path)

class MySQLClient:
    def __init__(self):
        self.host = os.getenv("MYSQL_HOST", "127.0.0.1")
        
        if self.host == "localhost" and sys.platform == "win32":
            print("⚠️ Phát hiện Windows + localhost, tự động chuyển sang 127.0.0.1 để tránh lỗi Named Pipe.")
            self.host = "127.0.0.1"

        self.port = int(os.getenv("MYSQL_PORT", 4455)) 
        self.user = os.getenv("MYSQL_USER", "se45")
        self.password = os.getenv("MYSQL_PASSWORD", "captone1@se45")
        self.database = os.getenv("MYSQL_DB", "db_labosupport")
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                use_pure=True
            )
        except Error as e:
            print(f"Error connecting to MySQL: {e}")

    def get_law_content(self, section_ids: List[str]) -> List[Dict]:
        """
        Fetch full law content based on section_ids (UUIDs) retrieved from ChromaDB.
        """
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        if not section_ids:
            return []

        # Create placeholders for the query
        format_strings = ','.join(['%s'] * len(section_ids))
        cursor = self.connection.cursor(dictionary=True)
        
        # Updated Query to match Handbook_Section table
        query = f"""
            SELECT 
                section_id, 
                law_id, 
                law_name,
                law_reference, 
                article_title, 
                content 
            FROM Handbook_Section 
            WHERE section_id IN ({format_strings})
        """
        
        try:
            cursor.execute(query, tuple(section_ids))
            results = cursor.fetchall()
            return results
        except Error as e:
            print(f"Error fetching data from MySQL: {e}")
            return []
        finally:
            cursor.close()

    def close(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def search_by_keyword(self, query: str, limit: int = 3) -> List[Dict]:
        """
        Tìm kiếm Full-text đơn giản bằng SQL LIKE để bổ trợ cho Vector Search.
        """
        if not self.connection or not self.connection.is_connected():
            self.connect()

        cursor = self.connection.cursor(dictionary=True)
        
        # Chỉ lấy những từ khóa quan trọng để search (tránh search từ nối như 'là', 'của')
        # Logic đơn giản: Nếu query có chữ "lương" -> Search "lương"
        keywords = []
        if "lương" in query.lower(): keywords.append("lương")
        if "phạt" in query.lower(): keywords.append("phạt")
        if "thử việc" in query.lower(): keywords.append("thử việc")
        if "bảo hiểm" in query.lower(): keywords.append("bảo hiểm")
        if "làm thêm" in query.lower(): keywords.append("làm thêm")
        
        # Nếu không bắt được keyword đặc biệt nào, return rỗng (để Chroma lo)
        if not keywords:
            return []

        # Xây dựng câu query OR (tìm điều luật chứa MỘT TRONG CÁC keyword trên)
        # Ưu tiên tìm trong Tiêu đề (article_title) vì nó chứa nội dung chính
        conditions = " OR ".join([f"article_title LIKE %s" for _ in keywords])
        sql = f"""
            SELECT section_id, law_id, law_name, law_reference, article_title, content 
            FROM Handbook_Section 
            WHERE {conditions}
            LIMIT %s
        """
        
        # Tạo params: ví dụ ['%lương%', '%làm thêm%', 3]
        params = [f"%{k}%" for k in keywords]
        params.append(limit)

        try:
            cursor.execute(sql, tuple(params))
            results = cursor.fetchall()
            print(f"🔍 MySQL Keyword Search found: {len(results)} records")
            return results
        except Error as e:
            print(f"Error keyword search: {e}")
            return []
        finally:
            cursor.close()

# Singleton instance
mysql_db = MySQLClient()