# Number Discussions

A full-stack application where people communicate through numbers. Users can start "discussions" by choosing a starting number, and anyone can respond by choosing an operation and a number, creating chains of calculations like comment trees in social networks.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Testing**: Vitest with coverage
- **Containerization**: Docker Compose

## Features

- 👁️ View all calculation trees without authentication
- 📝 Register/Login with username and password
- 🔢 Start new discussions with a starting number
- ➕➖✖️➗ Add operations (add, subtract, multiply, divide) to any number
- 🌲 Nested tree display of all calculations
- 🔄 Real-time updates after each operation
- ✅ Unit tests with coverage reports

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Tests

```bash
cd backend
npm test              # Run tests
npm run test:coverage # Run tests with coverage report
```

### Frontend Tests

```bash
cd frontend
npm test              # Run tests
npm run test:coverage # Run tests with coverage report
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Set environment variable: `VITE_API_URL=https://your-backend-url/api`
4. Deploy

### Backend (Render/Railway)

1. Create a new Web Service
2. Set the root directory to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables:
   - `JWT_SECRET=your-secure-secret`
   - `PORT=3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Calculations

- `GET /api/calculations` - Get all calculation trees
- `POST /api/calculations/start` - Create starting number (auth required)
- `POST /api/calculations/operate` - Add operation (auth required)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── db/          # Database setup
│   │   ├── middleware/  # Auth middleware
│   │   ├── routes/      # API routes
│   │   ├── types/       # TypeScript types
│   │   ├── api.test.ts  # Backend tests
│   │   └── index.ts     # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (with tests)
│   │   ├── context/     # Auth context
│   │   ├── services/    # API service
│   │   ├── types/       # TypeScript types
│   │   ├── test/        # Test setup
│   │   └── App.tsx      # Main app
│   └── package.json
└── docker-compose.yml
```

## Business Scenarios Covered

1. ✅ Unregistered users can see the tree of all user posts
2. ✅ Unregistered users can create an account with username/password
3. ✅ Users can authenticate and become registered
4. ✅ Registered users can start a chain by publishing a starting number
5. ✅ Registered users can add operations on any number
6. ✅ Registered users can respond to any calculations
