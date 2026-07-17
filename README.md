# 🏥 heAlthI — Advanced AI-Powered Healthcare Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node.js-Express-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**heAlthI** is a state-of-the-art, secure, end-to-end encrypted digital healthcare ecosystem. It bridges the gap between patients, healthcare professionals, and diagnostic labs through modern AI assistance, secure video/chat consultations, medical prescription OCR processing, and seamless e-commerce pharmacy workflows.

---

## ✨ Key Features

### 🤖 1. AI-Powered Symptom Checker & Assistant
* **Stateful Agent Workflows**: Built with **LangChain** and **LangGraph** to handle multi-turn conversations, symptom analysis, and conversational context retention.
* **Prescription & Report OCR**: Integrated **Tesseract.js** to extract medical information directly from uploaded files or prescription images, generating automated medical summaries.

### 🔒 2. End-to-End Encrypted Chat
* **AES-256 Symmetric Encryption**: All real-time messaging communications are encrypted on the client side using **crypto-js** and decrypted locally, ensuring complete privacy.
* **Real-time Synchronization**: Instant client-server sync utilizing **Socket.io**.

### 📹 3. WebRTC Video Consultations
* **In-App Video Calling**: Seamless peer-to-peer audio and video consultations directly inside the web browser.
* **Custom Signaling Protocol**: Real-time calling handshake management (offers, answers, ICE candidates) handled using WebSockets.

### 💳 4. Pharmacy & Lab Test E-Commerce
* **Medicine Ordering**: Complete marketplace to search medicines, manage a shopping cart, and order prescriptions.
* **Lab Booking**: Diagnostic lab tests scheduler.
* **Payment Integration**: Secure transactional checkout powered by the **Razorpay Payment Gateway**.

### 🛡️ 5. Administrative Verification Panel
* **Doctor Credentials Verification**: Exclusive admin control room to vet medical certificates, verify authentic doctors, and conversion controls for fraudulent profile detections.
* **Contact Queries Dashboard**: Real-time customer support query viewer with deletion/dismiss actions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Redux Toolkit, Framer Motion, Tailwind CSS, Recharts | Component-based UI, animation framework, centralized Redux state, SVG chart graphics |
| **Backend** | Node.js, Express, Socket.io, Node-Cron, Nodemailer | API server, WebSockets, scheduled background workers, SMTP emailers |
| **Database** | MongoDB, Mongoose | Schema validator and NoSQL document store |
| **AI & ML** | Cohere API, LangGraph, Tesseract.js | LLM embeddings, stateful agent graph routing, OCR engine |
| **Security** | Crypto-js (AES-256), JSON Web Token (JWT), BcryptJS | End-to-end chat encryption, authorization sessions, password hashing |
| **Services** | Cloudinary, Firebase Admin SDK | Cloud asset storage, server-side Google OAuth validation |

---

## 📂 Project Structure

```bash
HealthCare-App/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Blocks (Navbar, Footer, Modals)
│   │   ├── layouts/        # Page Layouts (Dashboard templates)
│   │   ├── pages/          # Main Views (Login, Chat, Admin, ContactUs)
│   │   ├── store/          # Redux Slices (Auth, Cart, Admin slices)
│   │   └── utils/          # Client utilities (cryptoHelper, api)
│   └── package.json
│
├── server/                 # Node.js Express Backend
│   ├── models/             # Mongoose Schemas (User, Appointment, Order)
│   ├── routes/             # Express Routers (Auth, Admin, Contact, Chat)
│   ├── middleware/         # Auth filters and guards
│   ├── utils/              # Backend helpers (chatbot, keyword routing)
│   └── package.json
```

---

## 🚀 Quick Start & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas Cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/HealthCareApp01/NotSehatPulse.git
cd HealthCare-App
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signature_key
COHERE_API_KEY=your_cohere_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Server Setup
```bash
cd server
npm install
npm run dev     # Starts Nodemon server on port 5000
```

### 4. Client Setup
```bash
cd ../client
npm install
npm run dev     # Starts Vite local server on port 5173
```

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
