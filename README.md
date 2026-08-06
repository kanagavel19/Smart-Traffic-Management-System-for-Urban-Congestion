# METROPULSE: Smart Traffic Management System for Urban Congestion

A production-ready, full-stack Intelligent Transportation System (ITS) designed for urban congestion mitigation. Metropulse incorporates real-time GIS mapping, AI-driven adaptive traffic signal controllers, automated emergency vehicle priority green corridors, CCTV computer vision analytics, and a citizen incident reporting center.

---

## 🚀 Key Modules & Architecture

### 1. GIS Live Traffic Map (Leaflet.js + OpenStreetMap)
- Color-coded transit velocity polylines: **Green** (Clear, >45 km/h), **Yellow** (Moderate, 30–45 km/h), **Orange** (Heavy, 15–30 km/h), and **Red** (Emergency gridlock, <15 km/h).
- Context Layers: Interactive status triggers on cameras, active signals phases, emergency paths tracker, and citizen complaints.
- **Route Optimizer (Dijkstra-compatible)**: Dynamically avoids high-congestion bottlenecks using coordinate penalty routing.

### 2. AI Adaptive Signal control
- Adaptive logic shifts green durations (range: 20s to 90s) dynamically according to camera vehicle classification densities.
- **Manual Officer Overrides**: Allows operators to force direction priority overrides instantaneously.

### 3. Emergency Green Corridors
- Automatically binds downstream signals to green for dispatched first responder ambulances or fire trucks, holding opposing directions to solid red.

### 4. Bounding Box CCTV AI Vision
- Bounding Box overlay simulations classing Cars, Buses, Trucks, Motorcycles, Rickshaws, and Pedestrians.
- AI anomaly classifiers flag overspeeding, red-light runs, wrong-way driving, and halted vehicles.

### 5. Citizen Grievance Portal
- Citizen reports (damaged signals, potholes, flooding) utilizing GPS pin drops and ticket resolution status logs.

---

## 🛠️ Stack Infrastructure

* **Frontend**: React (Vite), TypeScript, Tailwind CSS, Leaflet.js, Recharts, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js, Socket.io (real-time stream synchronization), Multer (uploads management).
* **Database**: MongoDB Mongoose schemas (Gracefully falls back to client-side react simulation loops if MONGODB is disconnected, ensuring zero-database-config runs).

---

## 📦 Project Setup & Installation

### Local Execution (Standalone Standalone Developer Sandbox)

If you don't have MongoDB or Node running, you can run the client in full sandbox simulation mode natively!

#### 1. Start Node/Express Server
```bash
cd server
npm install
# Optional: Seed Mongo db if running MongoDB locally on standard port
npm run seed
# Boot server
npm start
```

#### 2. Start React Portal Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3000` to interact with Metropulse!

---

## 🐳 Docker Deployment

To launch the complete infrastructure (MongoDB + API backend + SPA Nginx client) with single command orchestrator:
```bash
docker-compose up --build
```
* **Frontend Portal**: `http://localhost:3000`
* **API Backend**: `http://localhost:5000/status`

---

## 🔒 Developer Role Quick Switcher Bypass

During evaluation, you can bypass inputting passwords and swap security privilege layers instantly. Open the login page and click the developer logs at the bottom card:
* **Administrator**: Access to Admin panel CRUD, signal overrides, maps, and complaints updates.
* **Traffic Officer**: Manual overrides, active signal locks, emergency routing dispatches.
* **Citizen**: Map overlays, public routing optimal searches, drop pins grievance tickets submissions.

---

## 📑 API Reference

* `POST /api/auth/login` - Authenticate JWT token.
* `POST /api/auth/register` - Create profile.
* `GET /api/traffic/intersections` - Fetch GIS coordinates list.
* `PATCH /api/traffic/signals/:id` - Manual override target timers.
* `POST /api/complaints` - Citizen hazard ticket submission (supports Multer file uploads).
* `POST /api/emergencies/dispatch` - First responders priority locks.
