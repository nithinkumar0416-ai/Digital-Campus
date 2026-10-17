/* ============================================================
   EduFAZE AI — Core Application Logic
   Handles: nav, UI interactions, demo data, counters, auth
   ============================================================ */

'use strict';

// ============================================================
// DEMO DATA STORE  (synthetic — clearly labelled)
// ============================================================
const DEMO_DATA = {
  meta: { mode: 'DEMO', label: 'Synthetic Data — Not Real Records', version: '1.0.0' },

  institution: {
    id: 'inst-001',
    name: 'EduFAZE Demo University',
    type: 'University',
    departments: ['Computer Science', 'Mathematics', 'Physics', 'Engineering'],
    academic_year: '2026-27',
    semester: 'Autumn 2026'
  },

  users: [
    { id: 'u-student-1', name: 'Aanya Sharma',  role: 'student',  email: 'student@demo.edufaze.ai',  password: 'demo1234', avatar: 'AS', department: 'Computer Science', year: 2 },
    { id: 'u-student-2', name: 'Rohan Mehta',   role: 'student',  email: 'rohan@demo.edufaze.ai',    password: 'demo1234', avatar: 'RM', department: 'Mathematics', year: 1 },
    { id: 'u-student-3', name: 'Priya Nair',    role: 'student',  email: 'priya@demo.edufaze.ai',    password: 'demo1234', avatar: 'PN', department: 'Physics', year: 3 },
    { id: 'u-teacher-1', name: 'Dr. Dev Kumar', role: 'teacher',  email: 'teacher@demo.edufaze.ai',  password: 'demo1234', avatar: 'DK', department: 'Computer Science' },
    { id: 'u-admin-1',   name: 'Nithin Kumar',  role: 'admin',    email: 'admin@demo.edufaze.ai',    password: 'demo1234', avatar: 'NK', department: 'Administration' },
    { id: 'u-campus-1',  name: 'Meera Pillai',  role: 'campus',   email: 'campus@demo.edufaze.ai',   password: 'demo1234', avatar: 'MP', department: 'Facilities' }
  ],

  courses: [
    { id: 'c-001', name: 'Data Structures & Algorithms', code: 'CS201', dept: 'Computer Science', teacher: 'u-teacher-1', credits: 4, students: 28 },
    { id: 'c-002', name: 'Calculus II', code: 'MA202', dept: 'Mathematics', teacher: 'u-teacher-1', credits: 3, students: 35 },
    { id: 'c-003', name: 'Physics Mechanics', code: 'PH101', dept: 'Physics', teacher: 'u-teacher-1', credits: 3, students: 42 },
    { id: 'c-004', name: 'Introduction to AI', code: 'CS301', dept: 'Computer Science', teacher: 'u-teacher-1', credits: 4, students: 22 }
  ],

  topics: [
    { id: 't-001', course: 'c-001', name: 'Arrays and Linked Lists', chapter: 1, prerequisites: [] },
    { id: 't-002', course: 'c-001', name: 'Sorting Algorithms', chapter: 2, prerequisites: ['t-001'] },
    { id: 't-003', course: 'c-001', name: 'Graph Traversal', chapter: 4, prerequisites: ['t-002'] },
    { id: 't-004', course: 'c-002', name: 'Limits and Continuity', chapter: 1, prerequisites: [] },
    { id: 't-005', course: 'c-002', name: 'Differentiation', chapter: 2, prerequisites: ['t-004'] },
    { id: 't-006', course: 'c-002', name: 'Integration', chapter: 3, prerequisites: ['t-005'] }
  ],

  assessments: [
    { id: 'a-001', course: 'c-001', name: 'DS Diagnostic Test', type: 'diagnostic', questions: 10, max_marks: 100, date: '2026-10-10' },
    { id: 'a-002', course: 'c-002', name: 'Calculus Quiz 1', type: 'quiz', questions: 15, max_marks: 100, date: '2026-10-12' },
    { id: 'a-003', course: 'c-001', name: 'Sorting Practice', type: 'practice', questions: 8, max_marks: 80, date: '2026-10-15' }
  ],

  results: [
    { id: 'r-001', student: 'u-student-1', assessment: 'a-001', score: 42, max: 100, topics_weak: ['t-002', 't-003'], date: '2026-10-10' },
    { id: 'r-002', student: 'u-student-1', assessment: 'a-002', score: 38, max: 100, topics_weak: ['t-005', 't-006'], date: '2026-10-12' },
    { id: 'r-003', student: 'u-student-2', assessment: 'a-001', score: 75, max: 100, topics_weak: [], date: '2026-10-10' },
    { id: 'r-004', student: 'u-student-1', assessment: 'a-003', score: 60, max: 80, topics_weak: ['t-002'], date: '2026-10-15' }
  ],

  gaps: [
    { id: 'g-001', student: 'u-student-1', topic: 't-006', topic_name: 'Integration', course: 'c-002', course_name: 'Calculus II', evidence: 'Score 38/100 on Calculus Quiz 1; prerequisite Differentiation score also weak (42%)', confidence: 'high', status: 'open', detected: '2026-10-12' },
    { id: 'g-002', student: 'u-student-1', topic: 't-002', topic_name: 'Sorting Algorithms', course: 'c-001', course_name: 'Data Structures', evidence: 'Score 42/100 on DS Diagnostic; repeated errors on quicksort questions', confidence: 'medium', status: 'in-progress', detected: '2026-10-10' }
  ],

  recommendations: [
    { id: 'rec-001', student: 'u-student-1', gap: 'g-002', title: 'Sorting Algorithms Revision Module', type: 'resource', priority: 'high', reason: 'Repeated low scores on sorting questions across 2 assessments', resource: 'res-001', estimated_mins: 45 },
    { id: 'rec-002', student: 'u-student-1', gap: 'g-001', title: 'Integration Fundamentals Practice Set', type: 'practice', priority: 'high', reason: 'Low integration score and weak prerequisite (differentiation)', resource: 'res-002', estimated_mins: 30 }
  ],

  resources: [
    { id: 'res-001', course: 'c-001', title: 'Sorting Algorithms: Visual Guide & Practice', type: 'module', topic: 't-002', url: '#' },
    { id: 'res-002', course: 'c-002', title: 'Integration Techniques Step-by-Step', type: 'module', topic: 't-006', url: '#' },
    { id: 'res-003', course: 'c-004', title: 'Introduction to Machine Learning', type: 'lecture', topic: null, url: '#' }
  ],

  interventions: [
    { id: 'int-001', student: 'u-student-1', gap: 'g-002', status: 'in-progress', teacher: 'u-teacher-1', started: '2026-10-11', follow_up_date: '2026-10-20', notes: 'Assigned sorting practice module. Student completed 60%.' }
  ],

  campus_resources: [
    { id: 'cr-001', name: 'Lab A - Computer Lab', type: 'lab', capacity: 30, building: 'Tech Block', floor: 2, status: 'available', equipment: ['Computers x30', 'Projector', 'Whiteboard'] },
    { id: 'cr-002', name: 'Room 201 - Lecture Hall', type: 'classroom', capacity: 80, building: 'Main Block', floor: 2, status: 'booked', equipment: ['Projector', 'Audio System', 'AC'] },
    { id: 'cr-003', name: 'Physics Lab', type: 'lab', capacity: 24, building: 'Science Block', floor: 1, status: 'maintenance', equipment: ['Oscilloscopes', 'Function Generators', 'Safety Kit'] },
    { id: 'cr-004', name: 'Seminar Room 1', type: 'seminar', capacity: 20, building: 'Main Block', floor: 3, status: 'available', equipment: ['TV Screen', 'Whiteboard', 'Conference System'] }
  ],

  bookings: [
    { id: 'b-001', resource: 'cr-002', user: 'u-teacher-1', date: '2026-10-17', start: '10:00', end: '12:00', purpose: 'CS201 Lecture', status: 'confirmed' }
  ],

  warnings: [
    { id: 'w-001', student: 'u-student-1', type: 'academic', level: 'high', signals: ['2 low assessment scores', 'Missed 1 assignment', 'Identified learning gaps'], message: 'Aanya Sharma requires academic support attention', teacher_reviewed: false },
    { id: 'w-002', student: 'u-student-2', type: 'academic', level: 'low', signals: ['Declining score trend'], message: 'Rohan Mehta showing slight performance decline', teacher_reviewed: false }
  ],

  skills_map: [
    { id: 'sk-001', skill: 'Algorithm Design', industry_req: 'Software Engineering roles', topic: 't-002', student: 'u-student-1', status: 'needs-improvement', evidence: 'Low sorting test score' },
    { id: 'sk-002', skill: 'Mathematical Modelling', industry_req: 'Data Science roles', topic: 't-006', student: 'u-student-1', status: 'needs-assessment', evidence: 'Topic covered in syllabus — not yet assessed via project' },
    { id: 'sk-003', skill: 'Problem Decomposition', industry_req: 'Software Engineering roles', topic: 't-001', student: 'u-student-1', status: 'demonstrated', evidence: 'Score 78% on array/linked list tasks' }
  ],

  passport: {
    student: 'u-student-1',
    courses_completed: ['c-001 (In Progress)'],
    competencies: ['Arrays & Linked Lists — Demonstrated', 'Basic Sorting — Needs Improvement'],
    projects: [],
    achievements: [
      { id: 'ach-001', name: 'First Assessment Completed', verified: true, date: '2026-10-10' },
      { id: 'ach-002', name: 'Practice Module Started', verified: false, date: '2026-10-15' }
    ]
  },

  offline_queue: [],
  sync_pending: 0
};

