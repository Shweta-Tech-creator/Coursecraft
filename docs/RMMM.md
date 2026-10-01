# Risk Mitigation, Monitoring, and Management (RMMM) Plan
## CourseCraft — Case Study No. 108

---

## 1. Top Risk 1: Video Content Production Bottleneck (RSK-01)
- **Risk Characterization:** 30 courses $\times$ 36 editing hours $= 1,080$ hours. 2 editors working 60h/week combined require **18.0 weeks**, exceeding software dev by **8.0 weeks**.
- **Mitigation:**
  - Adopt a **Staged Phased Release**: Launch the initial **8 ready courses** at Week 10 ($288 \text{ hours} \div 60\text{h/wk} = 4.8 \text{ weeks of editing}$, with 5.2 weeks of float).
  - Secure an contingency budget to onboard 2 temporary contract video editors if pipeline falls behind.
- **Monitoring:** Track weekly completed editing hours against the 60h/week milestone in the Executive Dashboard.
- **Management (Contingency Action):** If editing lags below 50h/week, activate contract editors or fast-track remaining courses in rolling batches.

---

## 2. Top Risk 2: Faculty Video Recording Delays (RSK-02)
- **Risk Characterization:** Faculty professors face heavy academic lecture loads, delaying the delivery of raw 12-hour video recordings.
- **Mitigation:**
  - Create standardized studio recording templates and slide decks to minimize faculty preparation time.
  - Structure recordings into bite-sized 45-minute sessions.
- **Monitoring:** Faculty studio logging dashboard monitors recorded hours vs 12-hour quota per course.
- **Management:** Reassign course leads or pair professors with graduate teaching assistants for co-instruction.

---

## 3. Top Risk 3: Client-Side Quiz Answer Leakage (RSK-05)
- **Risk Characterization:** Storing correct answer indices in client-side JavaScript allows students to inspect HTML/DOM and achieve an unearned 70% passing score.
- **Mitigation:**
  - **Server-Side Grading Engine**: The `/api/courses/:id/quiz` endpoint strips `correctIndex` from response payloads.
  - Verification and scoring strictly occur on the Node.js backend (`/api/courses/:id/quiz/submit`).
- **Monitoring:** Audit logs flag any student completing 10 questions in under 15 seconds.
- **Management:** Invalidate any certificate generated via anomalous submission patterns and trigger immediate re-assessment.
