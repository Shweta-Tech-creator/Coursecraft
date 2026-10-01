# Software Project Estimation & Mathematical Model
## CourseCraft — Case Study No. 108

---

## 1. Case Study 108 Content Production Mathematical Model

### 1.1 Fundamental Parameters
- **Total Planned Short Courses ($N_{\text{total}}$):** 30 Courses
- **Initial Launch Cohort ($N_{\text{launch}}$):** 8 Courses
- **Remaining Pipeline ($N_{\text{pipeline}}$):** 22 Courses
- **Recorded Video Content per Course ($H_{\text{content}}$):** 12 Hours
- **Recording to Editing Ratio ($R_{\text{edit}}$):** $3 : 1$ (3 editing hours for every 1 content hour)
- **Video Editors Count ($E$):** 2 Editors
- **Weekly Dedicated Hours per Editor ($W_{\text{editor}}$):** 30 Hours / Week
- **Software Development Timeline ($T_{\text{software}}$):** 10.0 Weeks
- **Course Enrollment Fee ($F$):** ₹4,500 INR
- **Annual Enrolments per Course ($S_{\text{annual}}$):** 150 Students / Course / Year

---

### 1.2 Mathematical Derivations & Calculations

#### Equation 1: Effort Hours per Course ($E_{\text{course}}$)
$$E_{\text{course}} = H_{\text{content}} \times R_{\text{edit}} = 12 \text{ hours} \times 3 = 36 \text{ effort hours / course}$$

#### Equation 2: Total Effort for Initial 8 Launch Courses ($E_{8}$)
$$E_{8} = 8 \times E_{\text{course}} = 8 \times 36 = 288 \text{ effort hours}$$

#### Equation 3: Total Effort for All 30 Planned Courses ($E_{30}$)
$$E_{30} = 30 \times E_{\text{course}} = 30 \times 36 = 1,080 \text{ effort hours}$$

#### Equation 4: Combined Weekly Editing Bandwidth ($C_{\text{weekly}}$)
$$C_{\text{weekly}} = E \times W_{\text{editor}} = 2 \text{ editors} \times 30 \text{ hours/week} = 60 \text{ hours/week}$$

#### Equation 5: Editing Duration for 8 Courses ($D_{8}$)
$$D_{8} = \frac{E_{8}}{C_{\text{weekly}}} = \frac{288 \text{ hours}}{60 \text{ hours/week}} = 4.8 \text{ weeks}$$

#### Equation 6: Editing Duration for All 30 Courses ($D_{30}$)
$$D_{30} = \frac{E_{30}}{C_{\text{weekly}}} = \frac{1,080 \text{ hours}}{60 \text{ hours/week}} = 18.0 \text{ weeks}$$

---

## 2. Schedule Comparison & Critical Path Summary

| Project Track | Work Quantity | Effort Hours | Weekly Capacity | Duration | Target Launch |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Track 1: Platform Software Dev** | Full Architecture & Codebase | 400 Dev Hours | 40 hrs/wk | **10.0 Weeks** | Ready at Week 10 |
| **Track 2A: 8 Launch Courses** | 8 Courses (96h video) | 288 Edit Hours | 60 hrs/wk | **4.8 Weeks** | Ready at Week 4.8 |
| **Track 2B: Full 30 Courses** | 30 Courses (360h video) | 1,080 Edit Hours | 60 hrs/wk | **18.0 Weeks** | Ready at Week 18.0 |

> **Key Architectural Insight:**  
> The software platform is completed at **Week 10.0**. The initial 8 courses complete editing at **Week 4.8** (giving 5.2 weeks of float), allowing the university to launch a fully-featured, 8-course catalog at Week 10.0. However, the complete 30-course launch is strictly constrained by **content production (18.0 weeks)**, making content the critical path bottleneck for the overall project.

---

## 3. Financial Projections & Revenue Modeling

- **Annual Revenue per Course ($R_{\text{course}}$):**
  $$R_{\text{course}} = 150 \text{ enrolments} \times ₹4,500 = ₹6,75,000 \text{ INR / course / year}$$

- **Annual Revenue for 8 Launch Courses ($R_{8}$):**
  $$R_{8} = 8 \times ₹6,75,000 = ₹54,00,000 \text{ INR / year} \quad (\approx ₹54 \text{ Lakhs})$$

- **Annual Revenue for 30 Full Catalog Courses ($R_{30}$):**
  $$R_{30} = 30 \times ₹6,75,000 = ₹2,02,50,000 \text{ INR / year} \quad (\approx ₹2.025 \text{ Crores})$$

---

## 4. Fundamental Estimation Assumptions

All quantitative calculations in this model rely on the following explicit engineering and operational assumptions:
1. **Constant Editorial Ratio ($3 : 1$):** Each hour of recorded lecture requires exactly 3 hours of editorial mastering, cutting, audio cleanup, and graphics insertion ($12\text{h} \times 3 = 36\text{h}$).
2. **Dedicated Editor Bandwidth:** Both video editors work uninterrupted for 30 productive hours per week ($2 \times 30 = 60\text{ hours/week}$), assuming zero unplanned attrition, illness, or equipment failure.
3. **Faculty Availability & Pipeline Handoff:** Faculty instructors record and deliver all raw 12-hour video assets sequentially without blocking the post-production queue.
4. **Uniform Course Sizing:** Every course strictly adheres to the 12-hour standardized curriculum across 4 modules without scope creep.
5. **Stable Pricing & Adoption:** The enrollment fee remains fixed at ₹4,500 without discounts or promotional waivers, and target enrollment is evenly distributed at 150 students/course/year.

---

## 5. Why This Result is an "Estimate" and Not a "Promise"

In Software Engineering & Project Management (SEPM), a fundamental distinction exists between an **estimate** and a **promise (commitment)**:

> *"An estimate is a probabilistic projection of cost, effort, or schedule based on documented assumptions and incomplete historical data. A promise is a contractual commitment to deliver a fixed scope by a specific date, regardless of encountered variance."*

### 5.1 The Cone of Uncertainty
At project kickoff (Week 0 to Week 2), the project operates within the early stages of Steve McConnell’s **Cone of Uncertainty**, where schedule variance can fluctuate by up to $\pm 25\%$ to $50\%$. The $18.0\text{-week}$ content figure represents the nominal (expected) duration, not a guaranteed upper bound.

### 5.2 Sources of Variance in Academic Media Production
1. **Faculty Retakes & Re-recording Overhead:** Unlike professional actors, university professors balancing teaching commitments may require multiple takes, script revisions, or re-recordings for technical demos, inflating the raw recording ratio.
2. **Cognitive Domain Complexity:** Advanced courses (e.g., *Quantum Computing* or *Cyber Hacking*) require significantly more animations, syntax highlighting, and post-production callouts than introductory courses, causing the editing ratio to exceed $3:1$.
3. **Human & Resource Constraints (Parkinson's Law & Student's Syndrome):** Editors may face machine rendering bottlenecks or technical downtime that reduces productive output below 30 hours/week.
4. **Market & Enrollment Variance:** Achieving 150 enrollments per course ($₹2.025\text{ Cr}$) depends on student market demand, institutional reputation, and employer recognition — factors completely outside software engineering control.

Therefore, $18.0\text{ weeks}$ and $₹2.025\text{ Cr}$ serve as **probabilistic baselines for decision-making** (supporting the Director's phased launch of 8 courses at Week 10) rather than a rigid contractual guarantee.
