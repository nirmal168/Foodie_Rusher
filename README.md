🍔 Foodie Rusher

A full-stack food delivery and management platform with real-time order tracking, interactive maps, AI-powered services, role-based dashboards, and secure online/COD payments.

🌐 Live Demo: https://foodie-rusher.onrender.com/

✨ Highlights

👤 Role-based dashboards for Customers, Restaurant Owners, and Delivery Staff

📍 Real-time delivery tracking using Socket.IO and interactive maps

🤖 AI-powered food recommendations and demand forecasting

💳 Razorpay + Cash on Delivery checkout

🔐 JWT-based authentication and protected APIs

☁️ Cloudinary image storage

📧 Email/OTP support through SMTP

🐳 Docker-ready deployment

📱 Responsive React UI with modern animations

📸 Screenshots

Add your project screenshots here before publishing the repository. Recommended screenshots: Home Page, Customer Dashboard, Restaurant Dashboard, Delivery Tracking, AI Assistant, and Checkout.

screenshots/
├── home.png
├── customer-dashboard.png
├── restaurant-dashboard.png
├── delivery-tracking.png
├── ai-assistant.png
└── checkout.png

📖 Table of Contents

Quick Start

Key Features

Technical Stack

Project Structure

System Architecture

Environment Configuration

API Overview

Real-Time WebSockets

AI Microservice

Database Schemas

Deployment

Security

Troubleshooting

🚀 Quick Start

Prerequisites

Node.js: 20.x or higher

MongoDB: MongoDB Community Server or MongoDB Atlas

Python: 3.10+ for the AI microservice

Git

1. Clone the repository

git clone https://github.com/nirmal168/Foodie_Rusher.git
cd Foodie_Rusher

2. Install dependencies

npm run install:all

3. Configure environment variables

Create your local environment file from the example:

cp backend/.env.example backend/.env

Then add your own local credentials to backend/.env.

4. Seed local development data

npm run seed:locations
npm run seed:test

⚠️ Seed accounts are intended for local development/testing only. Never publish real passwords, API keys, database credentials, JWT secrets, or payment credentials in GitHub.

5. Start the application

npm run dev

Typical local services:

Service

URL

React Frontend

http://localhost:5173

Express Backend

http://localhost:5000

AI Microservice

http://localhost:5002

✨ Key Features

👤 Multi-Role Dashboard

Customer

Browse nearby restaurants

Search and manage food items

Cart and checkout

Order history and transaction tracking

Referral/wallet functionality

Real-time delivery tracking

Restaurant Owner

Manage restaurant profile

Add, update, and delete menu items

Process incoming orders

View sales information

Delivery Staff

View available deliveries

Accept orders

Update delivery status

Share real-time delivery location

📍 Real-Time Tracking

Socket.IO-based communication

Order-specific rooms

Live delivery location updates

Leaflet.js interactive maps

Real-time order status notifications

💳 Payments & Promotions

Razorpay payment integration

Cash on Delivery

Referral rewards

Wallet balance

Promotional discounts

🤖 AI Services

Personalized food recommendations

Demand forecasting based on historical order data

Dynamic pricing/delivery-fee calculations

Flask-based AI microservice separated from the main API

🛠 Technical Stack

Category

Technologies

Frontend

React 18, Vite, Tailwind CSS 4, Framer Motion, Leaflet.js

Backend

Node.js 20+, Express 5, Socket.IO 4, JWT

Database

MongoDB, Mongoose 9

AI Service

Python 3.10+, Flask, scikit-learn, NumPy, pandas

Payments

Razorpay

Storage

Cloudinary

Email

Nodemailer / SMTP

Deployment

Render, Docker, Docker Compose

📦 Project Structure

Foodie_Rusher/
├── Dockerfile
├── docker-compose.yml
├── package.json
│
├── backend/
│   ├── ai_services/
│   │   ├── app.py
│   │   └── requirements.txt
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.js
│   └── scripts/
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── App.jsx
        ├── config.js
        └── main.jsx

🏗 System Architecture

flowchart TD
    React[React Frontend]
    Express[Express API]
    Socket[Socket.IO Server]
    Flask[Python Flask AI Service]
    Mongo[(MongoDB Atlas)]
    Cloudinary[Cloudinary]
    Razorpay[Razorpay]

    React -->|REST API| Express
    React -->|WebSocket| Socket
    Express -->|AI Requests| Flask
    Flask -->|Model Evaluation| Flask
    Express -->|CRUD| Mongo
    Socket -->|Location / Order Updates| Mongo
    React -->|Image Upload| Cloudinary
    Express -->|Payment| Razorpay

