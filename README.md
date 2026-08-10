# Vehicle Rental Management API

A REST API for managing a vehicle rental fleet. Staff log in via JWT, manage vehicles (with photo uploads), create/update rentals with automatic overlap detection, and generate prorated monthly reports.

## Tech Stack

- **Runtime**: Node.js + TypeScript (OOP structure)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Query Builder**: Knex (with raw SQL)
- **Validation**: Joi
- **Authentication**: JWT (jsonwebtoken + bcrypt)
- **File Uploads**: Multer (local disk storage)
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Vehicle_Rental_Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vehicle_rental
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
UPLOAD_PATH=uploads
```

### 4. Create the database

```bash
createdb vehicle_rental
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Seed the database

```bash
npm run seed
```

This seeds:
- 1 staff member: `admin@rental.com` / `password123`
- 3 vehicles: Toyota Camry ($50/day), Ford Explorer ($85/day), Mercedes Sprinter ($120/day)
- 4 rentals including one spanning July 29 – Aug 3 (for report testing)

### 7. Start the server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm run build
npm start
```

### 8. Postman API Documentation
You can find the pre-configured Postman Collection and API request examples online:
* Online Documentation: [Postman API Documentation](https://documenter.getpostman.com/view/27468363/2sBY4WnGae)

**How to use:**
1. Open the [Postman API Documentation](https://documenter.getpostman.com/view/27468363/2sBY4WnGae) link.
2. Click **Run in Postman** (or fork/import the collection) to import the API requests directly into your local Postman app.
3. The collection is pre-configured with two variables:
   * `base_url`: `http://localhost:5000/api/v1` (adjust the port if you change your `.env` port).
   * `token`: Your JWT token.
4. Go to the **Login** request (`POST /auth/login`), send the request with the seeded credentials (`admin@rental.com` / `password123`), copy the returned `token` value, and paste it into the Collection's **Variables** tab under `token` (or set it as an active environment variable).
5. All other requests in the collection are pre-configured to automatically inherit this token in their authentication headers.

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint       | Description          | Auth |
|--------|---------------|----------------------|------|
| POST   | `/auth/login` | Login → returns JWT  | No   |

### Vehicles

| Method | Endpoint        | Description                         | Auth |
|--------|----------------|-------------------------------------|------|
| GET    | `/vehicles`    | List (paginated, filter, search)    | Yes  |
| GET    | `/vehicles/:id`| Get single vehicle                  | Yes  |
| POST   | `/vehicles`    | Create (multipart with photo)       | Yes  |
| PUT    | `/vehicles/:id`| Update (with photo replacement)     | Yes  |
| DELETE | `/vehicles/:id`| Soft delete                         | Yes  |

**Query params** for `GET /vehicles`:
- `category` — filter by category
- `search` — search by vehicle name (case-insensitive)
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)

### Rentals

| Method | Endpoint        | Description                         | Auth |
|--------|----------------|-------------------------------------|------|
| GET    | `/rentals`     | List (filtered, paginated)          | Yes  |
| GET    | `/rentals/:id` | Get single rental                   | Yes  |
| POST   | `/rentals`     | Create (with overlap check, 409)    | Yes  |
| PUT    | `/rentals/:id` | Update (re-checks overlap on dates) | Yes  |
| DELETE | `/rentals/:id` | Delete rental                       | Yes  |

**Query params** for `GET /rentals`:
- `vehicle_id` — filter by vehicle
- `status` — filter by status (booked/ongoing/completed/cancelled)
- `start_date` — filter rentals starting on or after this date
- `end_date` — filter rentals ending on or before this date
- `page`, `limit` — pagination

### Reports

| Method | Endpoint            | Description                | Auth |
|--------|--------------------|----|------|
| GET    | `/reports/rentals` | Monthly rental report      | Yes  |

**Query params**:
- `month` (required) — `YYYY-MM` format
- `vehicle_id` (optional) — filter to a specific vehicle

## Key Business Logic

### Overlap Detection

Two date ranges `[A, B]` and `[C, D]` overlap if and only if `A ≤ D AND C ≤ B`.

The overlap check query:
```sql
SELECT id FROM rentals
WHERE vehicle_id = ?
  AND id != ?                  -- exclude the rental being updated
  AND status != 'cancelled'    -- cancelled rentals don't block
  AND start_date <= ?          -- existing.start <= new.end
  AND end_date >= ?            -- existing.end >= new.start
```

This runs inside a **transaction** on both create and update, so two simultaneous bookings can't both succeed (bonus requirement).

### Prorated Monthly Report

A rental running July 29 – Aug 3 contributes **3 days** to the August report (Aug 1–3), not 6.

The report clips each rental to the month window:
```sql
effective_start = GREATEST(start_date, month_first_day)
effective_end   = LEAST(end_date, month_last_day)
days_in_month   = effective_end - effective_start + 1
revenue         = days_in_month × daily_rate
```

The response also identifies the vehicle with the highest revenue that month.

## Available Scripts

| Script               | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start dev server with hot-reload   |
| `npm run build`     | Compile TypeScript to `dist/`      |
| `npm start`         | Run compiled production build      |
| `npm run migrate`   | Run all pending migrations         |
| `npm run migrate:rollback` | Rollback last migration batch |
| `npm run seed`      | Run seed files                     |
| `npm run lint`      | Run ESLint                         |
| `npm run format`    | Format code with Prettier          |

## Project Structure

```
src/
├── app.ts                              # Express app setup
├── server.ts                           # Entry point
├── config/
│   └── index.ts                        # Env config
├── app/
│   ├── db/
│   │   ├── connection.ts               # Knex singleton
│   │   ├── migrations/                 # Raw SQL migrations
│   │   └── seeds/                      # Data seeds
│   ├── middlewares/
│   │   ├── auth.ts                     # JWT auth middleware
│   │   ├── globalErrorHandler.ts       # PG/Joi/Multer error handler
│   │   ├── validateRequest.ts          # Joi validation factory
│   │   └── upload.ts                   # Multer disk storage
│   ├── modules/
│   │   ├── Auth/                       # Login, JWT, bcrypt
│   │   ├── Vehicle/                    # CRUD + soft delete + photo
│   │   ├── Rental/                     # Overlap check + transactions
│   │   └── Report/                     # Prorated monthly report
│   └── routes/
│       └── index.ts                    # Central moduleRoutes array
├── errors/
│   └── ApiErrors.ts                    # Custom error class
├── helpars/
│   └── jwtHelpers.ts                   # JWT sign/verify helpers
├── interfaces/
│   ├── common.ts                       # IJwtPayload, IPaginatedResult
│   └── index.d.ts                      # Express Request augmentation
└── shared/
    ├── catchAsync.ts                   # Async error wrapper
    ├── sendResponse.ts                 # Standardised response
    └── pick.ts                         # Object key picker
```
