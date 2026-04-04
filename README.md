# Finance Data Processing and Access Control Backend

A Node.js + Express backend for managing users, role-based permissions, financial records, and dashboard analytics. Uses SQLite for data persistence and JWTs for authentication.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Tested-Jest-red?style=for-the-badge&logo=jest" />
</p>

## 📁 Project Structure

```bash
finance-backend/
│
├── node_modules/              # Project dependencies (ignored in Git)
│
├── src/                       # Main source code
│   │
│   ├── controllers/           # Business logic layer
│   │   ├── dashboard.js       # Dashboard analytics logic
│   │   ├── records.js         # Financial records operations
│   │   └── users.js           # User management logic
│   │
│   ├── middleware/            # Custom middleware
│   │   ├── access.js          # Role-based access control
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Centralized error handling
│   │   └── rateLimit.js       # API rate limiting
│   │
│   ├── models/                # Database models
│   │   ├── record.js          # Financial record schema
│   │   └── user.js            # User schema
│   │
│   ├── routes/                # API route definitions
│   │   ├── dashboard.js       # Dashboard routes
│   │   ├── records.js         # Record routes
│   │   └── users.js           # User routes
│   │
│   ├── tests/                 # Unit & integration tests
│   │   ├── records.test.js    # Record API tests
│   │   └── users.test.js      # User API tests
│   │
│   ├── utils/                 # Utility/helper functions
│   │   ├── validation.js      # 
│   │
│   ├── app.js                 # Express app entry point
│   ├── db.js                  # Database connection & setup
│   └── add-user.js            # Seed script to create initial user
├── add-user.js                # Seed script to create initial user
├── finance.db                 # SQLite database (ignored in Git)
├── test.db                    # Test database (ignored in Git)
├── jest.config.js             # Jest configuration (CommonJS)
├── jest.config.mjs            # Jest configuration (ESM)
├── openapi.yaml               # API documentation (Swagger/OpenAPI)
├── package.json               # Project metadata & dependencies
├── package-lock.json          # Dependency lock file
├── README.md                  # Project documentation
└── .gitignore                 # Ignored files configuration
```

---

### 🧠 Structure Highlights

* **Modular Architecture** → Clean separation of concerns
* **Scalable Design** → Easy to extend features
* **Production Ready** → Middleware, testing, and docs included
* **Developer Friendly** → Clear folder naming & organization

---


## Features
- Authentication with JWTs
- Role-based authorization for `admin`, `analyst`, and `viewer`
- User management and soft deletes
- Financial records CRUD with filtering, pagination, and soft delete
- Dashboard summary endpoint for analytics
- Centralized error handling and rate limiting

## Prerequisites
- Node.js v16 or higher
- npm

## Setup
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with demo users:
   ```bash
   node add-user.js
   ```

### Demo users created by `add-user.js`
- `admin` / `admin123` — admin
- `analyst` / `analyst123` — analyst
- `viewer` / `viewer123` — viewer
- `gulshan` / `gullu567` — admin

## Environment Variables
The application supports the following optional environment variables:
- `PORT` — HTTP port to listen on (default: `3000`)
- `JWT_SECRET` — secret used to sign JWT tokens (default: `changeme-secret`)

> For production use, always set `JWT_SECRET`, and do not use the default value.

## Running the Application
Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server listens on `http://localhost:3000` by default.

## Testing
Run the Jest test suite:
```bash
npm test
```

## API Reference

### Authentication
- `POST /api/users/login`
  - Request body: `{ "username": "...", "password": "..." }`
  - Returns: `{ message, token }`
  - Token expiration: 2 hours

### Authorization
- Send the JWT using the `Authorization` header:
  - `Authorization: Bearer <token>`
- Protected routes require a valid token and active user status.

### Role access matrix
- `admin` — manage users, create/update/delete records, and read dashboard summary
- `analyst` — list users, list/create/update records, and read dashboard summary
- `viewer` — read dashboard summary only

### Users
- `GET /api/users`
  - Roles allowed: `admin`, `analyst`
  - Returns list of users with `id`, `username`, `role`, and `status`
- `POST /api/users`
  - Role allowed: `admin`
  - Request body: `{ "username", "password", "role" }`
- `PUT /api/users/:id`
  - Role allowed: `admin`
  - Request body may include `password`, `role`, `status`
- `DELETE /api/users/:id`
  - Role allowed: `admin`

### Records
- `GET /api/records`
  - Roles allowed: `admin`, `analyst`
  - Query params: `limit`, `offset`, `type`, `category`, `date`, `search`
  - Returns: `{ records, total }`
- `POST /api/records`
  - Role allowed: `admin`
  - Request body: `{ "amount", "type", "category", "date", "notes" }`
- `PUT /api/records/:id`
  - Role allowed: `admin`
  - Request body: `{ "amount", "type", "category", "date", "notes" }`
- `DELETE /api/records/:id`
  - Role allowed: `admin`
  - Performs a soft delete by setting `deleted = 1`

### Dashboard
- `GET /api/dashboard/summary`
  - Roles allowed: `admin`, `analyst`, `viewer`
  - Returns a summary analytics payload for dashboard use

## Example Requests
Login and call a protected endpoint:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Architecture Overview
- `src/app.js` — application entrypoint, middleware wiring, route registration, and server start
- `src/db.js` — SQLite database initialization and helper exports
- `src/routes/` — Express routers for users, records, and dashboard endpoints
- `src/controllers/` — business logic for CRUD operations and response handling
- `src/middleware/` — authentication, authorization, rate limiting, and error management
- `src/utils/validation.js` — request validation helpers
- `tests/` — automated endpoint tests

## Implementation Notes
- User authentication is token-based using JWTs
- Requests are globally rate-limited via middleware
- Protected routes require both authentication and active user status
- Record deletion is implemented as a soft delete (`deleted` flag)
- User passwords are stored as plain text in this prototype

## Assumptions & Tradeoffs
- SQLite is used for simplicity and local development rather than production-scale storage
- Password hashing is not implemented; this is a prototype-level tradeoff and should be improved before production
- JWT secret defaults to a hardcoded value for convenience, but production must override it
- Role-based access is enforced using middleware; adding richer policies would be the next step
- The API is designed as a minimal backend demo rather than a fully hardened financial system

## Additional Thoughtfulness
- `add-user.js` seeds demo user accounts for easy validation of role behavior
- `openapi.yaml` is included as a starting point for API specification and documentation
- `tests/` contains Jest coverage for core endpoint behavior and authorization flows

---

**Assignment by Zorvyn**
