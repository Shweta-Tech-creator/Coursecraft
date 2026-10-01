# Project Scheduling & Network Diagram
## CourseCraft — Case Study No. 108

---

## 1. Activity Schedule & Precedence Table

| Activity ID | Activity Description | Predecessors | Duration (Weeks) | Early Start (ES) | Early Finish (EF) | Late Start (LS) | Late Finish (LF) | Total Float ($TF = LS - ES$) | Free Float (FF) | On Critical Path? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | Project Kickoff & SRS Formulation | — | 1.0 | 0.0 | 1.0 | 0.0 | 1.0 | **0.0** | 0.0 | **YES** |
| **B** | Software Architecture & DB Design | A | 1.5 | 1.0 | 2.5 | 6.5 | 8.0 | **5.5** | 0.0 | **NO** |
| **C** | Backend API & Firebase Integration | B | 3.5 | 2.5 | 6.0 | 8.0 | 11.5 | **5.5** | 0.0 | **NO** |
| **D** | Frontend Portals (Student/Faculty/Admin)| C | 3.0 | 6.0 | 9.0 | 11.5 | 14.5 | **5.5** | 0.0 | **NO** |
| **E** | Software QA & Integration Testing | D | 1.0 | 9.0 | 10.0 | 14.5 | 15.5 | **5.5** | 0.0 | **NO** |
| **F** | Faculty Recording: 8 Launch Courses | A | 2.0 | 1.0 | 3.0 | 1.0 | 3.0 | **0.0** | 0.0 | **YES** |
| **G** | Video Editing: 8 Launch Courses (288h) | F | 4.8 | 3.0 | 7.8 | 3.0 | 7.8 | **0.0** | 0.0 | **YES** |
| **H** | QA & Publishing: 8 Launch Courses | G, E | 2.2 | 10.0 | 12.2 | 10.0 | 12.2 | **0.0** | 0.0 | **YES** |
| **I** | Video Editing: Remaining 22 Courses (792h)| G | 13.2 | 7.8 | 21.0 | 7.8 | 21.0 | **0.0** | 0.0 | **YES** |
| **J** | Final Project Closeout & 30-Course Catalog| I, H | 1.0 | 21.0 | 22.0 | 21.0 | 22.0 | **0.0** | 0.0 | **YES** |

---

## 2. CPM Forward and Backward Pass Analysis

### 2.1 Forward Pass (Determining Early Dates)
- $ES(A) = 0.0 \implies EF(A) = 0.0 + 1.0 = 1.0$
- $ES(B) = EF(A) = 1.0 \implies EF(B) = 1.0 + 1.5 = 2.5$
- $ES(C) = EF(B) = 2.5 \implies EF(C) = 2.5 + 3.5 = 6.0$
- $ES(D) = EF(C) = 6.0 \implies EF(D) = 6.0 + 3.0 = 9.0$
- $ES(E) = EF(D) = 9.0 \implies EF(E) = 9.0 + 1.0 = 10.0$ *(Software Ready at Week 10)*
- $ES(F) = EF(A) = 1.0 \implies EF(F) = 1.0 + 2.0 = 3.0$
- $ES(G) = EF(F) = 3.0 \implies EF(G) = 3.0 + 4.8 = 7.8$ *(8 Courses Edited)*
- $ES(I) = EF(G) = 7.8 \implies EF(I) = 7.8 + 13.2 = 21.0$ *(All 30 Courses Edited)*

### 2.2 Backward Pass (Determining Late Dates & Float)
- Total Float for Software Track $(B \rightarrow C \rightarrow D \rightarrow E)$:
  $$TF_{\text{Software}} = 15.5 - 10.0 = 5.5 \text{ weeks of float}$$
- Total Float for Content Track $(F \rightarrow G \rightarrow I)$:
  $$TF_{\text{Content}} = 0.0 \text{ weeks (Critical Path)}$$
