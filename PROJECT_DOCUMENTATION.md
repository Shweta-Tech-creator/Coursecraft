# CourseCraft — Master Academic Project Documentation
## Online Course Platform for University Continuing Education Centre
**Department:** Computer Science & Engineering  
**Academic Program:** B.Tech CSE 2025–29, Semester III  
**Subject:** Software Engineering & Project Management (SEPM)  
**Case Study No:** 108  
**Live Firebase Project:** `coursecraft-c31f9`  
**Tagline:** *"Learn. Grow. Get Certified."*

---

## Table of Contents
1. [Executive Summary & Case Study 108 Key Figures](#1-executive-summary--case-study-108-key-figures)
2. [Dual-Track CPM Critical Path Analysis](#2-dual-track-cpm-critical-path-analysis)
3. [Financial Revenue Modeling (₹2.02 Cr)](#3-financial-revenue-modeling-202-cr)
4. [Software Requirements Specification (SRS) Summary](#4-software-requirements-specification-srs-summary)
5. [12 Functional Requirements (FR-01 to FR-12)](#5-12-functional-requirements-fr-01-to-fr-12)
6. [8 Measurable Non-Functional Requirements (NFR-01 to NFR-08)](#6-8-measurable-non-functional-requirements-nfr-01-to-nfr-08)
7. [Architecture, Cohesion & Loose Coupling](#7-architecture-cohesion--loose-coupling)
8. [UML Diagrams in Mermaid](#8-uml-diagrams-in-mermaid)
9. [Boundary Value Analysis (BVA) & 70% Quiz Threshold](#9-boundary-value-analysis-bva--70-quiz-threshold)
10. [Quality Metrics: Defect Density & DRE (94.12%)](#10-quality-metrics-defect-density--dre-9412)
11. [Risk Management & RMMM Plan](#11-risk-management--rmmm-plan)
12. [User Personas & 1-Click Access](#12-user-personas--1-click-access)

---

## 1. Executive Summary & Case Study 108 Key Figures

| Parameter | Case Study Value | Mathematical Derivation |
| :--- | :--- | :--- |
| **Total Planned Courses** | **30 Courses** | Full curriculum catalog |
| **Initial Launch Courses** | **8 Courses** | Phase 1 launch cohort at Week 10 |
| **Remaining Pipeline** | **22 Courses** | Phase 2 continuous rollout |
| **Video Content per Course** | **12 Hours** | 4 modules × 3 hours / course |
| **Recording & Editing Ratio** | **3 : 1** | 3 hours of editing per 1 content hour |
| **Effort Hours per Course** | **36 Effort Hours** | $12 \text{ hours} \times 3 = 36\text{h}$ |
| **Effort for 8 Courses** | **288 Hours** | $8 \times 36\text{h} = 288\text{h}$ |
| **Effort for 30 Courses** | **1,080 Hours** | $30 \times 36\text{h} = 1,080\text{h}$ |
| **Video Editors Count** | **2 Editors** | Dedicated university media staff |
| **Editor Weekly Hours** | **30 Hours/Week** | Per editor |
| **Combined Weekly Bandwidth** | **60 Hours/Week** | $2 \text{ editors} \times 30\text{h/wk} = 60\text{h/wk}$ |
| **Duration for 8 Courses** | **4.8 Weeks** | $288\text{h} \div 60\text{h/wk} = 4.8\text{ weeks}$ |
| **Duration for 30 Courses** | **18.0 Weeks** | $1,080\text{h} \div 60\text{h/wk} = 18.0\text{ weeks}$ |
| **Platform Software Dev** | **10.0 Weeks** | Backend, frontend, Firebase, testing |
| **Primary Project Bottleneck**| **Content Production** | Content takes 18.0w vs Software 10.0w |
| **Course Enrollment Fee** | **₹4,500 INR** | Standard university fee per student |
| **Annual Enrolments / Course**| **150 Students** | Projected average enrolment |
| **Revenue for 8 Courses** | **₹54,00,000 INR** | $8 \times 150 \times ₹4,500 = ₹54\text{ Lakhs}$ |
| **Revenue for 30 Courses** | **₹2,02,50,000 INR** | $30 \times 150 \times ₹4,500 = ₹2.025\text{ Crores}$ |
| **Certification Quiz Threshold**| **70% Passing Mark** | 7 out of 10 questions correct |

---

## 2. Dual-Track CPM Critical Path Analysis

```mermaid
flowchart TD
    subgraph Software Track: 10.0 Weeks (Float = 5.5w)
        S1["Kickoff & Architecture (Wk 1-2.5)"] --> S2["Backend & Firebase (Wk 2.5-6.0)"]
        S2 --> S3["Portals & Video Player (Wk 6.0-9.0)"]
        S3 --> S4["QA & Automated BVA (Wk 9.0-10.0)"]
    end

    subgraph Content Production Track: 18.0 Weeks (CRITICAL PATH - Float = 0w)
        C1["Faculty 8-Course Recording (Wk 1-3)"] --> C2["8-Course Video Editing: 288h (Wk 3-7.8)"]
        C2 --> C3["Initial 8-Course Public Release (Wk 10.0)"]
        C2 --> C4["22-Course Video Editing: 792h (Wk 7.8-21.0)"]
        C4 --> C5["Full 30-Course Catalog Live (Wk 21.0)"]
    end

    S4 --> C3
```

---

## 3. Financial Revenue Modeling (₹2.02 Cr)

- **Single Course Annual Yield:** $150 \times ₹4,500 = \mathbf{₹6,75,000 \text{ INR}}$
- **Initial 8 Launch Courses:** $8 \times ₹6,75,000 = \mathbf{₹54,00,000 \text{ INR}}$
- **Complete 30 Courses Catalog:** $30 \times ₹6,75,000 = \mathbf{₹2,02,50,000 \text{ INR}}$

---

## 4. Software Requirements Specification (SRS) Summary
The platform complies with **IEEE Std 830-1998**, separating presentation views from modular application services and persistent cloud adapters.

---

## 5. 12 Functional Requirements (FR-01 to FR-12)
1. **FR-01 (30-Course Catalog):** Search and filter all 30 courses by category, level, and launch status.
2. **FR-02 (Multi-Role RBAC):** Authenticate Students, Faculty, and Admins via Firebase with 1-click test personas.
3. **FR-03 (Course Enrolment & Checkout):** Process ₹4,500 payment and generate unique Transaction IDs (`TXN-CC-2026-XXXX`).
4. **FR-04 (12-Hour Video Learning Studio):** HTML5 video streaming player with 4 modules and lesson playlists.
5. **FR-05 (Progress Telemetry):** Track completed lessons and auto-calculate 0–100% progress.
6. **FR-06 (10-Question Timed Exam):** 10 multiple-choice questions evaluating all course modules.
7. **FR-07 (70% Passing Threshold):** Automatic server-side evaluation; $\ge 70\%$ unlocks certificate.
8. **FR-08 (Verified Certificate Generation):** Issuance of Certificate (`CC-CERT-2026-SE108-XXXX`) with print/PDF export.
9. **FR-09 (Public Verification API):** Endpoint (`/api/certificates/:id`) validating authenticity.
10. **FR-10 (Faculty 12h Recording Studio):** Faculty recording log and 36h editing ratio calculator.
11. **FR-11 (Executive CPM Engine):** Dual-track visualizer comparing 18w content vs 10w software.
12. **FR-12 (Annual Revenue Tracker):** Real-time financial monitoring for ₹54L (8 courses) and ₹2.02 Cr (30 courses).

---

## 6. 8 Measurable Non-Functional Requirements (NFR-01 to NFR-08)
- **NFR-01 (Latency):** API response $< 200\text{ ms}$; page load $< 1.5\text{ s}$.
- **NFR-02 (Availability):** $\ge 99.9\%$ uptime.
- **NFR-03 (Security):** Firebase RBAC security rules on Firestore and Storage.
- **NFR-04 (Scalability):** 500 concurrent video streams and 1,000 simultaneous quiz evaluations.
- **NFR-05 (Accessibility):** WCAG 2.2 AA compliant contrast ($\ge 4.5:1$); SUS $\ge 80$.
- **NFR-06 (Idempotency):** 100% idempotent ₹4,500 payment transactions.
- **NFR-07 (Maintainability):** Loose coupling; cyclomatic complexity $\le 10$.
- **NFR-08 (Cross-Browser):** Full functionality on Chrome, Safari, Firefox, Edge, and mobile.

---

## 7. Architecture, Cohesion & Loose Coupling
- **Presentation Layer:** Lightweight responsive HTML5/CSS3/JavaScript SPA.
- **Application Service Layer:** `CourseService`, `AssessmentEngine`, `PaymentAdapter`, `SEPMCalculator`.
- **Cloud Layer:** Google Firebase (`coursecraft-c31f9`) with seamless local-first fallback.

---

## 8. UML Diagrams in Mermaid
*(See [UML.md](file:///Users/swetapopatkadam/Downloads/CourseCraft/docs/UML.md) for full Use Case, Class, Sequence, Activity, and State Machine diagrams).*

---

## 9. Boundary Value Analysis (BVA) & 70% Quiz Threshold
- **Score = 60% (6/10):** Below threshold $\rightarrow$ FAIL.
- **Score = 70% (7/10):** Exact threshold $\rightarrow$ **PASS (Certificate Issued)**.
- **Score = 80% (8/10):** Above threshold $\rightarrow$ **PASS (Certificate Issued)**.

---

## 10. Quality Metrics: Defect Density & DRE (94.12%)
- **Defect Density:** $3.88 \text{ defects / KLOC}$ across 4,380 lines of code.
- **Defect Removal Efficiency (DRE):**
  $$DRE = \frac{E}{E + D} = \frac{16}{16 + 1} = \mathbf{94.12\%}$$

---

## 11. Risk Management & RMMM Plan
- **Primary Risk (Content Production Bottleneck):** Mitigated by staged rollout of 8 courses at Week 10 with 5.2 weeks of float.
- **Secondary Risk (Faculty Delays):** Mitigated by 45-minute modular recording templates and quota tracking.
- **Security Risk (Quiz Answer Exposure):** Mitigated by strict server-side grading.

---

## 12. User Personas & 1-Click Access
- **Student:** Priya Sharma (`student@university.edu`)
- **Faculty:** Dr. Aarav Sharma (`faculty@university.edu`)
- **Admin:** Prof. Rajesh Nair (`admin@university.edu`)
