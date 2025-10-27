<h1 align="center">🛡️ LaboSupport</h1>
<p align="center">
AI-powered web app to protect <b>labor rights</b> of workers in Vietnam.  
Provides legal lookup, OCR contract analysis, AI chatbot, and violation reporting.  
</p>

---

## ✨ Features
- 🤖 **AI Chatbot** → Ask questions about labor rights (Vietnamese).  
- 📑 **OCR Contract Check** → Upload contract & auto-detect unfair clauses.  
- 📝 **Report Submission** → File complaints with evidence.  
- 💰 **Wage Calculator** → Regional minimum wage.  
- ✅ **Self-Assessment Checklist** → Workers can self-check their rights.  
- 👤 **Guest Mode** → Try some features without login.  

---

## 🏗️ Tech Stack
| Layer      | Technology |
|------------|------------|
| **Frontend** | ReactJS, TailwindCSS |
| **Backend**  | Node.js (Express), MySQL (Sequelize ORM) |
| **AI Service** | Python (FastAPI, Tesseract OCR, HuggingFace, VectorDB) |
| **Database**  | MySQL + VectorDB (Weaviate/Milvus/Pinecone) |
| **Storage**   | Firebase / AWS S3 |

---

## 📂 Project Structure
<img width="454" height="150" alt="image" src="https://github.com/user-attachments/assets/414d9a67-4c1b-49e0-8990-96a9d79d4c15" />


---

## ⚡ Getting Started

### 1️⃣ Clone this repository on your github desktop
cd LaboSupport

### 2️⃣ Frontend (React + Tailwind)
cd frontend
npm install
npm run dev   # http://localhost:5173 // có thể cổng khác hehe

### 3️⃣ Backend (Node.js + MySQL)
cd backend
npm install

# Setup MySQL (Docker example)
docker run --name labo-mysql -e MYSQL_ROOT_PASSWORD=123 -e MYSQL_DATABASE=labosupport -p 3445:3306 -d mysql:8

# Run backend
npm run dev   # http://localhost:5000 // có thể cổng khác hehe

### 4️⃣ AI Service (FastAPI + OCR)
cd ai_service
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt

# Start service
uvicorn src.main:app --reload --port 8000

🌐 Services
•🎨 Frontend → http://localhost:5173
•⚙️ Backend → http://localhost:5000
•🤖 AI Service → http://localhost:8000
•🗄️ MySQL → localhost:3306

🛠️ Example Workflow
1.User uploads contract → Backend saves file.
2.Backend calls AI Service (OCR + Compliance).
3.AI Service analyzes and returns issues.
4.Frontend shows results + legal references.

🔑 Environment Variables

1.Backend (backend/.env)
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=captone1@se45
DB_NAME=workerguard
JWT_SECRET=supersecret

2.AI Service (ai_service/.env)
OCR_LANG=vie
VECTORDB_URL=http://localhost:8080


🐳 Run with Docker Compose
docker-compose up --build
This will start:
MySQL
Backend (Node.js)
AI Service (FastAPI)
Frontend (React)

👥 Team Roles
•🎨 Frontend Dev → ReactJS + Tailwind : Tuyet,Dung,Thuy
•⚙️ Backend Dev → Node.js + MySQL : Nhat,Dat
•🧠 AI → FastAPI + OCR + NLP : Nhat
•📋 Scrum Master / Product Owner → Agile process : Tuyet,Nhat

⚖️ Disclaimer
This app provides basic legal information but is not a substitute for professional legal advice.
Always consult a certified lawyer or government authority for official guidance.