// ============================================================
// AUTH STATE
// ============================================================
const Auth = {
  SESSION_KEY: 'edufaze_session',

  getSession() {
    try {
      const s = sessionStorage.getItem(this.SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },

  setSession(user) {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...user, loggedAt: Date.now() }));
    } catch(e) { console.warn('Session storage unavailable'); }
  },

  clearSession() {
    try { sessionStorage.removeItem(this.SESSION_KEY); } catch {}
  },

  isLoggedIn() { return this.getSession() !== null; },

  currentUser() { return this.getSession(); },

  login(email, password) {
    const user = DEMO_DATA.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      this.setSession(safeUser);
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password. Try a demo account.' };
  },

  logout() {
    this.clearSession();
    window.location.href = getRelativeRoot() + 'pages/login.html';
  }
};

// ============================================================
// UTILITIES
// ============================================================
function getRelativeRoot() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getScoreClass(score, max = 100) {
  const pct = (score / max) * 100;
  if (pct >= 75) return 'green';
  if (pct >= 50) return 'amber';
  return 'red';
}

function countUp(el, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function observeCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        countUp(e.target, parseInt(e.target.dataset.target));
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => {
    const id = c.id;
    if (id) { const el = $(id); if(el) observer.observe(el); }
    else observer.observe(c);
  });
}

