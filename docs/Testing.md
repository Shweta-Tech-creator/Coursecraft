# Software Testing, BVA & Equivalence Partitioning
## CourseCraft — Case Study No. 108

---

## 1. Boundary Value Analysis (BVA): 70% Certification Quiz Threshold

The certification examination comprises 10 multiple-choice questions. A score of $\ge 70\%$ (7 out of 10 correct answers) is strictly required to pass and receive a verified University Certificate.

### 1.1 Input Variable: Correct Answers ($X \in [0, 10]$)
- **Valid Passing Boundary Range:** $X \ge 7$ ($70\% \text{ to } 100\%$)
- **Failing Boundary Range:** $X \le 6$ ($0\% \text{ to } 60\%$)

| Test Case ID | Input Score ($X$) | Score % | Test Boundary Condition | Expected Outcome | System Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BVA-01** | $X = 0$ | 0% | Extreme Minimum Boundary | **FAIL** | No certificate; prompt module review |
| **TC-BVA-02** | $X = 6$ | 60% | Just Below Passing Threshold ($7 - 1$) | **FAIL** | Result: 60%; prompt retake option |
| **TC-BVA-03** | $X = 7$ | 70% | **Exact Passing Threshold Boundary** | **PASS** | Issue Certificate `CC-CERT-2026-SE108-XXXX` |
| **TC-BVA-04** | $X = 8$ | 80% | Just Above Passing Threshold ($7 + 1$) | **PASS** | Issue Certificate with Distinction |
| **TC-BVA-05** | $X = 10$ | 100% | Extreme Maximum Boundary | **PASS** | Issue Certificate with 100% Score |

### 1.2 Boundary Value Analysis (BVA): Course Completion Percentage ($P \in [0\%, 100\%]$)
Full curriculum eligibility requires streaming all 12 hours across 4 modules ($P = 100\%$) to unlock the final certification exam.

| Test Case ID | Input Progress ($P$) | Boundary Classification | Expected Outcome | System Validation |
| :--- | :--- | :--- | :--- | :--- |
| **TC-BVA-P01** | $P = -1\%$ | Below Valid Range ($< 0\%$) | **REJECT** | Clamped to 0% / HTTP 400 Bad Request |
| **TC-BVA-P02** | $P = 0\%$ | **Minimum Valid Boundary** | **ACCEPT** | State: `NOT_STARTED` (0 / 12 Hours Watched) |
| **TC-BVA-P03** | $P = 1\%$ | Just Above Minimum Boundary | **ACCEPT** | State: `IN_PROGRESS` (Active Telemetry Sync) |
| **TC-BVA-P04** | $P = 99\%$ | Just Below Completion Threshold | **ACCEPT** | State: `IN_PROGRESS` (Exam Locked: Complete 100%) |
| **TC-BVA-P05** | $P = 100\%$ | **Exact Completion Boundary** | **ACCEPT** | State: `CONTENT_COMPLETED` (10Q Exam Unlocked) |
| **TC-BVA-P06** | $P = 101\%$ | Above Valid Range ($> 100\%$) | **REJECT** | Clamped to 100% (Prevents overflow) |

---

## 2. Equivalence Class Partitioning (EP): Course Enrollment Fee (₹4,500 INR)

| Partition ID | Input Condition (Payment Amount) | Class Validity | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **EP-01** | Amount $= ₹4,500 \text{ INR}$ | **Valid** | Transaction Approved; Enrollment Initialized (`TXN-CC-2026-XXXXXX`) |
| **EP-02** | Amount $< ₹4,500$ (e.g. ₹0, ₹2,500) | **Invalid** | Transaction Rejected: `INSUFFICIENT_FEE_AMOUNT` |
| **EP-03** | Amount $> ₹4,500$ (e.g. ₹5,000) | **Invalid** | Transaction Rejected: `FEE_MISMATCH_ERROR` |
| **EP-04** | Amount is non-numeric or null | **Invalid** | HTTP 400 Bad Request: `INVALID_PAYMENT_PAYLOAD` |

---

## 3. End-to-End System Test Suite

| Test Case ID | Test Objective | Test Steps | Expected Result | Pass/Fail Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-E2E-01** | Catalog Search & Filter | Filter courses by "Computer Science" | Returns CSE-101, SE-202, etc. | **PASS** |
| **TC-E2E-02** | 1-Click Student Login | Click "Priya Sharma (Student)" | Switches session to Student persona | **PASS** |
| **TC-E2E-03** | ₹4,500 Enrolment Checkout | Enroll in CC-104 | Generates `TXN-CC-2026-XXXX` & updates enr | **PASS** |
| **TC-E2E-04** | Video Telemetry Update | Complete Lesson 1 of CC-101 | Progress bar increases; checkmark active | **PASS** |
| **TC-E2E-05** | 10Q Quiz Scoring $\ge 70\%$ | Submit 9 correct answers on CC-101 | Score: 90%; Certificate ID generated | **PASS** |
| **TC-E2E-06** | Certificate Verification | Query `/api/certificates/CC-CERT-2026-SE108-8842` | Status: `VERIFIED_ACTIVE` returned | **PASS** |
