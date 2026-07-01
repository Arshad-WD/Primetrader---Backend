# Primetrader.ai Full-Stack Internship Assignment

A scalable REST API build with **Node.js, Express, and PostgreSQL** incorporating JWT authentication and Role-Based Access Control (RBAC), alongside a custom **React + Vite** Web3/trading platform-themed dashboard frontend.

---

## Tech Stack Overview

- **Backend Runtime & Server**: Node.js + Express.js
- **Database**: PostgreSQL (Neon Serverless Pool connection)
- **Session Authentication**: JWT (JSON Web Tokens) with custom headers
- **Cryptography & Security**: bcryptjs for passwords, Helmet HTTP headers, Rate Limiting middleware
- **API Documentation**: Auto-generated Swagger (OpenAPI 3.0) via routes annotations
- **Frontend Client**: React.js (Vite) + Axios for request intercepting
- **Theme/Design**: High-fidelity dark glassmorphic trading platform aesthetics (custom designed, no template placeholders)

---

## Project Structure

```text
primetrader-assignment/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection pool, Swagger options
│   │   ├── controllers/    # Route handler controllers (business logic)
│   │   ├── middleware/     # Auth checks, error handling, rate limiting
│   │   ├── models/         # DAO query models (User, Task)
│   │   ├── routes/
│   │   │   └── v1/         # Versioned API routes with Swagger annotations
│   │   └── app.js          # Express app configurations
│   ├── .env                # App environment variables (port, db connection)
│   ├── server.js           # Server startup script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with request headers interceptor
│   │   ├── context/        # Global AuthContext provider state
│   │   ├── App.jsx         # Custom Web3 styled trading dashboard and Auth forms
│   │   ├── App.css         # Styling for layout, grid, components & indicators
│   │   ├── index.css       # Clean layout reset and typography loader
│   │   └── main.jsx
│   └── package.json
└── README.md               # Deliverable documentation & Scalability Note
```

---

## Setup & Running Locally

### Prerequisites
- Node.js installed (v16+)
- A PostgreSQL connection string (configured automatically inside `backend/.env` utilizing the Neon pooler link provided)

### Step 1: Run the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the development server (auto-creates tables if they are missing):
   ```bash
   npm run dev
   ```
4. Access the auto-generated Swagger interactive documentation:
   - Open: `http://localhost:5000/api-docs` or `http://localhost:5000/`

### Step 2: Run the Frontend
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the application:
   - Go to: `http://localhost:5173/`

---

## Key Features Implemented

1. **Authentication Flows**: Secure registration & login endpoints using 10 salt-rounds bcrypt hashing.
2. **Stateless Sessions**: Issuing JWT tokens upon authentication, stored securely, and automatically appended by Axios interceptors for authenticated API actions.
3. **Role-Based Access Control (RBAC)**:
   - **`user` role**: Can view, edit, or delete *only their owned* tasks.
   - **`admin` role**: Can view, edit, or delete *any* task across all developers, including viewing the original task owner information.
4. **Security Controls**:
   - `helmet` integration to configure secure HTTP response headers.
   - `express-rate-limit` configuration restricting spam requests to 100 queries per 15 minutes window.
5. **Interactive Docs**: Swagger UI serving active route definitions, inputs, parameters, and responses.

---

## API Endpoints Reference

| Route | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public | Registers user credentials and returns user payload + JWT |
| `/api/v1/auth/login` | `POST` | Public | Auths email/password and returns user payload + JWT |
| `/api/v1/task` | `GET` | User/Admin | Fetches own tasks (`user`) or all tasks (`admin`) |
| `/api/v1/task` | `POST` | User/Admin | Creates a task and attaches current user as owner |
| `/api/v1/task/:id` | `PUT` | Owner/Admin | Updates task title, status, description or priority |
| `/api/v1/task/:id` | `DELETE` | Owner/Admin | Deletes task from database |
| `/api-docs` | `GET` | Public | Serves Swagger OpenAPI UI |

---

## Scalability & Production Readiness Note

To transition this system into a high-availability, enterprise-scale production platform serving thousands of requests, we suggest implementing the following architectural paradigms:

### 1. Transitioning to Microservices
- **Auth Service**: Isolate registration, authorization checks, and JWT token verification into a specialized auth microservice. It handles credentials checking, blacklisting tokens, and is horizontally autoscaled due to heavy load.
- **Task/Entity Service**: Operates independently, using a stateless architecture that relies on validating JWT tokens decryptable using a shared JWKS (JSON Web Key Set) or public key.
- **API Gateway**: Set up an API Gateway (such as Kong, Apigee, or NGINX) as the single entry point. The gateway handles SSL termination, rate-limiting, request validation, logging, and routing requests dynamically to target microservices.

### 2. Performance Caching (Redis)
- **Read-Heavy Optimization**: Utilize a Redis cache layer for the read operations on tasks.
  - When a user fetches their list of tasks, return the cached array from Redis (reducing query latencies to < 5ms).
  - Use a cache-invalidation policy (Write-Through or Cache-Eviction): clear/refresh the specific user's task cache on mutating actions (`CREATE`, `UPDATE`, `DELETE`).

### 3. PostgreSQL Scaling (Neon/AWS RDS)
- **Primary-Replica Model**: Separate read and write queries. Direct writes (`INSERT`, `UPDATE`, `DELETE`) to the primary database server, and distribute read operations across read-replicas.
- **Connection Pooling**: Pgbouncer (pre-configured via Neon connection poolers) keeps database connection overhead minimal, allowing thousands of simultaneous Node.js server instances to run without exhausting database connection handles.

### 4. Containerization & Orchestration
- **Dockerization**: Bundle backend and frontend applications inside lightweight container images (Dockerfile config).
- **Orchestration (Kubernetes/ECS)**: Use Kubernetes (EKS/GKE) to scale instances up/down dynamically based on resource usage (CPU/Memory thresholds) and automatically balance network traffic.
