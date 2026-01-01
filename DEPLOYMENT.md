# Number Discussions - Deployment Guide

## Option 1: Docker (Recommended for VPS/Cloud)

### Prerequisites

- Docker and Docker Compose installed
- Server with ports 80 and 3001 available

### Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Task-2
   ```

2. **Set environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and change JWT_SECRET
   ```

3. **Build and run**

   ```bash
   docker-compose up -d --build
   ```

4. **Access the app**

   - Frontend: http://your-server-ip
   - Backend API: http://your-server-ip:3001/api

5. **View logs**

   ```bash
   docker-compose logs -f
   ```

6. **Stop the app**
   ```bash
   docker-compose down
   ```

---

## Option 2: Render (Free Tier)

### Backend on Render

1. Go to [Render.com](https://render.com) and create account
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `number-discussions-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:
   - `JWT_SECRET`: `your-secret-key-here`
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**
7. Copy the service URL (e.g., `https://number-discussions-api.onrender.com`)

### Frontend on Render

1. Click **New +** → **Static Site**
2. Connect same repository
3. Configure:
   - **Name**: `number-discussions-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://number-discussions-api.onrender.com/api`
5. Click **Create Static Site**

---

## Option 3: Vercel (Frontend) + Render (Backend)

### Backend on Render

Follow steps above for Backend on Render

### Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
5. Deploy

---

## Option 4: Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add two services:
   - **Backend**: Root directory `backend`, start command `npm start`
   - **Frontend**: Root directory `frontend`, start command `npm run preview`
4. Configure environment variables for each service
5. Deploy

---

## Option 5: DigitalOcean App Platform

1. Go to DigitalOcean → App Platform
2. Create new app from GitHub
3. Detect and configure both services automatically
4. Set environment variables
5. Deploy

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure database backups
- [ ] Set up monitoring/logging
- [ ] Add rate limiting
- [ ] Enable compression (gzip)

---

## Local Production Test

```bash
# Copy and edit env file
cp .env.example .env

# Build and run with Docker
docker-compose up --build

# Access at http://localhost
```

---

## Environment Variables

### Backend

- `JWT_SECRET`: Secret key for JWT tokens (required)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (production/development)

### Frontend

- `VITE_API_URL`: Backend API URL (e.g., http://localhost:3001/api)

---

## Troubleshooting

### Docker Issues

- Check logs: `docker-compose logs -f`
- Rebuild: `docker-compose up --build --force-recreate`
- Clean: `docker-compose down -v`

### API Connection Issues

- Ensure `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running: `curl http://localhost:3001/api/health`

### Database Issues

- SQLite data is stored in Docker volume `backend-data`
- To reset: `docker-compose down -v`
