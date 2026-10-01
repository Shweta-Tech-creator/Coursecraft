# 🎓 CourseCraft

> A lightweight, full-stack course platform built for university continuing education centres.

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-Launch_Platform-2563eb?style=for-the-badge&logo=render&logoColor=white)](https://coursecraft-mov4.onrender.com)
[![Status: Online](https://img.shields.io/badge/Status-Live_%26_Online-success?style=for-the-badge)](https://coursecraft-mov4.onrender.com)

👉 **[https://coursecraft-mov4.onrender.com](https://coursecraft-mov4.onrender.com)**

CourseCraft connects **students**, **faculty**, and **administrators** in one place — from browsing courses and streaming video lectures to taking certification quizzes and resolving student doubts.

---

## ✨ Features at a Glance

- **👨‍🎓 Student Portal**: Browse the university course catalog, watch modular video lessons in a built-in learning studio, submit queries to professors, take a 10-question assessment (70% pass mark), and download a verified certificate.
- **👩‍🏫 Faculty Studio**: Manage course syllabi, track enrolled students, and respond directly to student queries and discussions.
- **👨‍💼 Admin Dashboard**: Create new courses, assign/unassign faculty, track tuition payments, and oversee platform activity with live metrics.
- **✉️ Email Notifications**: Built-in SMTP support (Gmail or custom mail server) to send automated credential and enrollment emails directly to student inboxes.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (native HTTP REST server, no heavy framework overhead)
- **Frontend**: Vanilla HTML5, CSS3, Modern JavaScript (fast loading & responsive)
- **Email Service**: TLS SMTP client
- **Database / Storage**: File-backed JSON stores + Firebase integration

---

## 🚀 Quickstart

### 1. Clone the repo
```bash
git clone https://github.com/Shweta-Tech-creator/Coursecraft.git
cd Coursecraft
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
*(Optional: Add your Gmail address and Google App Password to `.env` if you'd like real emails sent.)*

### 3. Run the app
```bash
npm start
```
Open **[http://localhost:8085](http://localhost:8085)** in your browser.

---

## 🔑 Demo Logins

You can use the 1-click login buttons on the login page, or sign in with these credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@university.edu` | `universityPass123` |
| **Faculty** | `faculty@university.edu` | `universityPass123` |
| **Admin** | `admin@university.edu` | `universityPass123` |

---

## 📁 Project Structure

```text
CourseCraft/
├── frontend/          # Web app (student, faculty, and admin dashboards)
├── backend/           # REST API server & JSON datastores
├── docs/              # Software requirements (SRS, UML, Architecture)
├── test/              # Automated test suites
├── .env.example       # Template config
└── package.json       # Scripts & dependencies
```

---

## 🧪 Tests

Run the built-in test suite:
```bash
npm test
```

---

## 📄 License

MIT License — Feel free to use and adapt this project!
