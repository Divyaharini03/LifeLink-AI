# LifeLink AI - System Design Document

**Version:** 1.0  
**Date:** February 14, 2026  
**Status:** Production Implementation (As-Built Documentation)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Core Workflows](#7-core-workflows)
8. [Real-Time Update Mechanism](#8-real-time-update-mechanism)
9. [Security Architecture](#9-security-architecture)
10. [Scalability Strategy](#10-scalability-strategy)
11. [Deployment Model](#11-deployment-model)
12. [Monitoring & Logging](#12-monitoring--logging)
13. [Failure Handling Strategy](#13-failure-handling-strategy)
14. [AI Module Extensibility](#14-ai-module-extensibility)
15. [Technical Limitations](#15-technical-limitations)
16. [Technology Stack](#16-technology-stack)

---

## 1. Introduction

### 1.1 Purpose
This document describes the system design and architecture of LifeLink AI, a real-time emergency coordination and healthcare response platform. It serves as the technical blueprint for understanding the implemented system architecture, component interactions, and design decisions.

### 1.2 Scope
This design document covers:
- System architecture and component design
- Data models and database schema
- API design and integration patterns
- Security and authentication mechanisms
- Deployment and operational considerations

### 1.3 Design Principles
- **Separation of Concerns:** Clear boundaries between frontend, backend, and data layers
- **Modularity:** Independent, reusable components and services
- **Security First:** Authentication, authorization, and data protection at every layer
- **Scalability:** Design patterns supporting horizontal and vertical scaling
- **Maintainability:** Clean code, consistent patterns, comprehensive documentation

---

## 2. High-Level System Architecture

### 2.1 Architecture Overview

LifeLink AI follows a **three-tier client-server architecture** with clear separation between presentation, application logic, and data persistence layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │   React SPA (Vite)                                 │     │
│  │   - Role-based Dashboards                          │     │
│  │   - Real-time UI Updates (Polling)                 │     │
│  │   - Leaflet Maps Integration                       │     │
│  │   - Framer Motion Animations                       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS / REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │   Express.js Server (Node.js + TypeScript)        │     │
│  │   ┌──────────────────────────────────────────┐    │     │
│  │   │  Middleware Layer                        │    │     │
│  │   │  - CORS, Helmet, Morgan                  │    │     │
│  │   │  - JWT Authentication                    │    │     │
│  │   │  - Request Validation                    │    │     │
│  │   └──────────────────────────────────────────┘    │     │
│  │   ┌──────────────────────────────────────────┐    │     │
│  │   │  Route Layer                             │    │     │
│  │   │  - /api/auth, /api/emergencies          │    │     │
│  │   │  - /api/blood, /api/units               │    │     │
│  │   │  - /api/locations, /api/admin           │    │     │
│  │   └──────────────────────────────────────────┘    │     │
│  │   ┌──────────────────────────────────────────┐    │     │
│  │   │  Controller Layer                        │    │     │
│  │   │  - Business Logic                        │    │     │
│  │   │  - Request/Response Handling             │    │     │
│  │   └──────────────────────────────────────────┘    │     │
│  │   ┌──────────────────────────────────────────┐    │     │
│  │   │  Model Layer (Mongoose ODM)              │    │     │
│  │   │  - Schema Definitions                    │    │     │
│  │   │  - Data Validation                       │    │     │
│  │   └──────────────────────────────────────────┘    │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                      MongoDB Protocol
                            │
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │   MongoDB Database                                 │     │
│  │   - Document Collections                           │     │
│  │   - Geospatial Indexes (2dsphere)                 │     │
│  │   - Referential Relationships                      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Flow

1. **User Request:** Client initiates action (e.g., SOS button press)
2. **API Call:** Frontend service layer makes authenticated HTTP request
3. **Authentication:** Middleware validates JWT token and extracts user context
4. **Authorization:** Controller checks user role permissions
5. **Business Logic:** Controller processes request, interacts with models
6. **Data Persistence:** Mongoose models interact with MongoDB
7. **Response:** JSON response sent back to client
8. **UI Update:** React components re-render with new data

### 2.3 Communication Patterns

- **Client-Server:** RESTful HTTP/HTTPS
- **Real-time Updates:** Client-side polling (3-second intervals)
- **Authentication:** JWT Bearer tokens in Authorization header
- **Data Format:** JSON for all API requests and responses

---

## 3. Frontend Architecture

### 3.1 Technology Stack

- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.13.0
- **Styling:** Tailwind CSS 3.4.17 with custom glassmorphism theme
- **Animations:** Framer Motion 12.29.2
- **Maps:** Leaflet 1.9.4 + React Leaflet 5.0.0
- **HTTP Client:** Axios 1.13.4
- **Icons:** Lucide React 0.563.0

### 3.2 Project Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable UI components
│   │   ├── MapComponent.tsx  # Leaflet map wrapper
│   │   ├── SOSButton.tsx     # Emergency alert button
│   │   └── ThemeToggle.tsx   # Dark/light mode toggle
│   ├── context/              # React Context providers
│   │   └── ThemeContext.tsx  # Theme state management
│   ├── pages/                # Route-level components
│   │   ├── LandingPage.tsx   # Public homepage
│   │   ├── Login.tsx         # Authentication
│   │   ├── Register.tsx      # User registration
│   │   ├── patient/          # Patient role pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FindDoctor.tsx
│   │   │   ├── NearbyHospitals.tsx
│   │   │   └── BloodDonation.tsx
│   │   ├── doctor/           # Doctor role pages
│   │   │   └── Dashboard.tsx
│   │   └── admin/            # Admin role pages
│   │       ├── Dashboard.tsx
│   │       └── EmergencyResponderDashboard.tsx
│   ├── services/             # API integration layer
│   │   ├── authService.ts    # Authentication APIs
│   │   ├── emergencyService.ts
│   │   ├── bloodService.ts
│   │   ├── unitService.ts
│   │   ├── locationService.ts
│   │   └── adminService.ts
│   ├── App.tsx               # Root component with routing
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 3.3 Component Architecture

#### 3.3.1 Component Hierarchy

```
App (Router + ThemeProvider)
├── LandingPage
├── Login / Register
└── Role-Based Dashboards
    ├── PatientDashboard
    │   ├── SOSButton
    │   ├── MapComponent
    │   └── Feature Cards
    ├── DoctorDashboard
    │   └── Appointment List
    ├── AdminDashboard
    │   ├── Resource Management
    │   └── Transfer Requests
    └── EmergencyResponderDashboard
        ├── Emergency List
        ├── Unit Management
        └── MapComponent (Network View)
```

#### 3.3.2 Service Layer Pattern

All API interactions are abstracted through service modules:

```typescript
// Example: emergencyService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createEmergency = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/emergencies`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
```

**Benefits:**
- Centralized API configuration
- Consistent error handling
- Easy to mock for testing
- Token management abstraction

#### 3.3.3 State Management

**Approach:** Local component state + Context API

- **Local State:** Component-specific data (forms, UI toggles)
- **Context API:** Global state (theme, user authentication)
- **No Redux:** Prototype simplicity; polling reduces need for complex state management

**Example: ThemeContext**
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 3.4 Routing Strategy

**React Router DOM** with role-based route protection:

```typescript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes - Role-based redirection after login */}
  <Route path="/dashboard" element={<PatientDashboard />} />
  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/emergency-responder-dashboard" element={<EmergencyResponderDashboard />} />
  
  {/* Feature Routes */}
  <Route path="/find-doctor" element={<FindDoctor />} />
  <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
  <Route path="/blood-donation" element={<BloodDonation />} />
</Routes>
```

**Route Protection:** Currently client-side only (token check in localStorage). Production would require route guards.

### 3.5 UI/UX Design System

#### 3.5.1 Design Tokens

- **Color Palette:** Dark theme with medical blue accents (#3b82f6)
- **Typography:** System fonts with clear hierarchy
- **Spacing:** Tailwind's 4px base unit system
- **Glassmorphism:** `backdrop-blur-md` with semi-transparent backgrounds

#### 3.5.2 Key UI Patterns

**SOS Button (Hold-to-Activate):**
```typescript
const [holdProgress, setHoldProgress] = useState(0);
const HOLD_DURATION = 3000; // 3 seconds

const handleMouseDown = () => {
  // Start progress animation
  // Trigger emergency on completion
};
```

**Real-time Polling:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchEmergencies();
  }, 3000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 4. Backend Architecture

### 4.1 Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.2.1
- **Language:** TypeScript 5.9.3
- **ODM:** Mongoose 9.1.5
- **Authentication:** jsonwebtoken 9.0.3, bcryptjs 3.0.3
- **Security:** helmet 8.1.0, cors 2.8.6
- **Logging:** morgan 1.10.1

### 4.2 Layered Architecture

The backend follows a **four-layer architecture** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                       │
│  - CORS, Helmet, Morgan (HTTP logging)                  │
│  - Body Parser (express.json)                           │
│  - JWT Authentication (protect middleware)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     ROUTE LAYER                          │
│  - Endpoint definitions                                  │
│  - Route-level middleware                                │
│  - Request routing to controllers                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                        │
│  - Request validation                                    │
│  - Business logic execution                              │
│  - Response formatting                                   │
│  - Error handling                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    MODEL LAYER                           │
│  - Mongoose schemas                                      │
│  - Data validation rules                                 │
│  - Database operations                                   │
│  - Indexes and relationships                             │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Project Structure

```
server/
├── src/
│   ├── controllers/          # Business logic handlers
│   │   ├── authController.ts
│   │   ├── emergencyController.ts
│   │   ├── bloodController.ts
│   │   ├── unitController.ts
│   │   ├── locationController.ts
│   │   └── adminController.ts
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.ts # JWT verification
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Emergency.ts
│   │   ├── Unit.ts
│   │   ├── BloodRequest.ts
│   │   ├── TransferRequest.ts
│   │   └── EquipmentRequest.ts
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── emergencyRoutes.ts
│   │   ├── bloodRoutes.ts
│   │   ├── unitRoutes.ts
│   │   ├── locationRoutes.ts
│   │   └── adminRoutes.ts
│   └── index.ts              # Application entry point
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

### 4.4 API Design

#### 4.4.1 RESTful Endpoint Structure

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register` | User registration |
| | POST | `/api/auth/login` | User authentication |
| | GET | `/api/auth/me` | Get current user |
| **Emergency** | POST | `/api/emergencies` | Create emergency alert |
| | GET | `/api/emergencies` | List emergencies |
| | PATCH | `/api/emergencies/:id` | Update emergency status |
| **Units** | POST | `/api/units` | Register unit |
| | GET | `/api/units` | List all units |
| | PATCH | `/api/units/:id` | Update unit status |
| **Blood** | POST | `/api/blood/requests` | Create blood request |
| | GET | `/api/blood/requests` | List blood requests |
| | POST | `/api/blood/requests/:id/respond` | Respond to request |
| **Location** | GET | `/api/locations/hospitals` | Get nearby hospitals |
| | GET | `/api/locations/doctors` | Search doctors |
| **Admin** | POST | `/api/admin/transfers` | Create transfer request |
| | GET | `/api/admin/transfers` | List transfers |
| | PATCH | `/api/admin/transfers/:id` | Update transfer |

#### 4.4.2 Request/Response Format

**Standard Success Response:**
```json
{
  "message": "Operation successful",
  "data": { /* resource data */ }
}
```

**Standard Error Response:**
```json
{
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### 4.5 Middleware Pipeline

#### 4.5.1 Global Middleware (Applied to all routes)

```typescript
// index.ts
app.use(express.json());           // Parse JSON bodies
app.use(cors());                   // Enable CORS
app.use(helmet());                 // Security headers
app.use(morgan('dev'));            // HTTP request logging
```

#### 4.5.2 Authentication Middleware

```typescript
// authMiddleware.ts
export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded; // Attach user to request
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```

**Usage in Routes:**
```typescript
router.post('/emergencies', protect, createEmergency);
```

### 4.6 Controller Pattern

Controllers handle business logic and orchestrate model interactions:

```typescript
// emergencyController.ts
export const createEmergency = async (req: Request, res: Response) => {
  try {
    const { type, location, description } = req.body;
    const userId = (req as any).user.id;
    
    // Validation
    if (!location?.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ 
        message: 'Valid location coordinates are required' 
      });
    }
    
    // Create emergency
    const emergency = new Emergency({
      patientId: userId,
      type: type || 'ambulance',
      severity: 'critical',
      status: 'pending',
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      },
      description
    });
    
    const savedEmergency = await emergency.save();
    
    res.status(201).json({
      message: 'Emergency alert sent successfully',
      emergency: savedEmergency
    });
  } catch (error) {
    console.error('Emergency Creation Error:', error);
    res.status(500).json({ message: 'Server error processing emergency' });
  }
};
```

**Controller Responsibilities:**
- Input validation
- User context extraction (from JWT)
- Business logic execution
- Model interaction
- Response formatting
- Error handling

---

## 5. Database Design

### 5.1 Database Technology

**MongoDB 9.1.5** - NoSQL document database chosen for:
- Flexible schema for evolving requirements
- Native geospatial query support (2dsphere indexes)
- JSON-like document structure aligns with JavaScript/TypeScript
- Horizontal scalability
- Rich query capabilities

### 5.2 Data Models

#### 5.2.1 User Collection

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;              // Unique index
  password: string;           // Bcrypt hashed, select: false
  phone: string;
  role: 'patient' | 'doctor' | 'hospital_admin' | 'emergency_admin';
  avatar?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `email` (unique)
- `location` (2dsphere for geospatial queries)

**Security:**
- Password field has `select: false` to prevent accidental exposure
- Passwords hashed with bcrypt before storage

#### 5.2.2 Emergency Collection

```typescript
interface IEmergency {
  _id: ObjectId;
  patientId: ObjectId;        // Reference to User
  type: 'ambulance' | 'police' | 'fire' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'resolved' | 'cancelled';
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  assignedAmbulanceId?: ObjectId;  // Reference to Unit
  assignedHospitalId?: ObjectId;   // Reference to User (hospital_admin)
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `location` (2dsphere)
- `status` (for filtering active emergencies)
- `createdAt` (for sorting by recency)

**Relationships:**
- `patientId` → User (populated in queries)
- `assignedAmbulanceId` → Unit (populated in queries)

#### 5.2.3 Unit Collection

```typescript
interface IUnit {
  _id: ObjectId;
  name: string;
  type: 'ambulance' | 'mobile_clinic' | 'rescue_vehicle';
  status: 'available' | 'on_call' | 'busy' | 'maintenance';
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  currentTask?: string;
  personnel: string[];
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `location` (2dsphere for nearest unit queries)
- `status` (for filtering available units)

#### 5.2.4 BloodRequest Collection

```typescript
interface IBloodRequest {
  _id: ObjectId;
  requesterId: ObjectId;      // Reference to User
  patientName: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  hospital: string;
  age: number;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  urgency: 'critical' | 'moderate' | 'low';
  status: 'active' | 'fulfilled' | 'cancelled';
  donors: ObjectId[];         // Array of User references
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `location` (2dsphere)
- `bloodType` (for matching queries)
- `status` (for filtering active requests)

#### 5.2.5 TransferRequest Collection

```typescript
interface ITransferRequest {
  _id: ObjectId;
  equipmentType: string;
  quantity: number;
  sourceHospital: string;
  destinationHospital: string;
  urgency: 'critical' | 'urgent' | 'routine';
  status: 'pending' | 'approved' | 'in-transit' | 'completed' | 'rejected';
  requesterId: ObjectId;      // Reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

#### 5.2.6 EquipmentRequest Collection

```typescript
interface IEquipmentRequest {
  _id: ObjectId;
  hospitalId: ObjectId;       // Reference to User (hospital_admin)
  equipmentType: string;
  quantity: number;
  urgency: 'critical' | 'urgent' | 'routine';
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3 Geospatial Queries

MongoDB's 2dsphere indexes enable efficient location-based queries:

```typescript
// Find nearest available ambulances
const nearestUnits = await Unit.find({
  status: 'available',
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 5000  // 5km radius
    }
  }
}).limit(5);
```

### 5.4 Data Relationships

```
User (Patient) ──┬─── Emergency (1:N)
                 │
                 └─── BloodRequest (1:N)

User (Admin) ────┬─── TransferRequest (1:N)
                 │
                 └─── EquipmentRequest (1:N)

Unit ────────────── Emergency (1:N via assignedAmbulanceId)

BloodRequest ────── User (Donors) (N:M via donors array)
```

**Relationship Implementation:**
- **References:** ObjectId fields with `.populate()` for joins
- **Embedded Documents:** Location data embedded in parent documents
- **Arrays:** Donors in BloodRequest, personnel in Unit

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Server    │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. POST /api/auth/register                     │
       │     { email, password, name, role }             │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                    2. Hash password (bcrypt)
       │                                    3. Create user in DB
       │                                                  │
       │  4. { message, user (no password) }             │
       │<────────────────────────────────────────────────┤
       │                                                  │
       │  5. POST /api/auth/login                        │
       │     { email, password }                         │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                    6. Find user by email
       │                                    7. Compare password (bcrypt)
       │                                    8. Generate JWT token
       │                                                  │
       │  9. { token, user }                             │
       │<────────────────────────────────────────────────┤
       │                                                  │
       │  10. Store token in localStorage                │
       │                                                  │
       │  11. Subsequent requests with token             │
       │      Authorization: Bearer <token>              │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                    12. Verify JWT
       │                                    13. Extract user context
       │                                    14. Process request
       │                                                  │
       │  15. Response                                    │
       │<────────────────────────────────────────────────┤
       │                                                  │
```

### 6.2 JWT Token Structure

```typescript
// Token Payload
{
  id: string;           // User ObjectId
  email: string;        // User email
  role: string;         // User role
  iat: number;          // Issued at timestamp
  exp: number;          // Expiration timestamp
}
```

**Token Configuration:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret:** Environment variable `JWT_SECRET`
- **Expiration:** 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Storage:** Client-side localStorage (production should use httpOnly cookies)

### 6.3 Password Security

```typescript
// Registration - Hash password
import bcrypt from 'bcryptjs';

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Login - Verify password
const isMatch = await bcrypt.compare(enteredPassword, user.password);
```

**Security Measures:**
- Bcrypt with 10 salt rounds
- Password field excluded from queries by default (`select: false`)
- No password in API responses

### 6.4 Role-Based Access Control (RBAC)

#### 6.4.1 Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| `patient` | End users requiring medical services | Create emergencies, blood requests; view own data |
| `doctor` | Medical professionals | View appointments, respond to blood requests |
| `hospital_admin` | Hospital administrators | Manage resources, transfer requests, view all emergencies |
| `emergency_admin` | Emergency responders | Manage units, assign to emergencies, update status |

#### 6.4.2 Authorization Implementation

**Current Implementation:** Role stored in JWT, checked in controllers

```typescript
// Example: Only admins can create transfer requests
export const createTransferRequest = async (req: Request, res: Response) => {
  const userRole = (req as any).user.role;
  
  if (userRole !== 'hospital_admin' && userRole !== 'emergency_admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Process request...
};
```

**Limitation:** No centralized authorization middleware. Production should implement:

```typescript
// Proposed: Role-based middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Usage
router.post('/transfers', protect, authorize('hospital_admin', 'emergency_admin'), createTransferRequest);
```

#### 6.4.3 Frontend Route Protection

```typescript
// After login, redirect based on role
const handleLogin = async () => {
  const response = await loginUser({ email, password });
  localStorage.setItem('token', response.token);
  
  // Role-based redirection
  switch (response.user.role) {
    case 'patient':
      navigate('/dashboard');
      break;
    case 'doctor':
      navigate('/doctor-dashboard');
      break;
    case 'hospital_admin':
      navigate('/admin-dashboard');
      break;
    case 'emergency_admin':
      navigate('/emergency-responder-dashboard');
      break;
  }
};
```

**Limitation:** No route guards. Users can manually navigate to unauthorized routes. Production requires:

```typescript
// Proposed: Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getCurrentUser();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

---

## 7. Core Workflows

### 7.1 SOS Alert Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                    SOS ALERT WORKFLOW                         │
└──────────────────────────────────────────────────────────────┘

1. ALERT INITIATION
   ┌─────────────┐
   │   Patient   │ Holds SOS button for 3 seconds
   └──────┬──────┘
          │
          ↓
   ┌─────────────┐
   │  Frontend   │ Captures GPS coordinates
   └──────┬──────┘
          │
          ↓
   POST /api/emergencies
   {
     type: 'ambulance',
     location: { coordinates: [lng, lat], address: '...' },
     description: 'Emergency details'
   }

2. ALERT CREATION
   ┌─────────────┐
   │   Backend   │ Validates request, extracts user from JWT
   └──────┬──────┘
          │
          ↓
   ┌─────────────┐
   │  Database   │ Creates Emergency document
   │             │ Status: 'pending'
   │             │ Severity: 'critical'
   └──────┬──────┘
          │
          ↓
   Response: { message, emergency }

3. ALERT VISIBILITY
   ┌─────────────┐
   │  Responder  │ Polls GET /api/emergencies every 3s
   │  Dashboard  │ Sees new pending emergency
   └──────┬──────┘
          │
          ↓
   Displays on map with patient location

4. UNIT ASSIGNMENT
   ┌─────────────┐
   │  Responder  │ Selects available unit
   └──────┬──────┘
          │
          ↓
   PATCH /api/emergencies/:id
   {
     status: 'assigned',
     unitId: '<unit_id>'
   }
   ┌─────────────┐
   │   Backend   │ Updates emergency.assignedAmbulanceId
   │             │ Updates unit.status = 'on_call'
   └─────────────┘

5. RESPONSE IN PROGRESS
   ┌─────────────┐
   │   Patient   │ Sees assigned unit info
   │  Dashboard  │ Real-time status updates via polling
   └─────────────┘

6. RESOLUTION
   ┌─────────────┐
   │  Responder  │ Marks emergency as resolved
   └──────┬──────┘
          │
          ↓
   PATCH /api/emergencies/:id
   { status: 'resolved' }
   ┌─────────────┐
   │   Backend   │ Updates emergency status
   │             │ Releases unit (status = 'available')
   └─────────────┘
```

### 7.2 Blood Request Workflow

```
1. REQUEST CREATION
   Patient/Admin → POST /api/blood/requests
   {
     patientName, bloodType, hospital, age, phone,
     location, urgency
   }
   
2. REQUEST VISIBILITY
   All users → GET /api/blood/requests
   Filters by location, blood type, urgency
   
3. DONOR RESPONSE
   Donor → POST /api/blood/requests/:id/respond
   Adds donor to request.donors array
   
4. FULFILLMENT
   Admin → PATCH /api/blood/requests/:id
   { status: 'fulfilled' }
```

### 7.3 Unit Management Workflow

```
1. UNIT REGISTRATION
   Responder → POST /api/units
   {
     name, type, location, phone, personnel
   }
   Status: 'available'
   
2. STATUS UPDATES
   Responder → PATCH /api/units/:id
   {
     status: 'on_call' | 'busy' | 'maintenance',
     location: { coordinates: [...] }
   }
   
3. AUTOMATIC STATUS CHANGES
   - Emergency assignment → status: 'on_call'
   - Emergency resolution → status: 'available'
```

### 7.4 Resource Transfer Workflow

```
1. TRANSFER REQUEST
   Admin → POST /api/admin/transfers
   {
     equipmentType, quantity,
     sourceHospital, destinationHospital,
     urgency
   }
   Status: 'pending'
   
2. APPROVAL
   Admin → PATCH /api/admin/transfers/:id
   { status: 'approved' }
   
3. IN-TRANSIT
   Responder → PATCH /api/admin/transfers/:id
   { status: 'in-transit' }
   
4. COMPLETION
   Admin → PATCH /api/admin/transfers/:id
   { status: 'completed' }
```

---

## 8. Real-Time Update Mechanism

### 8.1 Polling Architecture

**Design Decision:** Client-side polling instead of WebSockets for prototype simplicity.

```typescript
// Frontend polling implementation
useEffect(() => {
  const fetchData = async () => {
    try {
      const emergencies = await getEmergencies();
      setEmergencies(emergencies);
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  
  // Initial fetch
  fetchData();
  
  // Poll every 3 seconds
  const interval = setInterval(fetchData, 3000);
  
  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);
```

### 8.2 Polling Strategy

**Interval:** 3 seconds (configurable)

**Polled Endpoints:**
- `/api/emergencies` - Emergency list and status
- `/api/units` - Unit locations and availability
- `/api/blood/requests` - Blood request status

**Optimization Techniques:**
- Conditional rendering to prevent unnecessary re-renders
- Debouncing user actions during polling
- Error handling to prevent polling interruption

### 8.3 Trade-offs

**Advantages:**
- Simple implementation
- No WebSocket infrastructure required
- Works with standard HTTP/HTTPS
- Easy to debug and monitor

**Disadvantages:**
- 3-second latency in updates
- Increased server load (repeated requests)
- Inefficient for idle clients
- No server-push capability

**Future Enhancement:** WebSocket implementation for true real-time updates

```typescript
// Proposed WebSocket architecture
const socket = io('http://localhost:5000');

socket.on('emergency:created', (emergency) => {
  setEmergencies(prev => [emergency, ...prev]);
});

socket.on('emergency:updated', (emergency) => {
  setEmergencies(prev => 
    prev.map(e => e._id === emergency._id ? emergency : e)
  );
});
```

---

## 9. Security Architecture

### 9.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSPORT LAYER                           │
│  - HTTPS (production)                                        │
│  - TLS 1.2+ encryption                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  - Helmet.js security headers                                │
│  - CORS policy                                               │
│  - Rate limiting (recommended)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION LAYER                         │
│  - JWT token verification                                    │
│  - Bcrypt password hashing                                   │
│  - Token expiration                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  AUTHORIZATION LAYER                         │
│  - Role-based access control                                 │
│  - Resource ownership validation                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  - Input validation (Mongoose schemas)                       │
│  - SQL injection prevention (NoSQL)                          │
│  - Password field exclusion                                  │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Security Headers (Helmet.js)

```typescript
app.use(helmet());
```

**Headers Applied:**
- `Content-Security-Policy` - Prevents XSS attacks
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Strict-Transport-Security` - Enforces HTTPS
- `X-XSS-Protection` - Legacy XSS protection

### 9.3 CORS Configuration

```typescript
app.use(cors());
```

**Current:** Permissive (allows all origins)

**Production Recommendation:**
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://lifelink.example.com',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 9.4 Input Validation

**Client-Side:**
- Form validation (required fields, format checks)
- Type checking (TypeScript)

**Server-Side:**
- Mongoose schema validation
- Controller-level validation
- Type coercion prevention

```typescript
// Example: Emergency creation validation
if (!location?.coordinates || location.coordinates.length !== 2) {
  return res.status(400).json({ 
    message: 'Valid location coordinates are required' 
  });
}
```

### 9.5 Security Best Practices Implemented

✅ **Implemented:**
- Password hashing (bcrypt)
- JWT authentication
- Security headers (Helmet)
- CORS configuration
- Input validation
- Password field exclusion from queries
- HTTPS ready (production)

⚠️ **Missing (Production Requirements):**
- Rate limiting
- Request size limits
- SQL/NoSQL injection prevention (parameterized queries)
- CSRF protection
- Session management
- Audit logging
- Encryption at rest
- Secrets management (environment variables only)

---

## 10. Scalability Strategy

### 10.1 Current Architecture Limitations

**Single Server Deployment:**
- All components on one server
- No load balancing
- No horizontal scaling
- Single point of failure

**Database:**
- Single MongoDB instance
- No replication
- No sharding

### 10.2 Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                           │
│                    (Nginx / AWS ALB)                         │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬────────────────┬────────────────┐
    │                 │                │                │
┌───▼────┐      ┌────▼───┐      ┌────▼───┐      ┌────▼───┐
│ App    │      │ App    │      │ App    │      │ App    │
│ Server │      │ Server │      │ Server │      │ Server │
│   1    │      │   2    │      │   3    │      │   N    │
└───┬────┘      └────┬───┘      └────┬───┘      └────┬───┘
    │                │                │                │
    └────────┬───────┴────────────────┴────────────────┘
             │
    ┌────────▼────────────────────────────────────────┐
    │         MongoDB Replica Set                     │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
    │  │ Primary │  │Secondary│  │Secondary│        │
    │  └─────────┘  └─────────┘  └─────────┘        │
    └─────────────────────────────────────────────────┘
```

**Scaling Considerations:**
- Stateless application servers (JWT in request, no session storage)
- Database connection pooling
- Shared cache layer (Redis for session/rate limiting)
- CDN for static assets

### 10.3 Database Scaling

**Vertical Scaling:**
- Increase server resources (CPU, RAM, storage)
- Optimize indexes
- Query optimization

**Horizontal Scaling:**
- **Replication:** MongoDB replica sets for read scaling and high availability
- **Sharding:** Partition data across multiple servers (by geographic region, user ID)

```
Sharding Strategy:
- Shard Key: location.coordinates (geographic distribution)
- Benefit: Queries for nearby resources hit single shard
```

### 10.4 Caching Strategy

**Proposed Redis Integration:**

```typescript
// Cache frequently accessed data
const getEmergencies = async () => {
  const cacheKey = 'emergencies:active';
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const emergencies = await Emergency.find({ status: { $ne: 'resolved' } });
  
  // Cache for 5 seconds
  await redis.setex(cacheKey, 5, JSON.stringify(emergencies));
  
  return emergencies;
};
```

**Cache Invalidation:**
- Time-based expiration (5-10 seconds for real-time data)
- Event-based invalidation (on emergency creation/update)

### 10.5 Performance Optimization

**Database Indexes:**
```typescript
// Compound indexes for common queries
EmergencySchema.index({ status: 1, createdAt: -1 });
UnitSchema.index({ status: 1, location: '2dsphere' });
BloodRequestSchema.index({ bloodType: 1, status: 1 });
```

**Query Optimization:**
- Use `.lean()` for read-only queries (faster, plain objects)
- Limit fields with `.select()` to reduce payload
- Pagination for large result sets

```typescript
// Optimized query
const emergencies = await Emergency
  .find({ status: 'pending' })
  .select('patientId location status createdAt')
  .populate('patientId', 'name phone')
  .limit(50)
  .lean();
```

---

## 11. Deployment Model

### 11.1 Current Deployment (Development)

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT MACHINE                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Frontend (Vite Dev Server)                          │  │
│  │  Port: 5173                                          │  │
│  │  Hot Module Replacement                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Backend (Nodemon)                                   │  │
│  │  Port: 5000                                          │  │
│  │  Auto-restart on file changes                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB (Local or Atlas)                            │  │
│  │  Port: 27017 (local)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Development Commands:**
```bash
# Backend
cd server
npm run dev  # Starts nodemon

# Frontend
cd client
npm run dev  # Starts Vite dev server
```

### 11.2 Production Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   CDN   │ (Static Assets)
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  Nginx  │ (Reverse Proxy / Load Balancer)
                    └────┬────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼────┐                      ┌────▼────┐
   │ Node.js │                      │ Node.js │
   │ Server  │                      │ Server  │
   │   (PM2) │                      │   (PM2) │
   └────┬────┘                      └────┬────┘
        │                                 │
        └────────────────┬────────────────┘
                         │
                    ┌────▼────┐
                    │ MongoDB │
                    │ Replica │
                    │   Set   │
                    └─────────┘
```

### 11.3 Build Process

**Frontend Build:**
```bash
cd client
npm run build
# Output: client/dist/
# - index.html
# - assets/ (JS, CSS bundles)
```

**Backend Build:**
```bash
cd server
npm run build
# Output: server/dist/
# - Compiled TypeScript to JavaScript
```

### 11.4 Environment Configuration

**Backend (.env):**
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/lifelink
JWT_SECRET=<secure-random-string>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://lifelink.example.com
```

**Frontend (vite.config.ts):**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

### 11.5 Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, Linode)

```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm nginx mongodb

# Clone repository
git clone <repo-url>

# Setup backend
cd server
npm install
npm run build
pm2 start dist/index.js --name lifelink-api

# Setup frontend
cd ../client
npm install
npm run build
# Serve dist/ with Nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/lifelink
# Proxy /api to backend, serve static files
```

#### Option 2: Docker Containers

```dockerfile
# Dockerfile (Backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/lifelink
    depends_on:
      - mongo
  
  frontend:
    build: ./client
    ports:
      - "80:80"
  
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### Option 3: Cloud Platform (AWS, Azure, GCP)

**AWS Architecture:**
- **Frontend:** S3 + CloudFront
- **Backend:** EC2 / ECS / Lambda
- **Database:** MongoDB Atlas / DocumentDB
- **Load Balancer:** Application Load Balancer
- **DNS:** Route 53

---

## 12. Monitoring & Logging

### 12.1 Current Logging Implementation

**HTTP Request Logging (Morgan):**
```typescript
app.use(morgan('dev'));
```

**Output Format:**
```
GET /api/emergencies 200 45.123 ms - 1234
POST /api/auth/login 401 12.456 ms - 56
```

**Console Logging:**
```typescript
console.log('✅ MongoDB Connected');
console.error('❌ MongoDB Connection Error:', err);
console.error('Emergency Creation Error:', error);
```

### 12.2 Production Logging Strategy

**Structured Logging (Winston):**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Emergency created', { 
  emergencyId: emergency._id, 
  userId: user.id,
  location: emergency.location 
});

logger.error('Database connection failed', { error: err.message });
```

**Log Levels:**
- `error` - System errors, exceptions
- `warn` - Warnings, deprecated features
- `info` - General information, business events
- `debug` - Detailed debugging information

### 12.3 Monitoring Metrics

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx responses)
- Active connections

**Business Metrics:**
- Emergency alerts created
- Average response time (alert to assignment)
- Unit utilization rate
- Blood request fulfillment rate

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network throughput

### 12.4 Monitoring Tools

**Proposed Stack:**

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  - Express app with instrumentation                          │
│  - Custom metrics collection                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │ Metrics │
                    │Exporter │
                    └────┬────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼────┐                      ┌────▼────┐
   │Prometheus│                     │ ELK     │
   │(Metrics) │                     │ Stack   │
   └────┬────┘                      │(Logs)   │
        │                           └─────────┘
   ┌────▼────┐
   │ Grafana │
   │(Dashboards)
   └─────────┘
```

**Tools:**
- **Prometheus:** Metrics collection and storage
- **Grafana:** Visualization and dashboards
- **ELK Stack:** Log aggregation and analysis (Elasticsearch, Logstash, Kibana)
- **PM2:** Process monitoring and management
- **New Relic / Datadog:** APM (Application Performance Monitoring)

### 12.5 Health Check Endpoints

**Proposed Implementation:**

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Readiness check (for load balancers)
app.get('/ready', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

### 12.6 Alerting Strategy

**Alert Conditions:**
- Error rate > 5% for 5 minutes
- Response time p95 > 1 second for 5 minutes
- Database connection lost
- Disk usage > 85%
- Memory usage > 90%

**Alert Channels:**
- Email
- Slack
- PagerDuty (for critical alerts)
- SMS (for emergency alerts)

---

## 13. Failure Handling Strategy

### 13.1 Error Handling Patterns

#### 13.1.1 Controller-Level Error Handling

```typescript
export const createEmergency = async (req: Request, res: Response) => {
  try {
    // Business logic
    const emergency = await Emergency.create(data);
    res.status(201).json({ message: 'Success', emergency });
  } catch (error) {
    console.error('Emergency Creation Error:', error);
    res.status(500).json({ message: 'Server error processing emergency' });
  }
};
```

**Pattern:** Try-catch blocks in all async controllers

#### 13.1.2 Global Error Handler

**Proposed Middleware:**

```typescript
// Error handling middleware (must be last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: err.errors 
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Default error
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### 13.2 Database Failure Handling

**Connection Error Handling:**

```typescript
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit on connection failure
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

**Retry Logic (Proposed):**

```typescript
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ MongoDB Connected');
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Failed to connect after retries. Exiting...');
  process.exit(1);
};
```

### 13.3 Frontend Error Handling

**API Error Handling:**

```typescript
// Service layer error handling
export const createEmergency = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/emergencies`, data, getConfig());
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error. Please check your connection.');
    } else {
      // Request setup error
      throw new Error('Request failed. Please try again.');
    }
  }
};
```

**Component Error Handling:**

```typescript
const handleSOSClick = async () => {
  try {
    setLoading(true);
    await createEmergency({ location, type: 'ambulance' });
    setAlertActive(true);
  } catch (error: any) {
    setError(error.message);
    // Show error toast/notification
  } finally {
    setLoading(false);
  }
};
```

**Error Boundary (Proposed):**

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 13.4 Graceful Degradation

**Strategies:**

1. **GPS Failure:** Fallback to IP-based geolocation or manual address entry
2. **Map Loading Failure:** Show list view instead of map
3. **Polling Failure:** Show cached data with "Last updated" timestamp
4. **Authentication Failure:** Redirect to login with error message
5. **API Timeout:** Retry with exponential backoff

**Example: GPS Fallback**

```typescript
const getLocation = async () => {
  try {
    // Try GPS
    const position = await navigator.geolocation.getCurrentPosition();
    return position.coords;
  } catch (error) {
    console.warn('GPS failed, using IP geolocation');
    // Fallback to IP-based location
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return { latitude: data.latitude, longitude: data.longitude };
  }
};
```

### 13.5 Circuit Breaker Pattern (Proposed)

For external service calls (future AI services, third-party APIs):

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute(fn: () => Promise<any>) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= 5) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 14. AI Module Extensibility

### 14.1 Current AI Implementation

**Status:** Placeholder modules with basic algorithms

**Location:** `/ai/predict_severity.py`

**Current Capability:** Basic severity prediction (not integrated)

### 14.2 AI Service Architecture (Proposed)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  BACKEND (Express)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Service Abstraction Layer                        │  │
│  │  - Request validation                                │  │
│  │  - Response formatting                               │  │
│  │  - Fallback handling                                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │
                    HTTP/gRPC
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  AI MICROSERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Triage     │  │   Routing    │  │   NLP        │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │  (Python)    │  │  (Python)    │  │  (Python)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 14.3 AI Service Integration Pattern

**Backend AI Service Client:**

```typescript
// services/aiService.ts
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const predictSeverity = async (symptoms: string[]) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/triage`, {
      symptoms,
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error);
    // Fallback to default severity
    return { severity: 'medium', confidence: 0.5, source: 'fallback' };
  }
};

export const findNearestUnit = async (location: [number, number]) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/routing`, {
      location,
      timeout: 3000
    });
    return response.data;
  } catch (error) {
    console.error('Routing Service Error:', error);
    // Fallback to database query
    return null;
  }
};
```

**Controller Integration:**

```typescript
export const createEmergency = async (req: Request, res: Response) => {
  try {
    const { type, location, description, symptoms } = req.body;
    
    // AI-assisted severity prediction
    let severity = 'critical'; // Default
    if (symptoms && symptoms.length > 0) {
      const prediction = await predictSeverity(symptoms);
      severity = prediction.severity;
    }
    
    const emergency = new Emergency({
      patientId: userId,
      type,
      severity,
      status: 'pending',
      location,
      description
    });
    
    await emergency.save();
    
    // AI-assisted unit assignment (async, non-blocking)
    findNearestUnit(location.coordinates)
      .then(unit => {
        if (unit) {
          // Auto-assign unit
          emergency.assignedAmbulanceId = unit._id;
          emergency.status = 'assigned';
          emergency.save();
        }
      })
      .catch(err => console.error('Auto-assignment failed:', err));
    
    res.status(201).json({ message: 'Success', emergency });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 14.4 AI Service Specifications

#### 14.4.1 Triage Service

**Endpoint:** `POST /triage`

**Request:**
```json
{
  "symptoms": ["chest pain", "shortness of breath", "dizziness"],
  "age": 45,
  "medicalHistory": ["hypertension"]
}
```

**Response:**
```json
{
  "severity": "critical",
  "confidence": 0.92,
  "reasoning": "Symptoms indicate possible cardiac event",
  "recommendations": ["Immediate emergency response required"],
  "disclaimer": "AI assessment - human verification required"
}
```

#### 14.4.2 Routing Service

**Endpoint:** `POST /routing`

**Request:**
```json
{
  "emergencyLocation": [77.5946, 12.9716],
  "unitType": "ambulance",
  "trafficData": true
}
```

**Response:**
```json
{
  "recommendedUnit": {
    "unitId": "AMB-001",
    "estimatedArrival": "8 minutes",
    "distance": 3.2,
    "route": [[77.5946, 12.9716], [77.5950, 12.9720], ...]
  },
  "alternativeUnits": [
    { "unitId": "AMB-002", "estimatedArrival": "10 minutes" }
  ]
}
```

#### 14.4.3 NLP Chatbot Service

**Endpoint:** `POST /chat`

**Request:**
```json
{
  "message": "I have severe headache and fever",
  "conversationId": "conv-123",
  "userId": "user-456"
}
```

**Response:**
```json
{
  "reply": "I understand you're experiencing a severe headache and fever. How long have you had these symptoms?",
  "intent": "symptom_assessment",
  "entities": {
    "symptoms": ["headache", "fever"],
    "severity": "severe"
  },
  "nextAction": "gather_more_info"
}
```

### 14.5 AI Model Management

**Model Versioning:**
```
/ai/models/
├── triage/
│   ├── v1.0/
│   │   ├── model.pkl
│   │   └── metadata.json
│   └── v1.1/
│       ├── model.pkl
│       └── metadata.json
├── routing/
│   └── v1.0/
└── nlp/
    └── v1.0/
```

**Model Metadata:**
```json
{
  "version": "1.1",
  "trainedOn": "2026-01-15",
  "accuracy": 0.89,
  "dataset": "synthetic-emergency-data-v2",
  "framework": "scikit-learn",
  "inputSchema": {
    "symptoms": "array of strings",
    "age": "integer",
    "medicalHistory": "array of strings"
  }
}
```

### 14.6 Responsible AI Integration

**Human-in-the-Loop:**
```typescript
// AI recommendation with human override
const aiRecommendation = await predictSeverity(symptoms);

// Store AI recommendation for audit
emergency.aiAssessment = {
  severity: aiRecommendation.severity,
  confidence: aiRecommendation.confidence,
  timestamp: new Date()
};

// Human can override
if (humanOverride) {
  emergency.severity = humanOverride.severity;
  emergency.overrideReason = humanOverride.reason;
}
```

**Explainability:**
```typescript
// AI response includes reasoning
{
  "severity": "critical",
  "confidence": 0.92,
  "reasoning": "Symptoms indicate possible cardiac event",
  "factors": [
    { "factor": "chest pain", "weight": 0.45 },
    { "factor": "shortness of breath", "weight": 0.30 },
    { "factor": "age > 40", "weight": 0.17 }
  ]
}
```

---

## 15. Technical Limitations

### 15.1 Current Implementation Limitations

#### 15.1.1 Architecture Limitations
- **Single Server:** No load balancing or horizontal scaling
- **No Caching:** Every request hits the database
- **Polling-Based Updates:** 3-second latency, inefficient for idle clients
- **No WebSockets:** No true real-time communication
- **No Message Queue:** Synchronous processing only

#### 15.1.2 Security Limitations
- **No Rate Limiting:** Vulnerable to abuse
- **Client-Side Token Storage:** localStorage instead of httpOnly cookies
- **No CSRF Protection:** Vulnerable to cross-site request forgery
- **Permissive CORS:** Allows all origins in development
- **No Encryption at Rest:** Database data not encrypted
- **No Audit Logging:** Limited tracking of sensitive operations

#### 15.1.3 Data Limitations
- **Synthetic Data Only:** Not validated with real patient data
- **No Data Backup:** No automated backup strategy
- **No Data Retention Policy:** Indefinite storage
- **No GDPR Compliance:** Missing data subject rights implementation
- **No Data Encryption:** Sensitive data stored in plain text

#### 15.1.4 Functional Limitations
- **No Automated Dispatch:** Manual unit assignment only
- **Basic AI:** Placeholder modules, not production-ready
- **No Notifications:** No SMS, email, or push notifications
- **No Appointment Booking:** View-only doctor appointments
- **No Payment Integration:** No billing or payment processing
- **Limited Search:** Basic filtering, no advanced search
- **No Multi-Language:** English only

#### 15.1.5 Testing Limitations
- **No Unit Tests:** No automated test suite
- **No Integration Tests:** No API endpoint testing
- **No E2E Tests:** No end-to-end workflow testing
- **No Load Testing:** Performance under load unknown
- **No Security Testing:** No penetration testing or vulnerability scanning

#### 15.1.6 Monitoring Limitations
- **Basic Logging:** Console logs only, no structured logging
- **No Metrics:** No performance or business metrics collection
- **No Alerting:** No automated alerts for failures
- **No APM:** No application performance monitoring
- **No Error Tracking:** No centralized error tracking (Sentry, etc.)

#### 15.1.7 Deployment Limitations
- **Manual Deployment:** No CI/CD pipeline
- **No Blue-Green Deployment:** Downtime during updates
- **No Rollback Strategy:** Manual rollback only
- **No Environment Parity:** Dev/prod differences
- **No Infrastructure as Code:** Manual server configuration

### 15.2 Scalability Constraints

**Current Capacity Estimates:**
- **Concurrent Users:** ~100-500 (single server)
- **Requests/Second:** ~100-200 (without caching)
- **Database Size:** Limited by single MongoDB instance
- **Geographic Coverage:** Single region only

**Bottlenecks:**
- Database queries (no caching, no read replicas)
- Polling overhead (3-second intervals for all clients)
- Single server CPU/memory limits
- Network bandwidth

### 15.3 Browser Compatibility

**Tested:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ⚠️ (limited testing)
- Edge 90+ ✅

**Not Tested:**
- Internet Explorer (not supported)
- Older mobile browsers
- Opera, Brave, other Chromium-based browsers

**Known Issues:**
- GPS permission handling varies by browser
- Leaflet map rendering issues on some mobile browsers
- Framer Motion animations may be choppy on low-end devices

### 15.4 Mobile Responsiveness

**Supported Breakpoints:**
- Desktop: 1920px+ ✅
- Laptop: 1024px-1919px ✅
- Tablet: 768px-1023px ⚠️ (partial)
- Mobile: 375px-767px ⚠️ (partial)

**Limitations:**
- Touch gestures not optimized
- Map interactions difficult on small screens
- Some dashboards not fully responsive
- No native mobile app

### 15.5 Compliance Gaps

**HIPAA:**
- ❌ No encryption at rest
- ❌ No Business Associate Agreements
- ❌ Incomplete audit controls
- ❌ No access logs
- ⚠️ Password hashing (partial compliance)

**GDPR:**
- ❌ No Data Protection Impact Assessment
- ❌ No right to erasure implementation
- ❌ No data portability
- ❌ No consent management
- ❌ No Data Protection Officer

**FDA:**
- ❌ Not submitted for approval
- ❌ No clinical validation
- ❌ No quality management system
- ⚠️ Human oversight (partial alignment)

---

## 16. Technology Stack

### 16.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.2.4 | Build tool & dev server |
| React Router DOM | 7.13.0 | Client-side routing |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Framer Motion | 12.29.2 | Animations |
| Leaflet | 1.9.4 | Map rendering |
| React Leaflet | 5.0.0 | React bindings for Leaflet |
| Axios | 1.13.4 | HTTP client |
| Lucide React | 0.563.0 | Icon library |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.4.0 | Tailwind class merging |

### 16.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 5.2.1 | Web framework |
| TypeScript | 5.9.3 | Type safety |
| Mongoose | 9.1.5 | MongoDB ODM |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcryptjs | 3.0.3 | Password hashing |
| helmet | 8.1.0 | Security headers |
| cors | 2.8.6 | CORS middleware |
| morgan | 1.10.1 | HTTP logging |
| dotenv | 17.2.3 | Environment variables |
| nodemon | 3.1.11 | Dev auto-restart |
| ts-node | 10.9.2 | TypeScript execution |

### 16.3 Database

| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 9.1.5+ | NoSQL document database |
| MongoDB Atlas | Cloud | Managed database (optional) |

### 16.4 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting (recommended) |
| Git | Version control |
| npm | Package management |
| Postman | API testing |
| MongoDB Compass | Database GUI |

### 16.5 Deployment Stack (Proposed)

| Technology | Purpose |
|------------|---------|
| Nginx | Reverse proxy, load balancer |
| PM2 | Process management |
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Let's Encrypt | SSL certificates |
| MongoDB Atlas | Managed database |
| AWS/DigitalOcean | Cloud hosting |

### 16.6 Monitoring Stack (Proposed)

| Technology | Purpose |
|------------|---------|
| Winston | Structured logging |
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| ELK Stack | Log aggregation |
| Sentry | Error tracking |
| New Relic/Datadog | APM |

---

## 17. Design Decisions & Rationale

### 17.1 Why MongoDB?

**Chosen for:**
- Flexible schema for evolving requirements
- Native geospatial query support (2dsphere indexes)
- JSON-like documents align with JavaScript/TypeScript
- Horizontal scalability (sharding)
- Rich query capabilities

**Trade-offs:**
- No ACID transactions across collections (acceptable for prototype)
- Eventual consistency in distributed setup
- Larger storage footprint than relational databases

### 17.2 Why Polling Instead of WebSockets?

**Rationale:**
- Simpler implementation for prototype
- No WebSocket infrastructure required
- Works with standard HTTP/HTTPS
- Easier to debug and monitor

**Trade-offs:**
- 3-second latency in updates
- Increased server load
- Inefficient for idle clients

**Future:** WebSocket implementation planned for production

### 17.3 Why JWT Instead of Sessions?

**Rationale:**
- Stateless authentication (no server-side session storage)
- Scalable across multiple servers
- Mobile-friendly (token in header)
- Standard format (RFC 7519)

**Trade-offs:**
- Cannot invalidate tokens before expiration
- Token size larger than session ID
- Client-side storage security concerns

**Mitigation:**
- Short expiration time (24 hours)
- Refresh token mechanism (future)
- httpOnly cookies for production

### 17.4 Why React Instead of Other Frameworks?

**Rationale:**
- Large ecosystem and community
- Component-based architecture
- TypeScript support
- Rich library ecosystem (React Router, Framer Motion)
- Vite for fast development experience

**Alternatives Considered:**
- Vue.js: Simpler learning curve, but smaller ecosystem
- Angular: More opinionated, steeper learning curve
- Svelte: Smaller bundle size, but less mature ecosystem

### 17.5 Why Express Instead of Other Node.js Frameworks?

**Rationale:**
- Minimalist and flexible
- Large ecosystem of middleware
- Well-documented and mature
- TypeScript support
- Easy to learn and use

**Alternatives Considered:**
- Fastify: Faster, but less mature ecosystem
- NestJS: More structured, but more complex
- Koa: Modern, but smaller community

### 17.6 Why Tailwind CSS?

**Rationale:**
- Utility-first approach for rapid development
- Consistent design system
- Small production bundle (PurgeCSS)
- Responsive design utilities
- Dark mode support

**Trade-offs:**
- Verbose class names
- Learning curve for utility classes
- Requires build step

---

## 18. Future Enhancements

### 18.1 Short-Term (3-6 months)

1. **WebSocket Integration**
   - Replace polling with Socket.io
   - Real-time bidirectional communication
   - Reduced server load

2. **Automated Unit Dispatch**
   - AI-powered nearest unit selection
   - Traffic-aware routing
   - Automatic assignment

3. **Push Notifications**
   - Browser push notifications
   - SMS alerts (Twilio)
   - Email notifications

4. **Enhanced Security**
   - Rate limiting
   - CSRF protection
   - httpOnly cookies
   - Audit logging

5. **Testing Suite**
   - Unit tests (Jest)
   - Integration tests (Supertest)
   - E2E tests (Playwright)

### 18.2 Medium-Term (6-12 months)

1. **Mobile Applications**
   - React Native apps (iOS/Android)
   - Offline capability
   - Native push notifications

2. **Advanced AI Features**
   - NLP chatbot for triage
   - Predictive analytics
   - Resource demand forecasting

3. **EHR Integration**
   - FHIR API integration
   - Patient medical history
   - Prescription management

4. **Payment Integration**
   - Stripe/PayPal integration
   - Insurance claim processing
   - Billing dashboard

5. **Multi-Language Support**
   - i18n implementation
   - RTL language support
   - Localized content

### 18.3 Long-Term (12+ months)

1. **Microservices Architecture**
   - Decompose monolith
   - Service mesh (Istio)
   - Event-driven architecture

2. **Multi-Region Deployment**
   - Geographic distribution
   - Data residency compliance
   - CDN integration

3. **Compliance Certification**
   - HIPAA compliance
   - FDA approval process
   - GDPR compliance
   - ISO 27001 certification

4. **Advanced Analytics**
   - Business intelligence dashboard
   - Predictive modeling
   - Performance benchmarking

5. **IoT Integration**
   - Wearable device integration
   - Ambulance telemetry
   - Smart hospital equipment

---

## 19. Conclusion

### 19.1 System Summary

LifeLink AI is a three-tier web application built with modern technologies (React, Express, MongoDB) that provides emergency coordination and healthcare response capabilities. The system implements role-based access control, real-time updates via polling, and geospatial queries for location-based features.

### 19.2 Key Strengths

- **Modular Architecture:** Clear separation of concerns
- **Type Safety:** TypeScript across frontend and backend
- **Geospatial Capabilities:** MongoDB 2dsphere indexes for location queries
- **Security Foundation:** JWT authentication, password hashing, security headers
- **Extensible Design:** AI service integration points for future enhancements

### 19.3 Key Limitations

- **Prototype Status:** Not production-ready for clinical use
- **Single Server:** No horizontal scaling or high availability
- **Polling-Based:** 3-second latency in real-time updates
- **Limited Testing:** No automated test suite
- **Compliance Gaps:** Not HIPAA, FDA, or GDPR compliant

### 19.4 Production Readiness Checklist

Before production deployment, the following must be addressed:

- [ ] Implement WebSocket for real-time updates
- [ ] Add comprehensive test suite (unit, integration, E2E)
- [ ] Implement rate limiting and CSRF protection
- [ ] Set up monitoring and alerting (Prometheus, Grafana)
- [ ] Configure CI/CD pipeline
- [ ] Implement database replication and backups
- [ ] Add audit logging for compliance
- [ ] Conduct security audit and penetration testing
- [ ] Implement data encryption at rest
- [ ] Set up error tracking (Sentry)
- [ ] Configure production CORS and security headers
- [ ] Implement proper session management
- [ ] Add data retention and deletion policies
- [ ] Conduct load testing and performance optimization
- [ ] Obtain necessary compliance certifications

---

**END OF DESIGN DOCUMENT**

