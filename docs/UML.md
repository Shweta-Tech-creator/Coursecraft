# Unified Modeling Language (UML) Diagrams
## CourseCraft — Case Study No. 108

---

### 1. Use Case Diagram
Visualizes the primary interactions between the actors (Student, Faculty, Administrator, Employer) and CourseCraft platform subsystems.

```mermaid
flowchart LR
    subgraph Actors
        Student["🎓 Student"]
        Faculty["👨‍🏫 Faculty Instructor"]
        Admin["🛡️ University Administrator"]
        Employer["🏢 Employer / Verifier"]
    end

    subgraph CourseCraft System
        UC1["Browse 30-Course Catalog"]
        UC2["Enroll & Pay ₹4,500 Fee"]
        UC3["Stream 12h Video Lessons"]
        UC4["Take 10Q Quiz (70% Pass Threshold)"]
        UC5["View & Print Verified Certificate"]
        UC6["Log 12h Video Recording Quotas"]
        UC7["Monitor 36h Editing Ratio"]
        UC8["Manage 30-Course Pipeline"]
        UC9["Analyze 18w CPM Bottleneck"]
        UC10["Verify Certificate Authenticity"]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5

    Faculty --> UC1
    Faculty --> UC6
    Faculty --> UC7

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10

    Employer --> UC10
```

---

### 2. Class Diagram
Represents the object-oriented structure, domain models, entity relationships, and operations.

```mermaid
classDiagram
    class User {
        +String uid
        +String name
        +String email
        +String role
        +String avatar
        +login()
        +logout()
    }

    class Student {
        +List~Enrollment~ enrolledCourses
        +List~Payment~ payments
        +enrollCourse(courseId)
        +updateVideoProgress(lessonId, percent)
        +attemptQuiz(answers)
    }

    class Faculty {
        +String department
        +List~String~ assignedCourses
        +Map recordingStatus
        +logRecordingHours(hours)
        +updateCurriculum(modules)
    }

    class Administrator {
        +List~String~ permissions
        +reviewBottleneckSchedule()
        +trackFinancialMetrics()
    }

    class Course {
        +String id
        +String code
        +String title
        +String category
        +Number price
        +Number durationHours
        +Number editingHoursRequired
        +String status
        +List~Module~ modules
        +List~QuizQuestion~ quiz
    }

    class Module {
        +String id
        +String title
        +String duration
        +List~Lesson~ lessons
    }

    class Lesson {
        +String id
        +String title
        +String duration
        +String videoUrl
    }

    class Enrollment {
        +String courseId
        +DateTime enrolledAt
        +Number progressPercent
        +List~String~ completedLessons
        +Number quizScore
        +Boolean quizPassed
        +String certificateId
    }

    class Certificate {
        +String certificateId
        +String studentId
        +String studentName
        +String courseTitle
        +Number scorePercent
        +String issueDate
        +String instructorName
        +String deanName
        +String verificationStatus
        +verify()
        +printPDF()
    }

    class Payment {
        +String transactionId
        +String courseId
        +Number amount
        +String currency
        +String status
        +DateTime timestamp
    }

    User <|-- Student
    User <|-- Faculty
    User <|-- Administrator
    Student "1" *-- "many" Enrollment
    Student "1" *-- "many" Payment
    Course "1" *-- "4" Module
    Module "1" *-- "4" Lesson
    Enrollment "1" o-- "0..1" Certificate
```

---

### 3. Sequence Diagram: Enrol, Watch Lessons and Earn a Certificate
Illustrates the complete end-to-end lifecycle specified in Case Study No. 108: enrolment & payment, lesson streaming & progress telemetry, and assessment with 70% threshold certificate generation.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 🎓 Student
    participant UI as 🖥️ Client Portal (Web UI)
    participant CourseSvc as ⚙️ CourseService
    participant PayGateway as 💳 Payment Gateway
    participant VideoPlayer as 🎬 Video Delivery Studio
    participant API as 🌐 REST Backend Server
    participant DB as 🔥 Database (Firestore/JSON)

    %% Step 1: Enrolment & Payment
    Note over Student, PayGateway: 1. Course Discovery & Enrolment
    Student->>UI: Selects Course (e.g., CSE-101) & clicks "Enrol & Pay"
    UI->>CourseSvc: initiateEnrollment(courseId, studentId)
    CourseSvc->>PayGateway: processPayment(studentId, courseId, amount=₹4500)
    PayGateway-->>CourseSvc: 200 OK {status: "APPROVED", txnId: "TXN-CC-2026-XXXX"}
    CourseSvc->>API: POST /api/enroll {studentId, courseId, txnId}
    API->>DB: Record Enrollment (status="ACTIVE", progress=0%)
    API-->>UI: Enrollment Confirmed & Studio Unlocked

    %% Step 2: Watch Lessons
    Note over Student, VideoPlayer: 2. Video Streaming & Progress Telemetry
    Student->>UI: Opens Learning Studio (learn.html)
    UI->>VideoPlayer: Load Module 1 Lesson 1 (12h curriculum)
    VideoPlayer->>Student: Streams HTML5 video content
    Student->>VideoPlayer: Completes lesson (video ended event)
    VideoPlayer->>CourseSvc: updateLessonProgress(courseId, lessonId, percent)
    CourseSvc->>API: POST /api/progress/update {progress: 100%}
    API->>DB: Save updated progress (progressPercent=100%)
    API-->>UI: All 4 Modules Complete -> Assessment Unlocked

    %% Step 3: Assessment & Certification
    Note over Student, DB: 3. Assessment & 70% Passing Threshold Evaluation
    Student->>UI: Opens 10-Question Certification Exam (quiz.html)
    Student->>UI: Submits 10 question answers
    UI->>API: POST /api/courses/:id/quiz/submit {answers, studentId}
    
    rect rgb(20, 35, 70)
        Note over API: Compute Score: (correct / 10) * 100
        alt Score >= 70% (Pass: 7 to 10 correct)
            API->>API: Generate Cryptographic Certificate ID (CC-CERT-2026-SE108-XXXX)
            API->>DB: Save Certificate Record & Set quizPassed=true
            API-->>UI: 200 OK {passed: true, score: 90, certificate: {...}}
            UI->>Student: Displays Official Printable University Certificate
        else Score < 70% (Fail: <= 6 correct)
            API->>DB: Record attempt & Set quizPassed=false
            API-->>UI: 200 OK {passed: false, score: 60, diagnosticNotes: "Review Modules 2 & 4"}
            UI->>Student: Prompts lesson review & retake option
        end
    end
