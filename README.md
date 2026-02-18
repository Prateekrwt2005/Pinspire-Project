# 🚀 Pinspire – Image Sharing & Board-Based Content Platform

Pinspire is a full-stack image sharing platform that allows users to create posts, upload images, organize them into boards, and explore a dynamic content feed. The project focuses on clean UI design, secure authentication, and scalable backend architecture.

---

## 🌟 Features

- 📝 User Registration & Login (JWT Authentication)
- 🔐 Secure Authentication & Protected Routes
- 📸 Create & Upload Image Posts
- 📌 Save and Organize Pins into Custom Boards
- 📰 Dynamic Feed Showing User-Generated Content
- 👤 User Profile with Personal Posts
- 📱 Fully Responsive Design (Tailwind CSS)
- ⚙️ RESTful API Architecture

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Tokens (JWT)

---

## 🏗 Project Architecture

Frontend (HTML / CSS / Tailwind)
      ↓
Express.js REST APIs
      ↓
MongoDB Database

- Structured route handling
- Middleware-based authentication
- JWT-based authorization
- MongoDB schema design
- Clean separation of concerns

---

## 🔐 Authentication Flow

1. User registers with credentials
2. Password securely stored in database
3. JWT token generated upon login
4. Token stored on client side
5. Protected routes verified using middleware
