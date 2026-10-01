/**
 * CourseCraft Client Data Store
 * Case Study No. 108: University Continuing Education Centre
 */

window.CourseCraftData = {
  caseStudy: {
    id: 108,
    title: "CourseCraft — Online Course Platform for University Continuing Education Centre",
    tagline: "Learn. Grow. Get Certified.",
    program: "B.Tech CSE 2025–29, Semester III",
    subject: "Software Engineering & Project Management",
    constants: {
      totalCourses: 30,
      launchCourses: 8,
      hoursPerCourse: 12,
      recordingEditingRatio: 3,
      effortPerCourse: 36,
      effort8Courses: 288,
      effort30Courses: 1080,
      editorsCount: 2,
      weeklyHoursPerEditor: 30,
      totalWeeklyCapacity: 60,
      duration8CoursesWeeks: 4.8,
      duration30CoursesWeeks: 18.0,
      softwareDevWeeks: 10.0,
      courseFeeINR: 4500,
      enrolmentsPerYear: 150,
      revenue8CoursesINR: 5400000,
      revenue30CoursesINR: 20250000,
      quizPassThreshold: 70
    }
  },

  personas: {
    student: {
      uid: "usr_student_01",
      name: "Priya Sharma",
      email: "student@university.edu",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      enrolledCourses: ["cc-101", "cc-102", "cc-103"]
    },
    faculty: {
      uid: "usr_faculty_01",
      name: "Dr. Aarav Sharma",
      email: "faculty@university.edu",
      role: "faculty",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: "Continuing Education Centre",
      assignedCourses: ["cc-101", "cc-108", "cc-110", "cc-117", "cc-121"]
    },
    admin: {
      uid: "usr_admin_01",
      name: "Prof. Rajesh Nair",
      email: "admin@university.edu",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      department: "Dean of Continuing Education",
      permissions: ["all"]
    }
  },

  categories: [
    "Computer Science & Software Engineering",
    "Artificial Intelligence & Data Science",
    "Cybersecurity & Networks",
    "Cloud & Infrastructure",
    "Design & Human-Computer Interaction",
    "Project & Product Management",
    "Business & Analytics",
    "Hardware & Embedded Systems"
  ]
};
