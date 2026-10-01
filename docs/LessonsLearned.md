# Retrospective & Lessons Learned Register
## CourseCraft — Case Study No. 108

---

## 1. Key Lessons Learned Across Project Lifecycle

### 1.1 Dual-Track Software & Content Alignment
- **Insight:** In digital learning platforms, software engineering velocity often outpaces media content production. Treating content editing as an unmonitored external dependency causes massive launch delays.
- **Action for Future Projects:** Always formulate Critical Path Method (CPM) network diagrams that combine both software sprints and media asset editing pipelines from Day 1.

### 1.2 Modular Decoupling for High Reliability
- **Insight:** Decoupling payment adapters and video streaming services from core student authentication prevented service cascades and enabled rapid testing with demo personas.
- **Action for Future Projects:** Maintain strict interface boundaries and provide offline-capable fallbacks for cloud databases.

### 1.3 Strict Boundary Value Quality Assurance
- **Insight:** Mathematical boundaries in academic grading (such as the 70% threshold) require precise integer boundaries ($X=6 \implies \text{Fail}$, $X=7 \implies \text{Pass}$) to prevent disputed certificate issuance.
- **Action for Future Projects:** Formulate formal BVA test suites prior to implementing scoring logic.