// Observe numeric counters by ID
function initCounters() {
  [
    { id: 'counter-students', target: 1247 },
    { id: 'counter-courses',  target: 84 },
    { id: 'counter-gaps',     target: 312 },
    { id: 'counter-interventions', target: 97 }
  ].forEach(({ id, target }) => {
    const el = $(id);
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !el.dataset.counted) {
        el.dataset.counted = '1';
        countUp(el, target);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

// ============================================================
// NAVBAR
// ============================================================
function initNavbar() {
  const navbar = $('navbar');
  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger
  const ham = $('hamburger-btn');
  const navLinks = $('nav-links');
  if (ham && navLinks) {
    ham.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      ham.setAttribute('aria-expanded', open);
    });
  }

  // Notifications
  const notifBtn = $('notifications-btn');
  const notifPanel = $('notifications-panel');
  const notifClose = $('notif-close');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('hidden');
      const userDrop = $('user-dropdown');
      if (userDrop) userDrop.classList.add('hidden');
    });
    if (notifClose) notifClose.addEventListener('click', () => notifPanel.classList.add('hidden'));
  }

  // User avatar dropdown
  const avatarBtn = $('user-avatar-btn');
  const userDrop = $('user-dropdown');
  if (avatarBtn && userDrop) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = userDrop.classList.toggle('hidden');
      avatarBtn.setAttribute('aria-expanded', String(!open));
      if (notifPanel) notifPanel.classList.add('hidden');
    });
    avatarBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarBtn.click(); }
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (notifPanel && !notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifPanel.classList.add('hidden');
    }
    if (userDrop && !userDrop.contains(e.target) && e.target !== avatarBtn) {
      userDrop.classList.add('hidden');
    }
  });

  // Logout
  const logoutBtn = $('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Sign out of EduFAZE AI?')) Auth.logout();
    });
  }

  // Update avatar from session
  const session = Auth.currentUser();
  if (session) {
    const av = $('user-avatar');
    if (av) av.textContent = session.avatar || session.name?.slice(0, 2).toUpperCase() || 'U';
    const dn = $('dropdown-user-name');
    if (dn) dn.textContent = session.name;
    const dr = $('dropdown-user-role');
    if (dr) dr.textContent = { student: 'Student', teacher: 'Teacher', admin: 'Institution Admin', campus: 'Campus Admin' }[session.role] || session.role;
  }
}

