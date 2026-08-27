# Crop Health & Pest Advisory System (SIH-26131)

**AI-driven digital solution for early identification and management of crop diseases to protect agricultural yields.**

---

## Project Status

| Phase | Status | Description |
|---|---|---|
| Phase 0 | ✅ Done | Repo & project scaffolding |
| Phase 1 | ✅ Done | Auth & Role-Based Access Control |
| Phase 2 | 🔜 Next | Farmer app: Voice-assisted simple UI |
| Phase 3 | ⏳ | Image capture, geotagging & offline queue |
| Phase 4 | ⏳ | ML Model: disease/pest detection service |
| Phase 5 | ⏳ | Diagnosis result & advisory screen |
| Phase 6 | ⏳ | Expert validation queue |
| Phase 7 | ⏳ | Officer dashboard: hotspot map |
| Phase 8 | ⏳ | Weather & risk forecasting layer |
| Phase 9 | ⏳ | Subsidy, camp & resource management |
| Phase 10 | ⏳ | Multilingual polish, SMS/WhatsApp fallback |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App (Farmer/Pradhan) | React Native + Expo |
| Web Dashboard (Officers) | React + Vite |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL + PostGIS (Docker) |
| ML Model | PyTorch (Phase 4) |
| Auth | JWT + Phone OTP |

---

## Running Locally (Phase 1)

### Prerequisites
- [Python 3.10+](https://python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://docker.com/products/docker-desktop/) (for PostgreSQL)
- [Expo Go app](https://expo.dev/go) (on your Android/iOS device)

### 1. Start the Database

```bash
# From the repo root
docker compose up -d db
```

> pgAdmin available at http://localhost:5050 (admin@crophealth.dev / admin)

### 2. Start the Backend

```bash
cd backend

# Copy environment config
copy .env.example .env    # Windows
# cp .env.example .env    # Mac/Linux

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run DB migrations (creates tables)
alembic upgrade head    # or tables auto-created on first startup

# Start API server
uvicorn main:app --reload
```

Backend API: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 3. Start the Web Dashboard

```bash
cd web-dashboard
npm install
npm run dev
```

Web dashboard: **http://localhost:5173**

Login with any phone number → enter OTP `123456` → complete registration → see your role dashboard.

### 4. Start the Mobile App

```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

> For Android emulator, the API URL is pre-configured to `10.0.2.2:8000` (host machine's localhost).
> For a physical device, update `BASE_URL` in `mobile-app/services/api.ts` to your machine's local IP.

---

## User Roles

| Role | Access |
|---|---|
| Farmer | Mobile app only |
| Pradhan | Mobile app only |
| BDO | Web `/dashboard/bdo` |
| Agriculture Officer | Web `/dashboard/officer` |
| Horticulture Officer | Web `/dashboard/officer` |
| District/State Official | Web `/dashboard/district` |
| KVK/Lab Expert | Web `/dashboard/expert` |

---

## Team

- **Vaibhav Kumar Singh** — Team Leader
- **Mansi**
- **Rishang**
- **Swastik**
- **Srishti**
- **Ankit**

---

## Repository

GitHub: https://github.com/vaibhav-kumar-singh-mmmut/sih-crop--disease--detection-