🔐 Environment Configuration

Create backend/.env locally.

Example .env

PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_private_jwt_secret

# Email
EMAIL=your_email
PASS=your_email_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173

🚨 Never commit secrets

Your .env file should never be pushed to GitHub.

Recommended .gitignore entries:

# Environment variables
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build output
dist/
build/

# Python
__pycache__/
*.pyc

# Logs
*.log

Use .env.example with placeholders only:

MONGO_URI=
JWT_SECRET=
EMAIL=
PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Important: Do not put real MongoDB URLs, passwords, JWT secrets, Razorpay secrets, Cloudinary secrets, SMTP passwords, or API keys in README files, source code, screenshots, commits, or public GitHub issues.

📡 API Overview

Authentication

POST /register
POST /login
POST /forgot-password
POST /verify-otp

Restaurant & Items

GET  /api/shop
POST /api/shop
GET  /api/item
POST /api/item

Orders & Payments

POST /orders
PUT  /orders/:id/status
POST /create-razorpay-order

For production use, protect private endpoints with authentication and role-based authorization.

⚡ Real-Time WebSockets

The application uses Socket.IO for real-time communication.

Event

Purpose

join-order

Join an order-specific tracking room

update-location

Send delivery partner coordinates

delivery-tracking

Broadcast live location to the customer

order-created

Notify restaurant owners about new orders

Example location payload:

{
  "userId": "user-id",
  "lat": 22.3072,
  "lng": 73.1812,
  "orderId": "order-id"
}

🤖 AI Microservice

The AI engine runs as an independent Flask service.

Recommendation

/recommend

Provides food recommendations using user preferences, previous orders, and cuisine-related information.

Demand Forecasting

/forecast

Uses historical order information to estimate future order demand.

Dynamic Pricing

/dynamic-price

Calculates pricing/delivery-fee adjustments based on current order conditions.

The AI service can use statistical fallbacks when optional ML dependencies are unavailable.

🗄 Database Schemas

User

{
  "name": "string",
  "email": "string",
  "role": "customer | owner | staff",
  "walletBalance": "number",
  "location": {
    "lat": "number",
    "lng": "number",
    "updatedAt": "date"
  },
  "referralCode": "string"
}

Shop

{
  "name": "string",
  "owner": "ObjectId",
  "cuisine": "string",
  "isOpen": "boolean",
  "location": {
    "lat": "number",
    "lng": "number"
  }
}

Order

{
  "customer": "ObjectId",
  "shop": "ObjectId",
  "items": [],
  "total": "number",
  "status": "pending | preparing | out_for_delivery | delivered",
  "paymentMethod": "cod | razorpay"
}

🚢 Deployment

Live Application

Live Demo: https://foodie-rusher.onrender.com/

Render

For a Docker-based deployment:

Create a new Web Service on Render.

Connect the GitHub repository.

Select Docker as the runtime.

Configure the required environment variables in Render's dashboard.

Deploy the service.

Important deployment rule

Do not upload .env to GitHub. Configure production secrets directly in the hosting provider's environment-variable settings.

🛡️ Security

This repository is designed to keep application secrets outside the source code.

Never expose

MongoDB username/password

JWT secret

Razorpay secret key

Cloudinary API secret

SMTP/app password

Any third-party API secret

Production database connection strings

If a secret was accidentally pushed

Do not simply delete the line and push again. The secret may still exist in Git history.

Immediately:

Revoke/rotate the exposed credential.

Remove the secret from the repository.

Update the secret in Render/Vercel/local .env.

Check Git history for additional exposure.

🛠 Troubleshooting

Express 5 wildcard routes

Express 5 uses updated wildcard route syntax. For example:

app.get('*any', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

Node.js version

Use Node.js 20+ for the current dependency setup.

MongoDB connection

If MongoDB fails to connect:

Verify MONGO_URI.

Check MongoDB Atlas network access.

Confirm the database user has the required permissions.

Make sure the URI is stored only in .env/hosting environment variables.

👨‍💻 Author

Nirmal Prajapat

GitHub: https://github.com/nirmal168

Project Repository: https://github.com/nirmal168/Foodie_Rusher
