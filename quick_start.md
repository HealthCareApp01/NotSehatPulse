# Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- Cohere API Key (for AI features)
- Razorpay API Keys (for payments)

## Local Development (With Docker)

1. **Clone the repository** (if not already there).
2. **Setup Environment Variables**:
   ```bash
   cp .env.sample .env
   # Fill in your API keys in the generated .env file
   ```
3. **Spin up the containers**:
   ```bash
   docker-compose up --build
   ```
4. **Access the app**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Manual Setup (Without Docker)

### Backend
1. `cd server`
2. `npm install`
3. `npm start`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`

## Testing
Isolated test scripts are available in the `/test` directory.
Example: `node test/llm-test.js`
