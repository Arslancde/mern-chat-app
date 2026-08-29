# 💬 Connect - Real-Time Chat Application

<div align="center">

![Connect](https://img.shields.io/badge/Connect-Chat%20App-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![Made with](https://img.shields.io/badge/Made%20with-MERN-orange?style=flat-square)

**A modern real-time chat application where you can connect with friends instantly**

</div>

---

## 📖 About The Project

**Connect** is a real-time chat application I built using the MERN stack. It allows users to create accounts, chat with each other instantly, send audio messages, switch between beautiful themes, and see who's online - just like WhatsApp or Telegram.

I started building this project because I wanted to learn how real-time applications work under the hood. I was fascinated by how instant messaging works, and I wanted to create something that feels smooth, modern, and actually fun to use.

The app is fully responsive, works on both desktop and mobile, and comes with all the features you'd expect from a modern chat platform.

---

## 📸 Screenshots

### 🔐 Authentication Pages

| Login Page | Register Page |
|------------|---------------|
| ![Login Page](screenshots/login.png) | ![Register Page](screenshots/register.png) |

---

### 💬 Chat Interface

| Chat Window | User List |
|-------------|-----------|
| ![Chat Interface](screenshots/chat.png) | ![User List](screenshots/userlist.png) |

| Another Chat View |
|-------------------|
| ![Chat View 2](screenshots/chat2.png) |

---

### 🎵 Audio Messaging

| Recording Audio | Audio Preview |
|-----------------|---------------|
| ![Recording Audio](screenshots/audio1.png) | ![Audio Preview](screenshots/audio2.png) |

---

### 🎨 Theme Switcher

| Multiple Themes |
|-----------------|
| ![Themes](screenshots/themes.png) |

---

## ✨ What You Can Do

Here's everything you can do with Connect:

### 💬 Core Chat Features
- **Send text messages** instantly to anyone
- **Send audio messages** by recording your voice
- **See when messages are delivered** (✓) and read (✓✓)
- **See who's online** with green status dots
- **Get unread message badges** on the user list
- **See typing indicators** when someone is typing

### 🎨 UI & Experience
- **Switch between 9 beautiful themes** (WhatsApp, Purple, Ocean, Dark, and more)
- **Clean, modern interface** inspired by popular messaging apps
- **Responsive design** that works on all devices
- **Smooth animations** for messages and transitions
- **User-friendly navigation** with search and user list

### 🔐 Security & Authentication
- **Secure registration and login** with JWT authentication
- **Passwords encrypted** with bcrypt
- **Protected routes** that require login

---

## 🛠️ How I Built It

### Backend Technology
| Technology | What I used it for |
|------------|-------------------|
| **Node.js** | JavaScript runtime for the backend server |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB** | NoSQL database to store users and messages |
| **Socket.IO** | Real-time communication for instant messaging |
| **JWT** | Secure user authentication with tokens |
| **bcryptjs** | Password hashing for security |
| **Multer** | Handling audio file uploads |

### Frontend Technology
| Technology | What I used it for |
|------------|-------------------|
| **React** | Building the interactive user interface |
| **React Router** | Navigation between pages |
| **Axios** | Making HTTP requests to the backend |
| **Socket.IO Client** | Real-time messaging from the browser |
| **React Icons** | Beautiful icons throughout the app |

### Features I Built
| Feature | How it works |
|---------|-------------|
| **Real-time messaging** | Messages are sent instantly using Socket.IO |
| **Audio messages** | Record voice using MediaRecorder API, send as WebM |
| **Themes** | CSS gradients and backgrounds that change on click |
| **Online status** | Users are marked online when socket connects |
| **Read receipts** | Messages turn from ✓ to ✓✓ when read |
| **Message history** | All messages are stored in MongoDB |

---

## 🚀 How to Run This Project

### Prerequisites
- Node.js installed on your computer
- MongoDB Atlas account (free) or MongoDB installed locally

### Step 1: Clone the Repository
```bash
git clone https://github.com/Arslancde/Connect.git
cd Connect
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Set Up Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/connect-db
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

> **Note:** Replace `yourusername`, `yourpassword`, and `your_secret_key_here` with your own values.

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server will run at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App will open at `http://localhost:3000`

---

## 🎨 Themes You Can Switch To

| Theme | Emoji | Vibe |
|-------|-------|------|
| WhatsApp | 💬 | Classic green chat style |
| Purple | 💜 | Modern gradient purple |
| Ocean | 🌊 | Calm blue ocean vibes |
| Dark | 🌙 | Dark mode for night chat |
| Pink | 🌸 | Soft pink and purple |
| Forest | 🌲 | Nature-inspired green |
| Sunset | 🌅 | Warm orange and pink |
| Telegram | ✈️ | Clean blue style |
| Light Gray | 🌈 | Simple and clean |

Just click the 🎨 button in the chat header to cycle through them!

---

## 📁 Project Structure

```
Connect/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login & Register logic
│   │   └── messageController.js  # Send, receive, delete messages
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Audio file upload handling
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Message.js            # Message schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   └── messageRoutes.js      # Message endpoints
│   ├── utils/
│   │   └── generateToken.js      # JWT token generator
│   ├── uploads/
│   │   └── audio/                # Audio messages stored here
│   ├── .env                      # Environment variables (not in git)
│   └── server.js                 # Main entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login & Register forms
│   │   │   ├── chat/             # Chat UI components
│   │   │   └── common/           # Reusable components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # User authentication state
│   │   │   └── SocketContext.jsx # Socket.IO connection
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ChatPage.jsx      # Main chat interface
│   │   ├── utils/
│   │   │   └── api.js            # Axios configuration
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── screenshots/
│   ├── audio1.png
│   ├── audio2.png
│   ├── chat.png
│   ├── chat2.png
│   ├── login.png
│   ├── register.png
│   ├── themes.png
│   └── userlist.png
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login to your account |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/users` | Get all users |
| POST | `/api/messages` | Send a text message |
| POST | `/api/messages/audio` | Send an audio message |
| GET | `/api/messages/:userId` | Get chat history |
| GET | `/api/messages/conversations` | Get all conversations |
| PUT | `/api/messages/read/:userId` | Mark messages as read |

---

## 🙏 What I Learned

Building this project taught me a lot about:

- **Real-time communication** with Socket.IO
- **State management** in React with Context API
- **Authentication** with JWT and bcrypt
- **File uploads** with Multer
- **Database design** with MongoDB
- **UI/UX design** and making things look good
- **Deployment** and environment variables

---

## 📬 Let's Connect

If you have any questions, feedback, or just want to say hi, feel free to reach out!

**Created by:** Arslan  
**Email:** thearslanbiz@gmail.com  
**GitHub:** [Arslancde](https://github.com/Arslancde)

---

## ⭐ Show Your Support

If you found this project helpful or interesting, please give it a star on GitHub! It means a lot to me.

---

<div align="center">

**Made with ❤️ and lots of ☕ by Arslan**

</div>