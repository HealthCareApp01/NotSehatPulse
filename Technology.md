# Technology Stack & Package Directory

This document provides a comprehensive breakdown of all technologies, frameworks, libraries, and packages utilized in the HealthCare-App repository, detailing their purpose and how they are implemented.

---

## 1. Core Architecture & Frameworks

### React
- **Purpose**: Frontend Component Library.
- **Description**: Powers the Single Page Application (SPA) user interface with declarative components, custom hooks, and context.
- **Implementation**: Located under the `/client` directory. Bootstrapped with Vite, utilizing functional components and React hooks (`useState`, `useEffect`, `useContext`) for interactive views (e.g., `PatientDashboard`, `FindDoctors`, `ContactUs`).

### Node.js & Express
- **Purpose**: Backend Server & REST API.
- **Description**: Handles incoming HTTP requests, serves endpoint routers, and runs scheduled workers.
- **Implementation**: Located under the `/server` directory. Initializes an Express application in `server.js` with JSON parser middleware, CORS configurations, and route handlers mapping to Mongo controllers.

### MongoDB & Mongoose
- **Purpose**: NoSQL Database & ORM.
- **Description**: Stores persistently all platform schemas: Users, Patient/Doctor Profiles, Appointments, Orders, Cart items, Otp tokens, Chat messages, and Contact queries.
- **Implementation**: Connects via `mongoose.connect()` in `server.js`. Database schemas are located under `/server/models/` using Mongoose schema validation constraints (e.g., `User.js`, `ContactQuery.js`).

---

## 2. Backend Packages & Dependencies (`/server/package.json`)

### `@langchain/core` & `@langchain/langgraph` & `langchain`
- **Purpose**: AI Conversational Agent & Workflows.
- **Description**: Orchestrates the multi-turn chatbot graph logic, enabling memory persistence, fallback state transition paths, and structured data outputs.
- **Implementation**: Configured in `/server/utils/chatbot/`. It defines state nodes via `@langchain/langgraph` (e.g., `state.js`, `index.js`) to parse patient complaints, route query types, or summarize medical reports.

### `cohere-ai`
- **Purpose**: Large Language Model API Client.
- **Description**: Interfaces with the Cohere LLM engine for embeddings, classification, and text generation.
- **Implementation**: Configured in `/server/utils/chatbot/state.js` and `/server/scratch/test_cohere.js` to process patient symptoms and provide conversational guidance.

### `cloudinary`
- **Purpose**: Cloud Asset Management.
- **Description**: Hosts user profile pictures, uploaded doctor identity documents, and carousel illustrations.
- **Implementation**: Configured in `server/routes/profileRoutes.js` and the upload scratch script. Calls `cloudinary.uploader.upload()` using stream buffers or source URLs, returning secure HTTPS asset strings stored in the database.

### `firebase-admin`
- **Purpose**: Server-Side Authentication Verification.
- **Description**: Validates Google OAuth Identity tokens sent from the frontend to securely log in or register Google accounts.
- **Implementation**: Used in `server/utils/firebaseAdmin.js` and `server/routes/auth.js`. Calls `firebaseAdminInstance.auth().verifyIdToken(token)` to extract verify email credentials.

### `bcryptjs`
- **Purpose**: Cryptographic Password Hashing.
- **Description**: Hashes raw passwords using high-entropy salt before saving them, and compares submitted credentials during login.
- **Implementation**: Used in `/server/routes/auth.js`. Implements `bcrypt.hash()` and `bcrypt.compare()` for secure patient/doctor credentials.

### `jsonwebtoken` (JWT)
- **Purpose**: User Authentication Sessions.
- **Description**: Generates secure JSON Web Tokens containing the user's ID, email, and role, which are passed to the client and verified on subsequent requests.
- **Implementation**: Middleware in `server/middleware/auth.js` intercepts headers to verify JWT signatures using `jwt.verify()`.

### `joi`
- **Purpose**: Schema Data Validation.
- **Description**: Validates that incoming client payload structures match the expected schemas (e.g., email format, required string lengths).
- **Implementation**: Used inside controllers (e.g., OTP verify, patient profile configurations) to intercept invalid API data structures before hitting DB routes.

### `node-cron`
- **Purpose**: Automated Scheduled Background Tasks.
- **Description**: Runs functions at specified time intervals (cron syntax) independently of API triggers.
- **Implementation**: Configured in `server.js` to run a midnight worker checking for rescheduled doctor appointments and a 6 PM worker to flag unattended appointments.

### `nodemailer`
- **Purpose**: Transactional Email Transmissions.
- **Description**: Sends system notifications and OTP (One-Time Password) validation codes to verify user emails.
- **Implementation**: Used in `/server/routes/auth.js`. Utilizes an SMTP transport configuration to email numeric OTP codes.

