# Functional Requirements Specification (FR-01 to FR-12)
## CourseCraft — Online Course Platform (Case Study No. 108)

| Req ID | Requirement Title | Description & Acceptance Criteria | Priority | Role |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **30-Course Catalog & Search** | The system shall provide a catalog of 30 university short courses (8 launch ready, 22 in production/planned). Users can search by keyword, course code, and filter by category and status. | **Must Have** | Public / All |
| **FR-02** | **Multi-Role Authentication & Personas** | The system shall authenticate Students, Faculty, and Administrators using Firebase Auth and provide 1-click instant demo personas for rapid academic evaluation. | **Must Have** | All Roles |
| **FR-03** | **Course Enrolment & Fee Checkout** | The system shall allow authenticated students to enroll in any course, executing a demo payment transaction of ₹4,500 INR, generating a unique Transaction ID (`TXN-CC-2026-XXXXXX`). | **Must Have** | Student |
| **FR-04** | **12-Hour Video Learning Studio** | The system shall provide an HTML5 video learning studio supporting 4 modules (12 hours recorded content), lesson playlists, and timestamp markers. | **Must Have** | Student |
| **FR-05** | **Video Progress Tracking & Sync** | The system shall record completed lessons and calculate percentage progress ($0-100\%$), synchronizing progress with Firestore and local persistence. | **Must Have** | Student |
| **FR-06** | **10-Question Certification Exam** | The system shall present a timed 10-question multiple-choice assessment per course covering all 4 modules. | **Must Have** | Student |
| **FR-07** | **70% Passing Threshold Evaluation** | The system shall automatically evaluate submitted answers. Scores $\ge 70\%$ (7/10) trigger certificate issuance; scores $< 70\%$ prompt diagnostic feedback and retake options. | **Must Have** | System |
| **FR-08** | **Verified Certificate Generation** | Upon passing with $\ge 70\%$, the system shall generate a cryptographically verifiable Certificate containing Certificate ID, student name, score, issue date, instructor signature, and print/PDF support. | **Must Have** | Student / System |
| **FR-09** | **Public Certificate Verification** | The system shall provide a public verification route (`/api/certificates/:id`) allowing employers to verify authenticity against the university database. | **Should Have** | Public / Employer |
| **FR-10** | **Faculty 12h Recording Studio** | The system shall allow faculty to track 12-hour recording progress, calculate editing hours ($12 \times 3 = 36$ hours), and upload lesson curricula. | **Must Have** | Faculty |
| **FR-11** | **Executive CPM Bottleneck Engine** | The system shall visualize the dual-track project schedule (10.0 weeks software vs 18.0 weeks content editing for 30 courses) and highlight critical path constraints. | **Must Have** | Administrator |
| **FR-12** | **Annual Financial Revenue Tracker** | The system shall calculate annual projected revenue based on ₹4,500 per enrolment and 150 students/course/year (₹54,00,000 for 8 courses; ₹2,02,50,000 for 30 courses). | **Must Have** | Administrator |
