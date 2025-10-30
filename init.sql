-- MYSQL (8.0)
-- c1se captone 1
CREATE DATABASE IF NOT EXISTS db_labosupport;
USE db_labosupport;


CREATE TABLE IF NOT EXISTS Role (
  role_id CHAR(36) PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS User (
  user_id CHAR(36) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  role_id CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- lưu thêm thông tin cá nhân phục vụ cá nhân hóa (ví dụ: công cụ tính lương tối thiểu dựa trên địa bàn)
CREATE TABLE IF NOT EXISTS User_Profile (
  profile_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  dob DATE,
  gender VARCHAR(10),
  address VARCHAR(255),
  occupation VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- kho kiến thức pháp luật lao động
CREATE TABLE IF NOT EXISTS Handbook_Section (
  section_id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES User(user_id)
);

-- tập hợp câu hỏi thường gặp để cải thiện chatbot.
CREATE TABLE IF NOT EXISTS FAQ (
  faq_id CHAR(36) PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES User(user_id)
);

-- lưu hợp đồng của người dùng và trạng thái xử lý
CREATE TABLE IF NOT EXISTS Contract (
  contract_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  file_path VARCHAR(255) NOT NULL, -- đường dẫn lưu file hợp đồng(firebase, s3,...)
  original_name VARCHAR(200),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'PENDING',
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);


-- lưu kết quả OCR và trích xuất thông tin từ hợp đồng
CREATE TABLE IF NOT EXISTS Contract_OCR (
  ocr_id CHAR(36) PRIMARY KEY,
  contract_id CHAR(36) NOT NULL,
  extracted_text LONGTEXT,
  summary TEXT,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES Contract(contract_id)
);

-- lưu lịch sử chat giữa người dùng và chatbot
CREATE TABLE IF NOT EXISTS Chat_Log (
  chat_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  question TEXT NOT NULL,
  answer TEXT,
  source VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- lưu báo cáo vi phạm từ người dùng
CREATE TABLE IF NOT EXISTS Report (
  report_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),  -- NULL nếu ẩn danh
  category VARCHAR(100),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'NEW',
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- lưu thông báo gửi đến người dùng, admin
CREATE TABLE IF NOT EXISTS Notification (
  noti_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(150),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- quản lý tất cả file người dùng hoặc admin upload lên hệ thống (không chỉ hợp đồng).
-- không lưu hợp đồng ở đây vì đã có bảng Contract
CREATE TABLE IF NOT EXISTS  File_Storage (
  file_id CHAR(36) PRIMARY KEY,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  uploaded_by CHAR(36),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES User(user_id)
);

-- ghi lại nhật ký hoạt động trong hệ thống để theo dõi, kiểm soát, bảo mật.
CREATE TABLE IF NOT EXISTS Audit_Log (
  log_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  action VARCHAR(100),
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE IF NOT EXISTS ForgotPassword (
  username VARCHAR(100) PRIMARY KEY,
  otp_code VARCHAR(10) NOT NULL,
  expire_at DATETIME NOT NULL
);

