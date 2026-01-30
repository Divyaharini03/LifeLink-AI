# LifeLink AI - Smart Emergency & Healthcare Coordination Platform

LifeLink AI is a comprehensive, production-ready AI healthcare platform connecting patients, doctors, hospitals, and emergency services in real-time.

## 🚀 Features

- **🚨 Emergency SOS**: One-tap ambulance and police alerts with live GPS tracking.
- **🚑 AI Routing**: Intelligent ambulance routing to the nearest available hospital.
- **🩸 Blood & Organ Network**: Real-time matching for critical resource needs.
- **👨‍⚕️ Doctor Discovery**: Search and book appointments with verified specialists.
- **🤖 AI Health Assistant**: Smart symptom checker and triage.
- **🏥 Resource Management**: Hospital admin dashboard for beds, oxygen, and equipment.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite, Lucide React, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth.
- **Aesthetics**: Premium, clean medical design with glassmorphism and smooth animations.

## 📂 Project Structure

- `/client` - Frontend Application
- `/server` - Backend API & Database Models
- `/ai` - AI/ML Services (Placeholder/Scripts)

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository** (if applicable)

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create a .env file based on the template
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the App**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 🔐 Credentials (Demo)

- **Patient**: `user@lifelink.com` / `password123`
- **Doctor**: `doctor@lifelink.com` / `password123`
- **Admin**: `admin@lifelink.com` / `password123`

## 🔮 Roadmap

- [x] Project Scaffolding
- [x] Landing Page & UI Foundation
- [x] Database Models (User, Emergency)
- [ ] Connect Frontend Auth to Backend
- [ ] Implement AI Routing Logic
- [ ] Deploy with Docker
