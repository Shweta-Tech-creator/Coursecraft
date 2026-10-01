# Work Breakdown Structure (WBS)
## CourseCraft — Case Study No. 108

The WBS decomposes the CourseCraft initiative hierarchically into 4 distinct structural levels across software engineering and content production tracks.

```
1.0 CourseCraft Platform & Curriculum Development
│
├── 1.1 Project Management & Requirements Engineering (SEPM)
│   ├── 1.1.1 Stakeholder Elicitation & Case Study 108 Scope Definition
│   ├── 1.1.2 IEEE Std 830 Software Requirements Specification (SRS)
│   ├── 1.1.3 MoSCoW Prioritization & Requirements Traceability Matrix (RTM)
│   └── 1.1.4 Risk Register & RMMM Formulation
│
├── 1.2 Platform Software Engineering (10.0 Weeks Track)
│   ├── 1.2.1 Architecture & API Backend Service
│   │   ├── 1.2.1.1 Node.js REST API Server (`server.js`)
│   │   ├── 1.2.1.2 Course Catalog & Filter Endpoints (`/api/courses`)
│   │   ├── 1.2.1.3 Assessment Grading & 70% Evaluator (`/api/quiz/submit`)
│   │   └── 1.2.1.4 Payment Adapter & Receipt Generator (`/api/payments`)
│   │
│   ├── 1.2.2 Cloud Persistence & Security (Firebase)
│   │   ├── 1.2.2.1 Firebase Auth Integration & Seed Personas
│   │   ├── 1.2.2.2 Cloud Firestore RBAC Security Rules (`firestore.rules`)
│   │   └── 1.2.2.3 Cloud Storage Media Rules (`storage.rules`)
│   │
│   ├── 1.2.3 Frontend Portals & Responsive Design Systems
│   │   ├── 1.2.3.1 Public Landing Page & Catalog Search (`index.html`)
│   │   ├── 1.2.3.2 Multi-Role Authentication UI (`login.html`)
│   │   ├── 1.2.3.3 Student Learning Studio & Video Player (`learn.html`)
│   │   ├── 1.2.3.4 10-Question Certification Exam Engine (`quiz.html`)
│   │   ├── 1.2.3.5 Cryptographic Certificate Generator & Print Export (`certificate.html`)
│   │   ├── 1.2.3.6 Faculty 12h Recording Studio (`faculty/dashboard.html`)
│   │   └── 1.2.3.7 Executive Administrator & CPM Visualizer (`administrator/dashboard.html`)
│   │
│   └── 1.2.4 Quality Assurance & Test Automation
│       ├── 1.2.4.1 Boundary Value Analysis (BVA) for 70% Threshold
│       ├── 1.2.4.2 Equivalence Partitioning for ₹4,500 Payments
│       └── 1.2.4.3 Automated End-to-End Test Suite Execution (`test-suite.js`)
│
└── 1.3 Course Content Production & Video Editing (18.0 Weeks Track)
    ├── 1.3.1 Initial Cohort: 8 Launch Courses (4.8 Weeks / 288 Effort Hours)
    │   ├── 1.3.1.1 Faculty Video Recording (8 × 12h = 96 Content Hours)
    │   ├── 1.3.1.2 Video Post-Production & Editing (8 × 36h = 288 Hours @ 60h/wk)
    │   ├── 1.3.1.3 4-Module Curriculum & Lesson Syllabus Assembly
    │   └── 1.3.1.4 10-Question Certification Assessment Bank Authoring
    │
    └── 1.3.2 Pipeline Cohort: 22 Planned Courses (13.2 Additional Weeks / 792 Effort Hours)
        ├── 1.3.2.1 Faculty Video Recording (22 × 12h = 264 Content Hours)
        ├── 1.3.2.2 Video Editing Batch 1 (Courses 9–18: 360 Hours / 6.0 Weeks)
        ├── 1.3.2.3 Video Editing Batch 2 (Courses 19–30: 432 Hours / 7.2 Weeks)
        └── 1.3.2.4 Final Quality Review & Catalog Publishing
```
