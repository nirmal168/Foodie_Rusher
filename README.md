# 🍔 Foodie Rusher

> **A modern full-stack food delivery and management platform built with the MERN ecosystem, real-time communication, AI services, secure payments, and role-based workflows.**

<p align="center">

  <a href="https://foodie-rusher.onrender.com/">
    <img src="https://img.shields.io/badge/🌐%20Live%20Demo-Foodie%20Rusher-success?style=for-the-badge" alt="Live Demo">
  </a>

  <a href="https://github.com/nirmal168/Foodie_Rusher">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub">
  </a>

</p>

<p align="center">

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">

  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">

  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">

  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">

  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO">

  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">

  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">

</p>

---

## 🎯 Overview

**Foodie Rusher** is a full-stack food delivery and management platform designed around three connected roles:

- 👤 **Customers** — discover restaurants, manage carts, place orders, make payments, and track deliveries.
- 🏪 **Restaurant Owners** — manage restaurants and menus, process incoming orders, and monitor sales.
- 🛵 **Delivery Partners** — accept deliveries, update order status, and share real-time location.

The platform combines a React frontend, Node.js/Express backend, MongoDB database, Socket.IO real-time communication, and a dedicated Python AI microservice.

---

## ✨ Key Features

### 👤 Customer

- Browse nearby restaurants
- Explore restaurant menus
- Add and manage cart items
- Place food orders
- Razorpay online payments
- Cash on Delivery
- Order history
- Real-time delivery tracking
- Referral rewards
- Wallet balance
- AI-powered food recommendations

### 🏪 Restaurant Owner

- Restaurant profile management
- Menu management
- Add, update and delete food items
- Manage incoming orders
- Update order status
- Sales and order analytics
- AI-powered demand forecasting

### 🛵 Delivery Partner

- View available deliveries
- Accept delivery orders
- Update delivery status
- Real-time GPS location sharing
- Live customer tracking

### ⚡ Real-Time System

- Socket.IO based communication
- Live delivery location updates
- Real-time order status
- Order-created notifications
- Dedicated order rooms

### 🤖 AI Services

- Personalized food recommendations
- Collaborative filtering
- Content-based recommendations
- Order demand forecasting
- Dynamic pricing calculations
- Python Flask AI microservice

### 💳 Payment & Services

- Razorpay integration
- Cash on Delivery
- Cloudinary image storage
- Email notifications
- Referral and wallet system
- Promotional discount system

---

## 🛠 Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Maps | Leaflet.js |
| Backend | Node.js 20+, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Real-Time | Socket.IO |
| AI Service | Python, Flask, scikit-learn, NumPy, pandas |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer |
| Deployment | Docker, Render |

---

## 🏗 System Architecture

```mermaid
flowchart TD

    Customer[Customer]
    Owner[Restaurant Owner]
    Driver[Delivery Partner]

    React[React Frontend]

    Express[Node.js + Express API]
    Socket[Socket.IO Server]

    AI[Python Flask AI Service]

    Mongo[(MongoDB Atlas)]
    Cloudinary[Cloudinary]
    Razorpay[Razorpay]

    Customer --> React
    Owner --> React
    Driver --> React

    React --> Express
    React --> Socket

    Express --> Mongo
    Express --> AI
    Express --> Cloudinary
    Express --> Razorpay

    Socket --> Mongo
    Socket --> React

    AI --> Mongo
