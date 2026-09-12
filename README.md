# MedEmergency — Instant Emergency Prescription & Medicine Finder

**MedEmergency** is a life-critical, full-stack real-time web application engineered to help patients rapidly locate and secure emergency medicines during time-sensitive crises. A patient uploads a doctor's prescription, the system extracts the medications using OCR and fuzzy catalog matching, calculates distances to nearby licensed pharmacies, broadcasts the emergency request via WebSockets with priority audio alerts, and immediately connects the patient to the first responding store via direct 1-tap calling.

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Key Features & Life-Critical Workflow](#-key-features--life-critical-workflow)
3. [Database Schema (MySQL + Sequelize)](#-database-schema-mysql--sequelize)
4. [Project Structure](#-project-structure)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
7. [REST API Documentation](#-rest-api-documentation)
8. [Real-Time Socket.io Events](#-real-time-socketio-events)
9. [Architecture & Future Scope](#-architecture--future-scope)

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API Synthesizer (Siren alerts & chimes).
- **Backend:** Node.js, Express.js, Socket.io (real-time broadcast engine), Multer, Tesseract.js (modular OCR engine), Fuse.js (fuzzy medicine matching).
- **Database:** MySQL 8+ with Sequelize ORM and `mysql2` connection pooling.
- **Security:** JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **Geolocation:** Browser Geolocation API (frontend) + Haversine Formula distance ranking (backend).

---

## ⚡ Key Features & Life-Critical Workflow

```
[Patient Uploads Rx] ──> [Tesseract OCR Scan] ──> [Fuzzy Medicine Match]
                                                              │
                                                              ▼
[1-Tap "Call Now" (tel:)] <── [First "Available" Wins] <── [Socket.io Radar Broadcast (5-15km)]
```

1. **Intelligent Prescription OCR & Fuzzy Matching:**
   - Detects printed or handwritten medication names.
   - Fuzzy token search with `fuse.js` against master medicine database with match confidence scores.
   - Raw text editor allowing patients or pharmacists to adjust medication names.

2. **Emergency Radar & Broadcast System:**
   - Instant WebSockets push (`new_request`) to all approved, active pharmacies within radius.
   - Dynamic search radius expansion (5 km &rarr; 10 km &rarr; 15 km).
   - Audio siren alerts + high-priority flash banner on pharmacy dashboard.

3. **First-Response Instant Match:**
   - The first pharmacy to tap **"Available"** automatically secures the match.
   - Patient instantly receives a victory card with verified store details, distance in km, and a direct `tel:` **Call Store Now** button.
   - Pending state clears for other stores with "Already fulfilled by another store" notice.
   - Patient can view all responding stores ranked by proximity.

4. **Role-Based Portals:**
   - **Patient:** Upload, live radar tracking, match found screen, request history.
   - **Medical Store Owner:** Real-time incoming requests feed, audio toggle, online/offline switch, 1-click Available / Not Available response buttons, audit history.
   - **Admin:** Pharmacy license verification & approvals, active store toggles, real-time live request monitor.

---

## 🗄 Database Schema (MySQL + Sequelize)

- **`users`**: `id`, `name`, `email`, `password_hash`, `role` (`'patient' | 'store' | 'admin'`), `phone`, `created_at`, `updated_at`
- **`stores`**: `id`, `user_id` (FK), `store_name`, `license_number`, `address`, `latitude`, `longitude`, `phone`, `operating_hours`, `is_approved`, `is_online`, `is_active`, `created_at`, `updated_at`
- **`medicines`**: `id`, `name`, `generic_name`, `category`, `dosage_form`, `alternatives`, `description`, `created_at`, `updated_at`
- **`prescriptions`**: `id`, `patient_id` (FK), `image_path`, `ocr_raw_text`, `is_emergency`, `status`, `created_at`, `updated_at`
- **`prescription_medicines`**: `id`, `prescription_id` (FK), `medicine_id` (FK, nullable), `custom_name`, `confidence`, `dosage_instruction`, `is_selected`, `created_at`, `updated_at`
- **`requests`**: `id`, `prescription_id` (FK), `patient_id` (FK), `status` (`'pending' | 'matched' | 'resolved' | 'expired'`), `search_radius_km`, `is_emergency`, `patient_lat`, `patient_lng`, `matched_store_id` (FK, nullable), `resolved_at`, `created_at`, `updated_at`
- **`request_responses`**: `id`, `request_id` (FK), `store_id` (FK), `response` (`'available' | 'not_available'`), `notes`, `responded_at`, `created_at`, `updated_at`
- **`notifications`**: `id`, `store_id` (FK), `request_id` (FK), `title`, `message`, `type`, `is_read`, `created_at`, `updated_at`

---

## 📂 Project Structure

```
hospital/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/axios.js        # Configured Axios instance with JWT interceptors
│   │   ├── context/            # AuthContext & SocketContext
│   │   ├── components/         # Navbar, Footer, EmergencyBanner, RadarAnimation, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── patient/        # Upload, OCR Review, Radar, Match Found, History
│   │   │   ├── store/          # Store Dashboard, History
│   │   │   ├── admin/          # Admin Verification & Live Monitor
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── utils/              # Web Audio API Synthesizer & Geolocation helpers
│   │   └── App.jsx             # React Router hierarchy
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js + Express + Socket.io)
│   ├── src/
│   │   ├── config/database.js  # Sequelize MySQL connection pool
│   │   ├── controllers/        # Auth, Store, Prescription, Medicine, Request, Admin
│   │   ├── middleware/auth.js  # JWT validation & Role-based guard
│   │   ├── models/             # Sequelize models & associations
│   │   ├── routes/             # RESTful API routing
│   │   ├── services/           # OCR (Tesseract), Matching (Fuse.js), Geo (Haversine), Socket.io
│   │   ├── seeds/seed.js       # Master medicines catalog & demo accounts
│   │   └── server.js           # Server bootstrap
│   ├── uploads/prescriptions/  # Upload storage
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server 8+

### 2. Configure Backend Environment
Edit `server/.env` with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=medemergency
JWT_SECRET=supersecret_medemergency_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads/prescriptions
```

### 3. Install Dependencies & Seed Database
```bash
# Backend Setup
cd backend
npm install
npm run seed     # Synchronizes tables and seeds 33+ master medicines & accounts

# Frontend Setup
cd ../frontend
npm install
```

### 4. Run the Application
```bash
# Terminal 1: Run Backend Server
cd backend
npm start        # Starts Express & Socket.io on http://localhost:5000

# Terminal 2: Run Frontend Development Server
cd frontend
npm run dev      # Starts Vite React on http://localhost:5173
```

---

## 👥 Pre-configured Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Patient** | `patient@medemergency.com` | `Password@123` | Uploads prescriptions, tests live radar & match flow |
| **Medical Store 1** | `store1@medemergency.com` | `Password@123` | *Apollo 24/7 Pharmacy* (~1.0 km away) |
| **Medical Store 2** | `store2@medemergency.com` | `Password@123` | *LifeCare Critical Chemist* (~1.4 km away) |
| **Medical Store 3** | `store3@medemergency.com` | `Password@123` | *MedPlus Express Chemist* (~2.5 km away) |
| **Administrator** | `admin@medemergency.com` | `Admin@123` | Pharmacy approvals, store verification & live stats |

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/signup` — Register patient or medical store profile
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/auth/me` — Retrieve current authenticated session

### Prescriptions & OCR
- `POST /api/prescriptions/upload` — Upload prescription image and trigger OCR
- `POST /api/prescriptions/:id/ocr` — Re-run OCR scan
- `PUT  /api/prescriptions/:id/medicines` — Confirm / adjust matched medicine tags
- `GET  /api/prescriptions/:id` — Retrieve prescription details

### Medical Stores & Nearby Search
- `GET  /api/stores/nearby?lat=&lng=&radius=` — Search approved stores via Haversine
- `POST /api/stores/register` — Submit store registration
- `GET  /api/stores/profile` — Store owner profile
- `PUT  /api/stores/status` — Toggle pharmacy online/offline dispatch status
- `PUT  /api/stores/:id/approve` — (Admin) Approve or revoke pharmacy license
- `PUT  /api/stores/:id/toggle-active` — (Admin) Activate/Deactivate store

### Emergency Requests & Matching
- `POST /api/requests/create` — Broadcast emergency medicine request to nearby stores
- `GET  /api/requests/:id` — Request status and responding pharmacies
- `PUT  /api/requests/:id/respond` — Store responds "available" or "not_available"
- `PUT  /api/requests/:id/resolve` — Patient marks request as fulfilled/resolved
- `PUT  /api/requests/:id/expand-radius` — Dynamically expand search radius (5km &rarr; 10km &rarr; 15km)
- `GET  /api/requests/my-requests` — Patient request history
- `GET  /api/requests/store/active` — Active incoming requests in pharmacy zone
- `GET  /api/requests/store/history` — Pharmacy response history

---

## 🔔 Real-Time Socket.io Events

| Event Name | Direction | Description |
|---|---|---|
| `join_store_room` | Client &rarr; Server | Pharmacy socket joins its unique dispatch room |
| `join_request_room` | Client &rarr; Server | Patient socket joins tracking room for active broadcast |
| `new_request` | Server &rarr; Stores | Pushes incoming request card with audio siren trigger flag |
| `request_matched` | Server &rarr; Patient | Emitted immediately to patient when first store responds "Available" |
| `request_status_update` | Server &rarr; Stores | Updates all stores when request is fulfilled by a winning pharmacy |
| `store_response_update` | Server &rarr; Patient | Streams live list of all pharmacies confirming availability |
| `request_status_change` | Server &rarr; All | Broadcasts radius expansions or resolution state |

---

## 🔮 Architecture & Future Scope

- **Cloud Vision API Integration:** `server/src/services/ocrService.js` follows a modular adapter interface for zero-friction swap with Google Cloud Vision API.
- **Cloud Storage:** `server/src/services/storageService.js` is architected with a storage adapter pattern ready for AWS S3 or Cloudinary.
- **SMS Alerts:** Prepared hook for Twilio SMS integration to notify offline pharmacists during Level 1 critical emergencies.
