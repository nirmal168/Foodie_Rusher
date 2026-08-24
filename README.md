🍔 Foodie Rusher

A modern full-stack food delivery and management platform built with the MERN ecosystem, real-time communication, AI services, secure payments, and role-based workflows.

Live Application: https://foodie-rusher.onrender.com/
Repository: https://github.com/nirmal168/Foodie_Rusher

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

📚 Contents

Highlights

Quick Start

Key Features

Technical Stack

Project Structure

System Architecture

Environment & Security

API Overview

Real-Time Communication

AI Microservice

Database Schemas

Deployment

Troubleshooting

Author

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

🔐 Environment & Security

Application credentials are kept outside the repository through environment variables.

Local Configuration

Create backend/.env locally:

cp backend/.env.example backend/.env

Use private values for:

PORT=5000

MONGO_URI=<private-mongodb-connection-string>
JWT_SECRET=<private-jwt-secret>

EMAIL=<private-email>
PASS=<private-email-app-password>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<private-cloudinary-secret>

RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<private-razorpay-secret>

ALLOWED_ORIGINS=http://localhost:5173

Repository Security

.env
.env.*
!.env.example

node_modules/
dist/
build/

__pycache__/
*.pyc
*.log

No production credentials are stored in this repository.

MongoDB credentials, JWT secrets, Razorpay secrets, Cloudinary secrets, SMTP passwords, and other private API keys belong only in local environment files or the hosting provider's secret/environment configuration.

If a credential is ever exposed publicly, it should be revoked and rotated immediately rather than only deleted from the latest commit.

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

The application is deployed on Render using a Docker-based production setup.

Live Application: https://foodie-rusher.onrender.com/

The production environment uses hosting-provider environment variables for private configuration, keeping application secrets separate from the GitHub repository.

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
MERN Stack Developer • C++ DSA

GitHub: https://github.com/nirmal168

Foodie Rusher: https://github.com/nirmal168/Foodie_Rusher

Live Demo: https://foodie-rusher.onrender.com/
