# Zorvyn Backend Assignment

## Overview

This project is a backend system for managing user-based financial transactions with role-based access control and analytical dashboards.

The system is designed to simulate a fintech-style backend where different user roles interact with financial data at different levels of access. It supports secure data handling, structured APIs, and aggregated insights for decision-making.

---

## Tech Stack

- Runtime: Node.js  
- Framework: Express.js (ES Modules)  
- Database: PostgreSQL  
- ORM: Prisma (v7)  
- Authentication: JWT
- Validation: Zod  
- Testing: Jest + Supertest  
- Security: Helmet, Rate Limiting  
- Logging: Morgan  

---

## System Design

The backend follows a feature-based modular architecture with clear separation of concerns:

<!-- //! Folder Structure HERE -->



Each feature contains:
- routes
- controller
- service
- validation

### Design Principles

- Controllers handle request/response  
- Services contain business logic  
- Middleware handles cross-cutting concerns  
- Prisma manages data persistence  
- Validation happens before reaching business logic  

---

## Core Features

### 1. User & Role Management

The system supports three roles:

| Role     | Permissions |
|----------|------------|
| Viewer   | View dashboard only |
| Analyst  | View all records + analytics |
| Admin    | Full control (users + records) |

Role enforcement is handled via middleware.

---

### 2. Financial Records

Each record represents a financial transaction:

- amount  
- type (income / expense)  
- category  
- date  
- notes  
- userId  
- soft delete flag  

#### Supported Operations

- Create (Admin)  
- Read (Viewer: own, Analyst: all)  
- Update (Admin)  
- Delete (Admin, soft delete)  
- Filtering, search, pagination  

---

### 3. Dashboard & Analytics

The system provides aggregated insights:

#### Summary
- total income  
- total expenses  
- net balance  

#### Category Breakdown
- grouped totals per category  

#### Trends
- monthly income vs expense  

#### Recent Activity
- latest transactions  

#### Role-based behavior

| Role     | Scope |
|----------|------|
| Viewer   | Own data |
| Analyst  | All users (grouped) |
| Admin    | Same as analyst |

---

### 4. Access Control (RBAC + Ownership)

Two layers of protection:

#### Role-Based Access
Controls what actions are allowed.

#### Ownership Enforcement
Controls which data can be accessed.

Examples:
- Viewer cannot access `/records`  
- Analyst cannot modify data  
- Admin can modify any record  
- Users cannot access other users’ records  

---

### 5. Validation & Error Handling

#### Validation

- Zod schemas for body and params  
- UUID validation for IDs  
- ISO date validation  

#### Error Handling

Centralized error middleware provides:

| Error Type | Status |
|-----------|--------|
| Validation | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not Found | 404 |
| Duplicate | 409 |
| Server Error | 500 |

---

### 6. Data Persistence

- PostgreSQL used as relational database  
- Prisma ORM for schema and queries  
- Soft delete implemented using `isDeleted`  

---

### 7. Security Features

- JWT authentication  
- Password hashing (bcrypt)  
- Rate limiting (global + auth-specific)  
- Helmet for headers  
- Input validation  
- Role enforcement  

---

## API Endpoints

### Auth
POST /api/v1/auth/register

POST /api/v1/auth/login

GET /api/v1/auth/google



---

### Records
GET /api/v1/records

GET /api/v1/records/:id

GET /api/v1/records/user/:userId

POST /api/v1/records

PUT /api/v1/records/:id

DELETE /api/v1/records/:id


---

### Dashboard
GET /api/v1/dashboard/summary

GET /api/v1/dashboard/categories

GET /api/v1/dashboard/trends

GET /api/v1/dashboard/user/:userId/summary

GET /api/v1/dashboard/user/:userId/categories

GET /api/v1/dashboard/user/:userId/trends

GET /api/v1/dashboard/user/:userId/recent


---

## Testing

Testing is done using Jest and Supertest.

### Coverage includes:

- Authentication flow  
- RBAC enforcement  
- Record CRUD  
- Ownership checks  
- Soft delete behavior  
- Dashboard correctness  
- Validation errors  
- Unauthorized access  

### Test Strategy

- Database reset before tests  
- Role assignment via Prisma  
- Real API calls (integration testing)  

---

## Setup Instructions

### 1. Install dependencies
npm install


---

### 2. Configure environment

Create `.env`:

DATABASE_URL=postgresql://user:password@localhost:5432/db

JWT_SECRET=your_secret



---

### 3. Run migrations
npx prisma migrate dev


---

### 4. Start server
npm run dev

---

### 5. Run tests
npm test




---

## Database Design

### User

- id  
- email  
- password  
- role  
- isActive  

### Record

- id  
- userId  
- amount  
- type  
- category  
- date  
- notes  
- isDeleted  

### Design Decisions

- Normalized relational model  
- One-to-many (User → Records)  
- Soft delete instead of hard delete  
- Efficient aggregation support  

---

## Assumptions

- Admin is responsible for creating financial records  
- Viewer does not create data  
- Analyst is read-only across users  
- Each user’s financial data is isolated  
- Aggregations are computed at DB level  

---

## Tradeoffs

### Prisma groupBy vs raw SQL
Used both approaches:
- groupBy for simple aggregations  
- raw SQL for trends  

### Role logic in service layer
Keeps controllers clean and centralizes business rules.

### Soft delete
Prevents data loss but adds query overhead.

---

## Final Notes

This backend demonstrates:

- secure API design  
- multi-user data isolation  
- role-based access control  
- production-oriented backend architecture  