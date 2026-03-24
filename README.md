<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=TicketSolved%20HRMS&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Built%20by%20LionXcode&descAlignY=55&descSize=20" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=F5A623&center=true&vCenter=true&width=600&lines=HR+Ticket+Management+System;Role-Based+Access+Control;Real-Time+Notifications;MongoDB+%2B+Next.js+%2B+Express;Built+with+%E2%9D%A4%EF%B8%8F+by+LionXcode)](https://git.io/typing-svg)

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-5-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/REST-API-FF6B6B?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/CORS-Enabled-38B2AC?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Type-Final%20Year%20Project-F5A623?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Made%20by-LionXcode-FF6B6B?style=for-the-badge"/>
</p>

</div>

---

<div align="center">

## 🦁 About LionXcode

</div>

> **LionXcode** is a freelance development brand delivering high-quality, production-ready web applications. This project was built as **paid work** for a final year college student — crafted with full attention to detail, clean architecture, and real-world deployment.

<div align="center">

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🦁  LionXcode  —  Code That Roars                     ║
║                                                          ║
║   Freelance · Full Stack · Production Ready              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

</div>

---

<div align="center">

## 🎯 Project Overview

</div>

**TicketSolved Backend** is the REST API server powering the HR Ticket Management System. Built with **Express.js** and **MongoDB**, it handles all ticket and audit log operations with full CORS support for the Next.js frontend.

<div align="center">

```mermaid
graph LR
    A[Next.js Frontend] -->|HTTP Requests| B[Express Server]
    B -->|CRUD Operations| C[(MongoDB Atlas)]
    B -->|GET /api/tickets| D[Ticket Routes]
    B -->|GET /api/audit-logs| E[Audit Log Routes]
    D -->|Read/Write| C
    E -->|Read/Write| C
```

</div>

---

<div align="center">

## 🛠️ Tech Stack — Backend

</div>

```yaml
Runtime:      Node.js (ES Modules)
Framework:    Express.js 4.18
Database:     MongoDB 5 (Atlas)
ODM:          Native MongoDB Driver
CORS:         cors 2.8
Config:       dotenv 16
Dev Tool:     nodemon 3
Deployment:   Vercel Serverless
```

---

<div align="center">

## 📡 API Endpoints

</div>

### 🎫 Tickets — `/api/tickets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets` | Fetch all tickets |
| `POST` | `/api/tickets` | Create a new ticket |
| `PATCH` | `/api/tickets/:id` | Update ticket (status, assignee, comment) |

### 📋 Audit Logs — `/api/audit-logs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit-logs` | Fetch all audit logs (sorted by timestamp) |
| `POST` | `/api/audit-logs` | Create a new audit log entry |

---

<div align="center">

## 🚀 Getting Started

</div>

```bash
# Clone the repository
git clone https://github.com/acelion55/HRMS_FRONTEND.git
cd HRMS_FRONTEND

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with:
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hrms
PORT=5000

# Run development server
npm run dev

# Run production server
npm start
```

---

<div align="center">

## 📁 Project Structure

</div>

```
back/
├── index.js              # Express app entry point
├── lib/
│   └── mongodb.js        # MongoDB connection helper
├── routes/
│   ├── tickets.js        # Ticket CRUD routes
│   └── audit-logs.js     # Audit log routes
├── .env                  # Environment variables (not committed)
├── .gitignore
└── package.json
```

---

<div align="center">

## ⚙️ Environment Variables

</div>

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
MONGODB_DB_NAME=hrms
PORT=5000
```

---

<div align="center">

## 🌐 Live API

<a href="https://hrbackend-taupe.vercel.app">
  <img src="https://img.shields.io/badge/🚀%20Live%20API-Visit%20Now-F5A623?style=for-the-badge"/>
</a>

<br/><br/>

| Endpoint | URL |
|----------|-----|
| Tickets | `https://hrbackend-taupe.vercel.app/api/tickets` |
| Audit Logs | `https://hrbackend-taupe.vercel.app/api/audit-logs` |

<br/>

---

## 🦁 Built by LionXcode

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

*This project was delivered as paid freelance work for a final year college student.*
*Clean code. Real deployment. Production quality.*

**LionXcode — Code That Roars 🦁**

</div>
