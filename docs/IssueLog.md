# Formal Issue Log & Resolution Tracker
## CourseCraft — Case Study No. 108

---

| Issue ID | Date Logged | Severity | Issue Description | Root Cause | Resolution / Workaround | Status |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **ISS-01** | 2026-01-15 | **High** | 18-week editing duration threatens to delay Week 10 platform rollout. | Fixed 2-editor capacity (60h/wk) for 1,080h editing workload. | Architected Staged Launch: Initial 8 courses launch at Week 10 (4.8w editing); 22 remaining roll out continuously. | **CLOSED** |
| **ISS-02** | 2026-02-02 | **Medium** | Air-gapped testing environment failed on Firebase cloud queries. | Firestore requires live web connectivity. | Built seamless local-first persistence layer fallback in `CourseCraftFirebase`. | **CLOSED** |
| **ISS-03** | 2026-02-18 | **Medium** | Quiz score boundary at 69.9% rounded down incorrectly. | Floating point division in JavaScript. | Wrapped calculation in `Math.round((correct / total) * 100)` and enforced discrete question integer thresholds. | **CLOSED** |
| **ISS-04** | 2026-03-01 | **Low** | Certificate layout overflowed print boundary on A4 page. | Fixed CSS pixel widths without print media query. | Added `@media print` CSS rules enforcing 100% viewport fit and hiding browser chrome. | **CLOSED** |
