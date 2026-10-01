# Defect Density Metrics & Calculations
## CourseCraft — Case Study No. 108

---

## 1. Defect Density Formula

Defect Density measures the number of confirmed software defects per Thousand Lines of Code (KLOC):

$$\text{Defect Density} = \frac{\text{Total Confirmed Defects Found}}{\text{Total Size of Software in KLOC}}$$

---

## 2. CourseCraft Codebase Measurement

| Module / Component | Language | Lines of Code (LOC) | KLOC ($LOC / 1000$) | Pre-Release Defects Found | Post-Release Defects (Target) | Defect Density (Defects/KLOC) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend REST Server (`server.js`)** | JavaScript (Node.js) | 520 | 0.520 | 4 | 0 | 7.69 |
| **Assessment & Grading Engine** | JavaScript | 340 | 0.340 | 2 | 0 | 5.88 |
| **Course & Progress Service Layer** | JavaScript | 460 | 0.460 | 3 | 0 | 6.52 |
| **SEPM Calculator & CPM Engine** | JavaScript | 210 | 0.210 | 1 | 0 | 4.76 |
| **Frontend UI Portals & Views** | HTML5 / CSS3 / JS | 2,850 | 2.850 | 6 | 1 | 2.45 |
| **Total Full-Stack Platform** | Multi | **4,380** | **4.380** | **16** | **1** | **3.88 Defects / KLOC** |

---

## 3. Industry Benchmark Comparison

- **High-Risk Commercial Software Benchmark:** $5.0 - 10.0 \text{ defects / KLOC}$
- **CourseCraft Measured Pre-Release Density:** **$3.88 \text{ defects / KLOC}$** (Achieved through automated BVA and modular separation).
- **Target Post-Release Production Density:** **$< 0.5 \text{ defects / KLOC}$**.
