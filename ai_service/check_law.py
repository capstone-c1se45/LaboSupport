from src.db.mysql_client import mysql_db

def find_dieu_in_mysql(dieu: str):
    """
    Tìm Điều (article) trong bảng Handbook_Section theo tiêu đề.
    
    :param dieu: Số hoặc chuỗi điều cần tìm (VD: "98", "Điều 98")
    :return: danh sách kết quả
    """
    print(f"🔍 Đang tìm {dieu} trong MySQL...")

    mysql_db.connect()
    cursor = mysql_db.connection.cursor(dictionary=True)

    # Chuẩn hóa từ khóa tìm kiếm
    keyword = dieu if "Điều" in dieu else f"Điều {dieu}"

    sql = """
        SELECT section_id, article_title
        FROM Handbook_Section
        WHERE article_title LIKE %s
    """

    cursor.execute(sql, (f"%{keyword}%",))
    results = cursor.fetchall()

    if results:
        print(f"✅ TÌM THẤY {len(results)} kết quả:")
        for r in results:
            print(f"   - ID: {r['section_id']}")
            print(f"   - Title: {r['article_title']}")
    else:
        print(f"❌ KHÔNG TÌM THẤY {keyword} trong MySQL.")

    cursor.close()
    return results
if __name__ == "__main__":
    # Ví dụ tìm Điều 98
    find_dieu_in_mysql("98")