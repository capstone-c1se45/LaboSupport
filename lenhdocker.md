1.Nhóm lệnh CHẠY và TẮT
-docker-compose up
+Tác dụng: (Build (nếu chưa có image), tạo và khởi chạy tất cả các container. Xem log trực tiếp trên màn hình.)
+Khi nào dùng: Lần đầu chạy dự án hoặc muốn xem log của tất cả service chạy cùng lúc.

-docker-compose up -d(Detached)
+Tác dung: Chạy tất cả container ở chế độ "Detached" (Chạy ngầm/Chạy ẩn).
+Khi nào dùng: Khi bạn muốn trả lại quyền điều khiển Terminal để gõ các lệnh khác.

-docker-compose down
+Tác dụng: Dừng và XÓA các container, mạng (network) đã tạo.
+Khi nào dùng: Khi bạn muốn tắt hẳn hệ thống.

-docker-compose stop
+Tác dụng :Chỉ tạm dừng container (không xóa).
+Khi nào dùng: Muốn tạm nghỉ, lát bật lại nhanh (docker-compose start).

2.Nhóm lệnh CẬP NHẬT và SỬA LỖI
-docker-compose up -d --build
+Tác dụng: Bắt buộc Docker xây dựng lại (rebuild) image, sau đó mới chạy lên.
+Khi nào dùng: Khi bạn vừa cài thêm thư viện mới (npm install, pip install) hoặc sửa Dockerfile.

-docker-compose restart [tên_service](backend,...)
+Tác dụng: Khởi động lại riêng một container cụ thể.
+Khi nào dùng: Khi Backend bị đơ, hoặc nodemon không tự bắt được thay đổi, hoặc bạn muốn reset kết nối DB.

3.Nhóm lệnh THEO DÕI LOG (Quan trọng để debug)
-docker-compose logs -f
+Tác dụng: Xem log của tất cả container và liên tục cập nhật (như đang xem trực tiếp).
+Phím tắt: Nhấn Ctrl + C để thoát chế độ xem log (Container vẫn chạy tiếp, không bị tắt).

-docker-compose logs -f [tên_service] (Rất hay dùng)
+Ví dụ: docker-compose logs -f backend hoặc docker-compose logs -f mysql
+Tác dụng: Chỉ soi log của riêng ông Backend hoặc MySQL thôi cho đỡ rối mắt.

4.Nhóm lệnh DỌN DẸP DỮ LIỆU (Cẩn thận!)
-docker-compose down -v (Warning ⚠️)
+Tác dụng: Tắt container VÀ XÓA LUÔN VOLUMES (dữ liệu).
+Khi nào dùng: Khi Database bị lỗi quá nặng, bạn muốn xóa sạch sành sanh để MySQL tạo lại database mới tinh từ đầu (chạy lại file init.sql).