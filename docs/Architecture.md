# Software Architecture & Modular Design
## CourseCraft — Case Study No. 108

---

## 1. Architectural Style: Layered 3-Tier Architecture with Loose Coupling

CourseCraft employs a clean **3-Tier Layered Architecture** with high functional cohesion and loose inter-service coupling.

```mermaid
graph TD
    subgraph Presentation Layer
        UI_Web["Responsive SPA Views (HTML5 / Vanilla JS / CSS3)"]
        UI_Portal["Role-Based Portals (Student, Faculty, Admin)"]
    end

    subgraph Application Service Layer
        Svc_Course["CourseService (Catalog & Module Management)"]
        Svc_Auth["AuthService (RBAC & Identity Delegation)"]
        Svc_Assess["AssessmentEngine (10Q Quiz & 70% Evaluator)"]
        Svc_Cert["CertificateIssuer (Cryptographic Signatures)"]
        Svc_SEPM["SEPMCalculator (Critical Path & Revenue Engine)"]
    end

    subgraph Integration Adapters
        Adapter_Pay["PaymentAdapter (Idempotent ₹4,500 Handler)"]
        Adapter_Video["VideoDeliveryAdapter (Adaptive Streaming / Storage)"]
        Adapter_FB["FirebaseAdapter (Firestore & Firebase Auth)"]
    end

    subgraph Data & Cloud Persistence Layer
        DB_Firestore["Google Cloud Firestore (coursecraft-c31f9)"]
        DB_Local["Local-First JSON Cache / Persistence Fallback"]
        Storage_Media["Cloud Storage Buckets (Video Assets)"]
    end

    UI_Web --> Application Service Layer
    UI_Portal --> Application Service Layer
    Application Service Layer --> Integration Adapters
    Integration Adapters --> Data & Cloud Persistence Layer
```

---

## 2. High Cohesion & Loose Coupling Architectural Justification

### 2.1 Keeping Content Delivery and Payments Loosely Coupled
A core design requirement of Case Study No. 108 is ensuring that the **Payment System** (handling transactions, fees, and receipts) and **Content Delivery** (video streaming, lesson playlists, progress telemetry) operate independently without direct code dependencies:

1. **State-Based Asynchronous Barrier (`Enrollment` Record):**
   - The Payment subsystem has **zero knowledge** of video players, media URLs, streaming codecs, or quiz scoring engines. Its sole job is to validate student identities, charge the ₹4,500 fee idempotently, and emit a verified `PaymentTransaction` record.
   - The Content Delivery subsystem has **zero knowledge** of payment gateways, credit card rails, or pricing schemes. It simply queries the student's `Enrollment` state (`status === 'ACTIVE'`).
   - If a student is enrolled, the video delivery studio unlocks the 12-hour video curriculum. If payments were swapped (e.g., from Razorpay to Stripe, or fee waivers applied), the content delivery engine requires **zero code changes**.

2. **CDN / Storage Agnostic Media Referencing:**
   - Video lessons are addressed via abstract Uniform Resource Identifiers (URIs) rather than internal system pointers. The video streaming player consumes standard HTML5 media events (`timeupdate`, `ended`) and sends progress telemetry back to the API via decoupled REST endpoints (`POST /api/progress/update`).

3. **Fault Isolation:**
   - If the payment gateway suffers network latency or maintenance downtime, already-enrolled students can continue streaming their 12 hours of lectures and taking certification quizzes without any disruption.

---

### 2.2 Functional Cohesion of Each Module
Every component in CourseCraft exhibits **functional cohesion** — all elements within a module work toward a single, narrowly defined task:

- **`PaymentModule`**: Exclusively encapsulates fee deduction (₹4,500), unique transaction ID issuance (`TXN-CC-2026-XXXX`), idempotency verification, and invoice receipt formatting.
- **`VideoStudioModule`**: Exclusively manages video playlists, player controls, time-tracking markers, and personal scratchpad notes.
- **`AssessmentModule`**: Exclusively handles quiz question generation, countdown timers, server-side grading, and enforcement of the 70% passing threshold (7/10).
- **`CertificateModule`**: Exclusively formats university certificates, signs cryptographic IDs (`CC-CERT-2026-SE108-XXXX`), handles print/PDF styling, and exposes the public verification registry.
- **`FacultyFeedbackModule`**: Exclusively handles academic Q&A threads, student query posting, and instructor clarifications without entangling grading or payment workflows.
