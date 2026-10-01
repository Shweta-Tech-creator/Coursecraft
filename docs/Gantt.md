# Gantt Chart (Dual-Track Schedule)
## CourseCraft — Case Study No. 108

The Gantt chart illustrates the concurrent execution of **Track 1 (Platform Software Engineering)** and **Track 2 (Video Content Production)** across 22 total calendar weeks.

```mermaid
gantt
    title CourseCraft Dual-Track Project Schedule (Case Study 108)
    dateFormat  YYYY-MM-DD
    axisFormat  Wk %W

    section Project Management
    Project Kickoff & SRS IEEE 830     :done, pm1, 2026-01-01, 7d
    MoSCoW & Traceability Matrix       :done, pm2, after pm1, 5d

    section Track 1: Platform Software (10w)
    Architecture & Firebase Setup       :done, sw1, 2026-01-08, 10d
    Backend REST API & DB Services     :done, sw2, after sw1, 21d
    Frontend Portals (Student/Fac/Admin):done, sw3, after sw2, 18d
    Testing & 70% BVA QA Suites        :active, sw4, after sw3, 7d
    Software Platform Complete (Wk 10) :milestone, sw_ready, 2026-03-12, 0d

    section Track 2: Content Production (18w)
    8 Launch Courses Recording (96h)   :done, cn1, 2026-01-08, 14d
    8 Launch Courses Editing (288h)    :done, cn2, after cn1, 33d
    8 Courses Ready for Launch (Wk 4.8):milestone, c8_ready, 2026-02-24, 0d
    Initial 8-Course Public Release    :crit, active, rel1, 2026-03-12, 14d
    Remaining 22 Courses Editing (792h):crit, active, cn3, after cn2, 92d
    Full 30-Course Catalog Complete    :milestone, crit, c30_ready, 2026-05-30, 0d
```
