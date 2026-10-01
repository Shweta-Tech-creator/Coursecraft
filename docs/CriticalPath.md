# Critical Path Method (CPM) & Bottleneck Analysis
## CourseCraft — Case Study No. 108

---

## 1. Executive Summary: The Content Production Bottleneck

In **Case Study No. 108**, the central project management finding is that **Content Production (18.0 Weeks)** controls the final delivery of the full 30-course catalog, **NOT Platform Software Development (10.0 Weeks)**.

```mermaid
flowchart TD
    subgraph Track 1: Platform Software Dev (Float = 5.5w)
        S1["Kickoff & Arch (Week 1-2.5)"] --> S2["Backend & Firebase (Week 2.5-6.0)"]
        S2 --> S3["Frontend Portals (Week 6.0-9.0)"]
        S3 --> S4["QA & Testing (Week 9.0-10.0)"]
    end

    subgraph Track 2: Content Production (CRITICAL PATH - Float = 0w)
        C1["Faculty 8-Course Recording (Week 1-3)"] --> C2["8-Course Editing: 288h (Week 3-7.8)"]
        C2 --> C3["Initial 8-Course Launch (Week 10.0)"]
        C2 --> C4["22-Course Editing: 792h (Week 7.8-21.0)"]
        C4 --> C5["Full 30-Course Catalog Ready (Week 21.0)"]
    end

    S4 --> C3
    style C1 fill:#f59e0b,stroke:#b45309,color:#fff
    style C2 fill:#f59e0b,stroke:#b45309,color:#fff
    style C4 fill:#ef4444,stroke:#991b1b,color:#fff
    style C5 fill:#ef4444,stroke:#991b1b,color:#fff
```

---

## 2. Quantitative Proof of Bottleneck

1. **Software Platform Development Duration:**
   $$\text{Duration}_{\text{software}} = 10.0 \text{ weeks}$$

2. **Video Content Post-Production Effort (30 Courses):**
   $$\text{Effort} = 30 \text{ courses} \times 12 \text{ hours} \times 3 \text{ (editing ratio)} = 1,080 \text{ effort hours}$$

3. **Combined Available Resource Bandwidth:**
   $$\text{Capacity} = 2 \text{ editors} \times 30 \text{ hours/week} = 60 \text{ hours/week}$$

4. **Time Required for 30 Courses Video Production:**
   $$\text{Duration}_{\text{content}} = \frac{1,080 \text{ hours}}{60 \text{ hours/week}} = 18.0 \text{ weeks}$$

5. **Schedule Variance & Slack:**
   $$\Delta T = 18.0 \text{ weeks (Content)} - 10.0 \text{ weeks (Software)} = +8.0 \text{ weeks}$$

---

## 3. Strategic Staged Release Strategy (Case Study 108 Solution)

To optimize student engagement and time-to-market without idling software engineering investments, the University Continuing Education Centre adopts a **Staged Phased Rollout**:

- **Phase 1 (Week 10 Launch):** Launch the platform software with the initial **8 ready courses** ($288 \text{ hours} \div 60\text{h/wk} = 4.8 \text{ weeks of editing}$, completed well in advance of Week 10). Projected annual revenue from Phase 1 is **₹54,00,000**.
- **Phase 2 (Continuous Weekly Releases):** Release 2 newly edited courses per week from Week 11 through Week 18.
- **Phase 3 (Week 18+ Catalog Completion):** All **30 short courses** live in production, achieving full annual revenue capacity of **₹2,02,50,000**.
