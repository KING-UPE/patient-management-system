# 🏥 Patient Record Management System

A web-based system for managing patient records in a teaching hospital.

## 🌐 Live Demo
👉 [View Live App on Railway](https://patient-management-system-production.up.railway.app/)

---

## ✨ Features

- **Patient Management**: Add, view, update, and delete patients  
- **Doctor Management**: Assign doctors and manage doctor info  
- **Filtering**: Filter patients by name, PID, city, doctor, or status  
- **Dashboard**: Real-time patient and doctor stats  

---

## 🛠️ Tech Stack

| Layer      | Tools                          |
|------------|-------------------------------|
| Frontend   | HTML5, Bootstrap 5, jQuery, AJAX |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB (via Atlas)           |
| Hosting    | Railway (alternative: Render, Vercel) |
| API Style  | RESTful APIs                  |

---

## 🚀 Installation & Local Setup

### 1️⃣ Step 1: Prerequisites
- Node.js v16 or later  
- MongoDB Atlas (or local MongoDB instance)  
- Git  

### 2️⃣ Step 2: Clone the Repository
```bash
git clone https://github.com/KING-UPE/patient-management-system.git
cd patient-management-system
```

###3️⃣ Step 3: Install Dependencies
```bash
npm install
```

###4️⃣ Step 4: Environment Setup
Create a .env file in the root directory with the following content:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```
-📝 Replace your_mongodb_connection_string with your actual MongoDB Atlas URI.

###5️⃣ Step 5: Start the App
```bash
npm start
```
-👉 The app will run at: http://localhost:3000
