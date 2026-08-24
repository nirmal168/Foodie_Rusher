give me readme file
3:26 PM


markdown


# Foodie Rusher
A professional‑grade, real‑time food delivery application featuring smart routing, staff hiring/assignment, dynamic AI services, and Razorpay/COD checkouts.
## Project Overview
Foodie Rusher is a full‑stack food‑ordering platform that allows customers to browse nearby restaurants, place orders, and track delivery in real time. The system features a unified Express & React frontend/backend deployment, driver assignment logic, a comprehensive loyalty wallet, and a Python Flask AI microservice for recommendation engines and demand forecasting.
## Key Features
- **Smart Routing & Real‑time Tracking** – Streams driver location coordinates using Socket.io and Leaflet.js maps.
- **AI Microservice Integration** – Dynamic pricing models, GRU demand forecasting, and a hybrid food recommendation system built on scikit-learn.
- **Unified Deployment Architecture** – Express 5 wildcard routing mounts React compiled distribution folders to serve the entire app from a single service port.
- **Staff Hiring & Assignment** – Shop Owners can recruit delivery staff and assign pending order deliveries.
- **Payment & Promotion Engine** – Integrated Razorpay payments, COD support, promotional discount codes, and user-to-user referral credits.
- **Wallet Loyalty Program** – Users accumulate balance through referrals and coupon redemptions to pay for orders.
---
## Directory Structure
Foodie_Rusher/ ├── Dockerfile # Multi-stage container configuration ├── docker-compose.yml # Local environment orchestrator ├── package.json # Root workspace script manager │ ├── backend/ # Node.js API Service │ ├── ai_services/ # Python Flask AI Microservice │ │ ├── ai_services/ │ │ │ ├── app.py # Flask API entry point │ │ │ └── *.py # Machine learning models (GRU, Scikit-learn) │ │ └── requirements.txt │ ├── src/ │ │ ├── config/ # DB connection setups │ │ ├── middleware/ # Auth validation handlers │ │ ├── models/ # Mongoose schemas │ │ ├── routes/ # API endpoint definitions │ │ ├── sockets/ # Socket.IO event handler scripts │ │ └── server.js # Main API & frontend static router │ └── scripts/ # DB seed controllers │ └── frontend/ # React Client SPA ├── src/ │ ├── components/ # UI elements & AI Chat interfaces │ ├── context/ # React Context (Auth, Socket, Location) │ ├── pages/ # Views (Landing, Auth, Cart, Profile) │ ├── App.jsx # Routes and role-based guards │ ├── config.js # Relative API config wrapper │ └── main.jsx # React app client bootloader



---
## Setup & Running
### 1. Install Dependencies
Install all workspace, frontend, and backend packages using a single command:
```bash
npm run install:all
2. Configure Environment
Set up your connection strings and keys by updating backend/.env (using backend/.env.example as a template):

env


PORT=5000
MONGO_URI=mongodb://your-db-uri
JWT_SECRET=your-secret
EMAIL=your-gmail@gmail.com
PASS=your-gmail-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
3. Seed the Database
To populate location and mock test user/order data:

bash


# Seed Gujarat location data
npm run seed:locations
# Seed sample Owner, Staff, and Customer users (default password: password123)
npm run seed:test
4. Start the Application
Run both the frontend and backend servers concurrently:

bash


npm run dev
Backend API Server: http://localhost:5000
Frontend App: http://localhost:5173
AI Microservice: http://localhost:5002
Technical Stack
Backend: Node.js 20+, Express 5 (wildcard routing syntax compatible), MongoDB/Mongoose 9, Socket.io, JWT
Frontend: React 18, Vite, Tailwind CSS 4.0, Framer Motion, Leaflet.js
AI Microservice: Python 3.10+, Flask, scikit-learn, pandas, NumPy, (optional TensorFlow for GRU)
Payments: Razorpay SDK, COD handlers, Internal Wallet transactions
Cloud Infrastructure: Cloudinary (CDN Image store), Nodemailer (Gmail SMTP OTP)
Architecture Overview
The system follows a micro-service separation within a monorepo structure:

API Layer – Express routes in backend/src/routes process inputs and interact with Mongoose schemas.
Real-time Layer – Socket.io server handles dynamic map rooms (join-order) and streams location coordinates.
AI Service Layer – Separated Flask container running scikit-learn matching models and dynamic pricing math helpers.
Unified Client Layer – Express static middleware loads Compiled React build bundles directly under the / directory using custom catch-all wildcard rules (app.get('*any')).
API Endpoints Summary
Method	Path	Description	Authentication
POST	/auth/register	Register new user	Public
POST	/auth/login	User login, returns JWT	Public
POST	/auth/forgot-password	Send verification OTP to email	Public
GET	/api/shop	List all restaurants	Public
POST	/api/shop	Create a new shop	Owner Only
GET	/api/item	Get menu items by Shop ID	Public
POST	/api/item	Add a new menu item	Owner Only
POST	/orders	Create a new order	Authenticated
PUT	/orders/:id/status	Update order status	Owner/Staff
POST	/create-razorpay-order	Initialize checkout intent	Authenticated
GET	/api/notifications	Get user notifications	Authenticated
Database Schema Overview
User: { name, email, passwordHash, role: customer|owner|staff, location, walletBalance, referralCode, referredBy }
Shop: { name, owner, description, address, image, isOpen, location: { lat, lng } }
Item: { shop, name, price, description, image, isAvailable, isVeg }
Order: { customer, shop, items: [ { name, price, quantity } ], total, status, paymentMethod, assignedStaff }
Referral: { code, ownerId, usedBy: [], expiresAt }
PromoCode: { code, discountType, value, usageLimit, expiresAt }
Deployment Instructions
Unified Render Deployment (Docker)
Create Web Service on Render and link your Repository.
Set the Environment/Language runtime to Docker.
Leave "Root Directory" blank (.) to enable the multi-stage root Docker build.
Input all target environment variables (listed under Setup) in Render's configuration panel and deploy.
Docker Compose Local Setup
yaml


version: "3.8"
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
  ai-service:
    build: ./backend/ai_services
    ports:
      - "5002:5002"
Performance Benchmarks & Testing
Load Test: sustained concurrency benchmarks handle standard load placement in <200ms average response latency.
Unit Tests: Test files are supported locally with mocha/jest runners.
Fallback Algorithms: Python AI endpoints fallback automatically to fast mathematical heuristics if optional deep learning layers (TensorFlow) are absent.
