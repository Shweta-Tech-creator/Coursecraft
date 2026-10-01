/**
 * CourseCraft SEPM Case Study 108 Calculation & Scheduling Engine
 * Department of Computer Science & Engineering | B.Tech CSE 2025-29
 */

window.SEPMCalculator = (function() {
  const BASE_PARAMS = {
    totalCourses: 30,
    launchCourses: 8,
    hoursPerCourse: 12,
    ratio: 3,
    editors: 2,
    editorHoursPerWeek: 30,
    softwareDevWeeks: 10.0,
    feeINR: 4500,
    enrolmentsPerYear: 150
  };

  function compute(custom = {}) {
    const p = { ...BASE_PARAMS, ...custom };

    const effortPerCourse = p.hoursPerCourse * p.ratio; // 12 * 3 = 36h
    const effortLaunch = effortPerCourse * p.launchCourses; // 36 * 8 = 288h
    const effortTotal = effortPerCourse * p.totalCourses; // 36 * 30 = 1080h
    const weeklyCapacity = p.editors * p.editorHoursPerWeek; // 2 * 30 = 60h/week

    const durationLaunchWeeks = weeklyCapacity > 0 ? Number((effortLaunch / weeklyCapacity).toFixed(2)) : 0; // 4.8 wks
    const durationTotalWeeks = weeklyCapacity > 0 ? Number((effortTotal / weeklyCapacity).toFixed(2)) : 0; // 18.0 wks

    const revenuePerCourse = p.feeINR * p.enrolmentsPerYear; // ₹6,75,000
    const revenueLaunch = revenuePerCourse * p.launchCourses; // ₹54,00,000
    const revenueTotal = revenuePerCourse * p.totalCourses; // ₹2,02,50,000

    const isContentBottleneck = durationTotalWeeks > p.softwareDevWeeks;
    const launch8CourseFloat = Number((p.softwareDevWeeks - durationLaunchWeeks).toFixed(2)); // 10.0 - 4.8 = 5.2 weeks float

    return {
      params: p,
      effortPerCourse,
      effortLaunch,
      effortTotal,
      weeklyCapacity,
      durationLaunchWeeks,
      durationTotalWeeks,
      softwareDevWeeks: p.softwareDevWeeks,
      launch8CourseFloat,
      isContentBottleneck,
      revenuePerCourse,
      revenueLaunch,
      revenueTotal
    };
  }

  function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  return {
    BASE_PARAMS,
    compute,
    formatCurrency
  };
})();
