# Project Risk Register
## CourseCraft — Case Study No. 108

---

## 1. Risk Evaluation Matrix

| Risk ID | Risk Description | Category | Probability ($P \in [1-5]$) | Impact ($I \in [1-5]$) | Risk Exposure ($P \times I$) | Severity Level | Risk Owner |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **RSK-01** | **Content Production Bottleneck:** Video editing (1,080h) exceeds software timeline (10w) by 8 weeks. | Schedule / Resource | 5 | 5 | **25** | **Critical (P0)** | Project Manager |
| **RSK-02** | **Faculty Video Recording Delays:** Instructors fail to record 12 hours of content on schedule. | Resource / External | 4 | 4 | **16** | **High (P1)** | Dean of CEC |
| **RSK-03** | **Video CDN Bandwidth & Latency:** High concurrency video streaming causes buffering. | Performance | 3 | 4 | **12** | **Medium (P2)** | Cloud Architect |
| **RSK-04** | **Payment Gateway Webhook Drop:** Asynchronous payment confirmation packet loss. | Integration | 2 | 5 | **10** | **Medium (P2)** | Backend Lead |
| **RSK-05** | **Quiz Cheating / Answer Leakage:** Answer keys exposed in frontend client payload. | Security | 2 | 4 | **8** | **Low (P3)** | Security Engineer |