// ============================================================
// ONLINE / OFFLINE INDICATOR
// ============================================================
function initOnlineStatus() {
  const dot = document.querySelector('.status-dot');
  const text = document.querySelector('.status-text');
  function update() {
    const online = navigator.onLine;
    if (dot) { dot.classList.toggle('online', online); dot.classList.toggle('offline', !online); }
    if (text) text.textContent = online ? 'Online / Sync Queue' : 'Offline Mode';
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// ============================================================
// DEMO BANNER
// ============================================================
function initDemoBanner() {
  const banner = $('demo-banner');
  const closeBtn = $('demo-banner-close');
  if (!banner) return;
  const dismissed = sessionStorage.getItem('demo_banner_dismissed');
  if (dismissed) { banner.classList.add('hidden'); return; }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      sessionStorage.setItem('demo_banner_dismissed', '1');
    });
  }
}

// ============================================================
// HERO SLIDE FUNCTIONALITY
// ============================================================
function initHeroSlides() {
  const prevBtn = $('arrow-prev');
  const nextBtn = $('arrow-next');
  if (!prevBtn || !nextBtn) return;
  const slides = [
    { title: 'EDUPULSE AI', sub: 'Identify learning gaps before they become failures.' },
    { title: 'SKILL BRIDGE', sub: 'Map curriculum to real industry demands.' },
    { title: 'EARLY WARNING', sub: 'Support students before they fall behind.' }
  ];
  let current = 0;
  const titleEl = document.querySelector('.title-edu');
  const subEl = document.querySelector('.hero-subtitle');
  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    if (titleEl) { titleEl.style.opacity = '0'; setTimeout(() => { titleEl.textContent = slides[current].title; titleEl.style.opacity = '1'; }, 150); }
    if (subEl) { subEl.style.opacity = '0'; setTimeout(() => { subEl.textContent = slides[current].sub; subEl.style.opacity = '1'; }, 150); }
  }
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  // Auto-advance
  setInterval(() => goTo(current + 1), 6000);
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
  const cards = $$('.module-card, .role-card, .stat-card, .feature-item, .card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, (i % 4) * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}

// ============================================================
// FEATURE ITEM KEYBOARD SUPPORT
// ============================================================
function initFeatureKeys() {
  $$('.feature-item[tabindex]').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

// ============================================================
// ACTIVE NAV LINK DETECTION
// ============================================================
function highlightActiveNav() {
  const path = window.location.pathname;
  $$('.nav-link, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isActive = href && path.endsWith(href.replace('../', '').replace('./', ''));
    link.classList.toggle('active', isActive);
  });
}

// ============================================================
// PROTECTED ROUTES — redirect to login if needed
// ============================================================
function checkProtectedRoute() {
  const protectedPages = [
    'dashboard-student', 'dashboard-teacher', 'dashboard-admin',
    'gaps', 'skill-mapping', 'warnings', 'campus', 'passport',
    'offline-hub', 'exam-analysis', 'integrity', 'accessibility',
    'lab', 'assistant', 'recommendations', 'interventions', 'reports',
    'profile', 'settings', 'resources', 'demo'
  ];
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  if (protectedPages.includes(currentPage) && !Auth.isLoggedIn()) {
    window.location.href = getRelativeRoot() + 'pages/login.html?redirect=' + encodeURIComponent(window.location.href);
  }
}

// ============================================================
// SIDEBAR TOGGLE (inner pages)
// ============================================================
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggler = $('sidebar-toggle');
  if (!sidebar) return;
  if (toggler) {
    toggler.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  // Highlight active sidebar link
  const path = window.location.pathname;
  $$('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && path.includes(href.replace('../', ''))) {
      link.classList.add('active');
    }
  });
}

