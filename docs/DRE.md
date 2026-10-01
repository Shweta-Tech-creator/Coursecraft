# Defect Removal Efficiency (DRE)
## CourseCraft — Case Study No. 108

---

## 1. DRE Mathematical Formula

Defect Removal Efficiency (DRE) is an essential Quality Assurance metric indicating the percentage of defects filtered out before software release:

$$DRE = \frac{E}{E + D} \times 100\%$$

Where:
- $E$ = Number of defects found and removed **internally before software delivery** (Testing / QA phases).
- $D$ = Number of defects detected **by users after release** (Production defects).

---

## 2. DRE Calculation for CourseCraft Platform Release

### 2.1 Empirical QA Data
- **Pre-Release Internal Defects ($E$):**
  - Requirements & SRS Review: 3 defects
  - Code Review & Static Analysis: 4 defects
  - Automated BVA & Unit Testing: 5 defects
  - Integration & Regression Testing: 4 defects
  - **Total Pre-Release Defects Removed ($E$):** **16 defects**

- **Post-Release / Acceptance Testing Defects ($D$):**
  - Minor UI alignment quirk on mobile Safari: 1 defect
  - **Total Post-Release Defects ($D$):** **1 defect**

### 2.2 Numerical Computation
$$DRE = \frac{16}{16 + 1} \times 100\% = \frac{16}{17} \times 100\% = \mathbf{94.12\%}$$

---

## 3. Evaluation & Quality Gate Assessment
A DRE of **$94.12\%$** exceeds the standard IEEE / SEPM academic threshold of $90.0\%$, certifying that the CourseCraft academic prototype is robust, reliable, and ready for production deployment across the University Continuing Education Centre.
