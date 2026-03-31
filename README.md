# University Course Registration System

A full-stack web application for managing university course registrations, built as a three-tier architecture for the MIT Database Systems (CSS2212) course project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS |
| Backend | Java Spring Boot REST API |
| Database | Oracle Database XE (PL/SQL) |

---

## Features

### Student Portal
- **Login** using your Student ID
- **Register** as a new student (Name, ID, Branch, Semester)
- **Course Catalog** — filtered strictly to your current semester
- **Enroll** in available courses with real-time capacity tracking
- **Drop** courses from your schedule
- **Student History** — view all past and current enrolled courses with grades

### Admin Portal
- Securely gated with a passkey
- **Add Course** — insert a new course and auto-create a section for a target semester
- **Student Directory** — see all students, their branch, semester, and current enrollments
- **Master Course List** — view every course across all semesters with active section counts

### Business Logic (Enforced at DB + API Level)
- Students can **only enroll in courses for their exact semester** (1–8)
- **Prerequisite checking** — a prerequisite is met if any record exists in Takes
- **Schedule clash detection** — two courses at the same time slot cannot both be registered
- **Seat capacity enforcement** — sections will reject enrollment when full

---

## Project Structure

```
DBMS_PROJECT/
├── backend/                        # Spring Boot REST API
│   ├── src/main/java/com/university/
│   │   ├── controllers/            # REST Controllers
│   │   ├── dao/                    # Data Access Layer (JDBC)
│   │   ├── db/                     # Oracle Connection Manager
│   │   └── models/                 # DTOs and POJOs
│   └── src/main/resources/
│       ├── application.properties.template   # ← Copy this to application.properties
│       └── database/
│           ├── schema.sql          # DDL + seed data
│           └── plsql_logic.sql     # Packages, triggers, procedures
│
├── frontend/                       # React + Vite app
│   └── src/
│       ├── api.js                  # All API calls (update API_BASE here)
│       ├── App.jsx                 # Auth flow + routing
│       └── components/
│           ├── Dashboard.jsx
│           ├── CourseCatalog.jsx
│           ├── StudentHistory.jsx
│           ├── RegisterForm.jsx
│           └── AdminPortal.jsx
│
├── Manual.md                       # Lab manual reference
└── Synopsis.md                     # Project synopsis
```

---

## Setup & Running Locally

### Prerequisites
- Java 17+, Maven
- Node.js 18+, npm
- Oracle Database XE with SQL*Plus

### 1. Database Setup
Run the SQL scripts in order against your Oracle instance:
```bash
sqlplus your_user/your_password@localhost:1521/XE @backend/src/main/resources/database/schema.sql
sqlplus your_user/your_password@localhost:1521/XE @backend/src/main/resources/database/plsql_logic.sql
```

### 2. Backend Configuration
Copy the template and fill in your Oracle connection details:
```bash
cp backend/src/main/resources/application.properties.template \
   backend/src/main/resources/application.properties
```
Edit `application.properties`:
```properties
spring.datasource.url=jdbc:oracle:thin:@YOUR_HOST:1521:XE
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Frontend Configuration
Edit `frontend/src/api.js` and update the base URL to point to your backend:
```js
const API_BASE = 'http://YOUR_BACKEND_HOST:8080/api';
```

### 4. Run

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate student |
| POST | `/api/students` | Register new student |
| GET | `/api/courses?term={semester}` | Get courses for a semester |
| POST | `/api/students/{id}/enroll` | Enroll in a course |
| POST | `/api/students/{id}/drop` | Drop a course |
| GET | `/api/students/{id}/history` | Get enrollment history |
| POST | `/api/courses` | (Admin) Add a new course |
| GET | `/api/admin/students` | (Admin) All students + enrollments |
| GET | `/api/admin/courses` | (Admin) Master course list |

---

## Database Schema

```
Department → Branch → Student
Course → Section → Takes (enrollments)
Course → Prereq (prerequisite chains)
Time_Slot → Section (schedule)
Instructor → Section
```

Key constraint: `Section.semester` is `NUMBER(1) CHECK (semester BETWEEN 1 AND 8)` — strict numerical semester targeting, not loose Odd/Even grouping.

---

## Notes for Local Setup

- `application.properties` is excluded from git — never commit your DB credentials
- The frontend `API_BASE` URL is hardcoded for local network use; update it for your environment
- The Admin Portal passkey is `admin123` — hardcoded for demo purposes