// ============================================================
// INTELLIGENCE ENGINE — gap detection
// ============================================================
const IntelligenceEngine = {
  getStudentGaps(studentId) {
    return DEMO_DATA.gaps.filter(g => g.student === studentId);
  },

  getStudentResults(studentId) {
    return DEMO_DATA.results.filter(r => r.student === studentId);
  },

  getStudentRecommendations(studentId) {
    return DEMO_DATA.recommendations.filter(r => r.student === studentId);
  },

  getStudentWarnings(studentId) {
    return DEMO_DATA.warnings.filter(w => w.student === studentId);
  },

  getStudentSkills(studentId) {
    return DEMO_DATA.skills_map.filter(s => s.student === studentId);
  },

  analyzeGaps(results) {
    // Deterministic rule-based gap detection from results
    const weakTopics = new Set();
    results.forEach(r => {
      if (r.topics_weak) r.topics_weak.forEach(t => weakTopics.add(t));
    });
    return Array.from(weakTopics).map(tid => {
      const topic = DEMO_DATA.topics.find(t => t.id === tid);
      return topic ? { topicId: tid, topicName: topic.name } : null;
    }).filter(Boolean);
  },

  // Calculate overall student score
  getOverallScore(studentId) {
    const results = this.getStudentResults(studentId);
    if (!results.length) return null;
    const totalPct = results.reduce((sum, r) => sum + (r.score / r.max) * 100, 0);
    return Math.round(totalPct / results.length);
  }
};

// ============================================================
// EXPOSE globals for inner pages
// ============================================================
window.EduFAZE = {
  DEMO_DATA,
  Auth,
  IntelligenceEngine,
  $,
  $$,
  formatDate,
  getScoreClass,
  getRelativeRoot,
  countUp
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkProtectedRoute();
  initNavbar();
  initOnlineStatus();
  initDemoBanner();
  initHeroSlides();
  initCounters();
  initScrollAnimations();
  initFeatureKeys();
  highlightActiveNav();
  initSidebar();

  // PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(getRelativeRoot() + 'sw.js')
      .then(reg => console.log('[EduFAZE] SW registered:', reg.scope))
      .catch(err => console.warn('[EduFAZE] SW failed:', err));
  }
});
