# Non-Functional Requirements (NFR-01 to NFR-08)
## CourseCraft — Online Course Platform (Case Study No. 108)

| NFR ID | Category | Requirement Description | Measurable Metric / Target Benchmark |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Performance (Latency)** | The web application and REST API endpoints shall respond swiftly under standard university traffic. | Page load time $< 1.5$ seconds on broadband; API endpoint latency $< 200$ ms at 95th percentile ($p95$). |
| **NFR-02** | **Availability & Uptime** | The learning portal and video delivery service shall maintain high availability during academic semesters. | $\ge 99.9\%$ uptime ($< 8.7$ hours of unplanned downtime per year). |
| **NFR-03** | **Security & Access Control** | User identity, course payments, and certificate registries shall be protected using Role-Based Access Control (RBAC). | Firebase Security Rules enforced on all Firestore read/write operations; zero unauthorized data access. |
| **NFR-04** | **Scalability & Concurrency** | The platform architecture shall support concurrent student sessions across courses during peak exam cycles. | Minimum 500 simultaneous active video streams and 1,000 concurrent quiz assessments without degradation. |
| **NFR-05** | **Usability & Accessibility** | The user interface shall be intuitive, responsive across devices, and accessible to learners with disabilities. | System Usability Scale (SUS) score $\ge 80$; WCAG 2.2 Level AA compliance (contrast ratio $\ge 4.5:1$). |
| **NFR-06** | **Reliability & Idempotency** | Payment transactions (₹4,500) and quiz grading submissions shall be strictly idempotent to prevent duplicate charges or double scoring. | $100\%$ idempotent payment handling; zero double-billing incidents in automated test suites. |
| **NFR-07** | **Maintainability & Modularity** | System modules (Presentation, Business Service, Persistence, Video Streaming) shall exhibit high cohesion and loose coupling. | Cyclomatic complexity per function $\le 10$; modular code separation enabling independent service refactoring. |
| **NFR-08** | **Portability & Cross-Browser** | The application shall function consistently across all modern desktop, tablet, and mobile browsers. | Full functional fidelity on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, and mobile iOS/Android browsers. |