```

---

### 4. Activity Diagram: Student Learning & Certification Flow

```mermaid
flowchart TD
    Start([Student Enters CourseCraft]) --> Browse[Browse Course Catalog]
    Browse --> SelectCourse[Select Course & View 4-Module Syllabus]
    SelectCourse --> CheckEnrolled{Already Enrolled?}
    
    CheckEnrolled -- No --> Checkout[Process ₹4,500 Demo Payment Gateway]
    Checkout --> CreateEnr[Initialize Enrollment & Record TXN ID]
    CreateEnr --> WatchVideo[Stream 12-Hour Video Lessons]
    
    CheckEnrolled -- Yes --> WatchVideo
    WatchVideo --> CompleteLesson[Complete Lessons & Update Telemetry]
    CompleteLesson --> ProgressCheck{Progress == 100%?}
    
    ProgressCheck -- No --> WatchVideo
    ProgressCheck -- Yes --> TakeQuiz[Take 10-Question Timed Assessment]
    
    TakeQuiz --> EvalQuiz[Evaluate Score against 70% Threshold]
    EvalQuiz --> PassedCheck{Score >= 70%?}
    
    PassedCheck -- Yes --> IssueCert[Issue Verified Certificate CC-CERT-2026-SE108-XXXX]
    IssueCert --> ViewCert[View & Print Verified University Certificate]
    ViewCert --> EndSuccess([Course Certified & Completed])
    
    PassedCheck -- No --> ReviewNotes[Review Video Lessons & Faculty Answers]
    ReviewNotes --> TakeQuiz
```

---

### 5. State Machine Diagram: Enrolment Lifecycle (Case Study 108)
Models the dynamic states of a student's enrolment from initial checkout through certification.

```mermaid
stateDiagram-v2
    [*] --> Unenrolled: Student discovers course

    Unenrolled --> PaymentPending: Clicks "Enrol & Pay (₹4,500)"
    PaymentPending --> Unenrolled: Payment Failed / Cancelled
    PaymentPending --> EnrolledActive: Payment Verified (TXN ID Generated)

    state EnrolledActive {
        [*] --> NotStarted: 0 / 12 Hours Watched
        NotStarted --> InProgress: Lessons streamed & completed
        InProgress --> InProgress: Telemetry updates (0% - 99%)
        InProgress --> ContentComplete: All 4 Modules (12h) Watched (100%)
    }

    EnrolledActive --> QuizEligible: Progress reaches 100%
    
    state QuizEligible {
        [*] --> AttemptingQuiz: Starts 10Q Exam
        AttemptingQuiz --> Evaluating: Submits Answers
    }

    Evaluating --> RetakeRequired: Score < 70% (<= 6/10)
    RetakeRequired --> QuizEligible: Retake Assessment

    Evaluating --> CertifiedCompleted: Score >= 70% (>= 7/10)
    
    state CertifiedCompleted {
        [*] --> CertificateIssued: CC-CERT-2026-SE108-XXXX Generated
        CertificateIssued --> VerifiedOnPublicRegistry: Public verification active
    }

    CertifiedCompleted --> [*]
```

---

### 6. State Machine Diagram: Academic Course Catalog Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Planned: Courses in Academic Pipeline
    Planned --> InProduction: Faculty assigned & video recording begins
    InProduction --> EditingQueue: 12h video recorded (36h editing required)
    EditingQueue --> LaunchReady: 2 Editors finish editing (60h/week combined)
    
    state LaunchReady {
        [*] --> PublishedToCatalog
        PublishedToCatalog --> ActiveEnrollment: Students enroll @ ₹4,500
        ActiveEnrollment --> CompletedCertification: Students pass quiz @ >=70%
    }

    LaunchReady --> Archived: Post-academic year retirement
    Archived --> [*]
```
