# Decision Table for Certification & Enrolment Logic
## CourseCraft — Case Study No. 108

---

## 1. Decision Table: Course Certification Issuance

| Rule # | Condition 1: Enrolled in Course? | Condition 2: Video Progress = 100%? | Condition 3: Quiz Score $\ge 70\%$? | Action 1: Issue Verified Certificate | Action 2: Record Grade | Action 3: Prompt Lesson Review | Action 4: Prompt Enrolment |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **R1** | **Yes** | **Yes** | **Yes** | **EXECUTE** (Issue Cert) | **EXECUTE** | — | — |
| **R2** | **Yes** | **Yes** | **No** | — | **EXECUTE** | **EXECUTE** (Retake) | — |
| **R3** | **Yes** | **No** | **Yes** | — | **EXECUTE** (Hold) | **EXECUTE** (Finish 12h) | — |
| **R4** | **Yes** | **No** | **No** | — | — | **EXECUTE** | — |
| **R5** | **No** | — | — | — | — | — | **EXECUTE** (Enroll ₹4.5k)|

---

## 2. Decision Table: Payment & Enrolment Authorization

| Rule # | Student Logged In? | Payment Amount $= ₹4,500$? | Course Catalog Status = Active? | Authorize Enrolment | Generate TXN ID Receipt | Return Error Code |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **P1** | **Yes** | **Yes** | **Yes** | **YES** | **YES** (`TXN-CC-2026-XXXX`) | — |
| **P2** | **Yes** | **No** | **Yes** | **NO** | **NO** | `INVALID_FEE_AMOUNT` |
| **P3** | **No** | **Yes** | **Yes** | **NO** | **NO** | `AUTH_REQUIRED` |
| **P4** | **Yes** | **Yes** | **No (Archived)** | **NO** | **NO** | `COURSE_NOT_AVAILABLE` |