### `razorpay`
- **Purpose**: Payment Processing Gateway.
- **Description**: Creates payments orders, handles checkout handshakes, and verifies transaction signatures.
- **Implementation**: Located in `server/routes/orderRoutes.js`. Instantiates `new Razorpay()` to process payment intents for medicines or doctor appointment bookings.

### `socket.io`
- **Purpose**: Real-time WebSockets & Peer-to-Peer Signaling.
- **Description**: Manages real-time message exchange and facilitates WebRTC video calls between patients and doctors.
- **Implementation**: Integrated in `server.js`. Listens for socket connections, manages rooms (`join-room`), and broadcasts peer signaling payloads (offers, answers, ICE candidates).

### `tesseract.js`
- **Purpose**: Optical Character Recognition (OCR).
- **Description**: Extracts textual characters from uploaded image documents.
- **Implementation**: Used to parse and extract text from uploaded medical prescription images, which are then summarized by the AI chatbot.

### `cors`
- **Purpose**: Cross-Origin Resource Sharing.
- **Description**: Configures headers to allow requests from specific origin ports.
- **Implementation**: Middleware in `server.js` letting client routes (`http://localhost:5173`) call server routes (`http://localhost:5000`).

### `crypto-js`
- **Purpose**: Encrypting and Decrypting Chatbot/LLM Conversations on Server.
- **Description**: Implements standard cryptographic algorithms (like AES-256) to ensure privacy.
- **Implementation**: Configured in `/server/utils/cryptoHelper.js` and used in `/server/routes/chatbotRoutes.js` to decrypt incoming patient queries before passing them to the AI chatbot logic, and encrypt response payloads before transmitting them back.

### `dotenv`
- **Purpose**: Environment Configuration.
- **Description**: Loads environment variables from `.env` files into Node's `process.env`.
- **Implementation**: Initialized in `server.js` and utils to grab database connections, third-party API keys, and server port settings.

---

## 3. Frontend Packages & Dependencies (`/client/package.json`)

### `@reduxjs/toolkit` & `react-redux`
- **Purpose**: Global Frontend State Store.
- **Description**: Centralizes state management across the React hierarchy, providing structured actions and thunks.
- **Implementation**: Located under `/client/src/store/`. Handles auth state slices, cart updates, and admin operations (e.g., `adminSlice.js`).

### `axios`
- **Purpose**: Promise-based API Client.
- **Description**: Performs HTTP network requests (GET, POST, PUT, DELETE) to the backend.
- **Implementation**: Used across pages (e.g., `Login.jsx`, `ContactUs.jsx`, `AdminDashboard.jsx`) to communicate with the REST API.

### `crypto-js`
- **Purpose**: Client-side Message Encryption (End-to-End Encryption).
- **Description**: Implements client-side AES-256 encryption on message payloads.
- **Implementation**: Configured in `/client/src/utils/cryptoHelper.js`. Used in chat pages (`ChatAndConsult.jsx`, `AISymptomChecker.jsx`) to encrypt input message fields before socket broadcasts/API submissions and to decrypt incoming encrypted content.

### `firebase` (Client SDK)
- **Purpose**: Third-party Authentication.
- **Description**: Provides Google authentication triggers to authenticate users directly through the browser.
- **Implementation**: Located in `client/src/firebase.js`. Invokes `signInWithPopup()` to fetch credentials for Google sign-in.

### `framer-motion`
- **Purpose**: Fluid Animations & Transitions.
- **Description**: Power transitions, slides, keyframe scales, and modal entrances with physics-based math.
- **Implementation**: Used in UI elements like `ContactUs.jsx` for the doctor carousel images and input animations.

### `lucide-react`
- **Purpose**: Minimalist SVG Icon Suite.
- **Description**: Standardized vector icons for buttons, tabs, alerts, and navigation links.
- **Implementation**: Used in dashboards, navigations, and buttons (e.g., `ShieldCheck`, `Trash2`, `Mail`).

### `react-router-dom`
- **Purpose**: Declarative Frontend Routing.
- **Description**: Handles page routes and protects routes from unauthorized user roles (e.g., preventing patients from loading `/admin-dashboard`).
- **Implementation**: Configured in `client/src/main.jsx` with routes mapping paths to specific components.

### `recharts`
- **Purpose**: Data Visualization Charts.
- **Description**: Renders clean SVGs displaying graphical statistics.
- **Implementation**: Renders vitals charts, weight history graphs, and diagnostic summaries on patient dashboards.

### `socket.io-client`
- **Purpose**: WebSocket Client Connection.
- **Description**: Establishes persistent connection to the server's Socket.io port to enable immediate event handling.
- **Implementation**: Configured in chat views and WebRTC calling layouts to receive real-time messages and signaling.

### `tailwindcss` & `@tailwindcss/vite`
- **Purpose**: Utility-First Layout Styling.
- **Description**: Core styling framework. V4 features CSS-first configuration and integration with the Vite bundler.
- **Implementation**: Imported in `client/src/index.css` and compiled during compilation, styling the layout using class name attributes (e.g., flex-row, p-6).
