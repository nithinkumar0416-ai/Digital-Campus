# EduPulse AI (EduFAZE AI)
### Unified AI-Powered Smart Education Intelligence Platform

EduPulse AI is a functional, integrated, AI-powered education intelligence platform for schools, colleges, and universities. Moving far beyond traditional Learning Management Systems (LMS), EduPulse AI understands students' learning difficulties, pinpoints knowledge gaps, recommends personalized revision pathways, connects academic curriculum with industry skills, and delivers actionable intelligence to teachers and institutional administrators.

---

## 🌟 Key Features & Visual Design

- **Next-Gen Cyber/Neon Aesthetics**: Dark cosmic palette (`#06040f`), multi-layered glassmorphic cards (`backdrop-filter: blur(16px)`), fluid 3D ribbon physics animations, glowing status indicators, and SVG vector wave charts.
- **Unified Intelligence Engine**: A closed-loop data lifecycle connecting diagnostic scores $\rightarrow$ concept gaps $\rightarrow$ exam error classification $\rightarrow$ targeted practice $\rightarrow$ follow-up re-testing $\rightarrow$ verified competency gains.
- **PWA & Offline-First**: Native Service Worker caching (`sw.js`) and IndexedDB persistence enabling continuous offline learning during unstable internet access.
- **Multimodal Accessibility**: Integrated Web Speech API (`window.speechSynthesis`) for real-time text-to-speech, OpenDyslexic font support, and adaptive reading complexity levels (ELI5 to Technical Glossary).

---

## 🧠 14 Specialized Intelligence Modules

1. **AI Learning Gap Detective** (`pages/gaps.html`): Identifies concept-level deficiencies and maps prerequisite dependencies (e.g., Differentiation $\rightarrow$ Integration).
2. **AI Syllabus-to-Skill Gap Detector** (`pages/skill-mapping.html`): Connects academic syllabi with real-world industry requirements (SWE, ML, Data Science).
3. **Student Struggle Early-Warning System** (`pages/warnings.html`): Transparent, non-punitive multi-signal alerts for proactive faculty intervention.
4. **Campus Resource Intelligence** (`pages/campus.html`): Lab and classroom scheduling with real-time conflict detection and utilization analytics.
5. **Learning Continuity Passport** (`pages/passport.html`): Student-controlled portable wallet of verified competencies vs. self-reported study with revocable sharing links and JSON export.
6. **Offline-First Smart Education** (`pages/offline-hub.html`): PWA caching, local quiz evaluation, and pending background sync queue.
7. **AI Exam Mistake Intelligence** (`pages/exam-analysis.html`): Classifies errors into conceptual gaps, calculation slips, and chosen method flaws with recurring pattern tracking.
8. **AI Academic Integrity Coach** (`pages/integrity.html`): Conversational oral viva defense simulator verifying genuine understanding instead of unreliable text-detector scores.
9. **Classroom Accessibility Adapter** (`pages/accessibility.html`): TTS voice narration, dyslexia-friendly typography, high contrast, and simplified study guides.
10. **AI Lab Failure Predictor** (`pages/lab.html`): Hypothesis-driven experiment troubleshooter (circuits, mechanics) with safe measurement sequences and supervisor escalation.
11. **AI Education Assistant** (`pages/assistant.html`): Interactive course-specific conversational tutor grounded in syllabus notes with step-by-step problem solving.
12. **Personal Learning Recommendation Engine** (`pages/recommendations.html`): Prioritized revision plans linking gaps to interactive micro-practice exercises.
13. **Student Progress and Intervention Tracking** (`pages/interventions.html`): 9-stage closed-loop intervention workflow measuring verified before-and-after diagnostic gains.
14. **Academic Insight and Reporting Engine** (`pages/reports.html`): Institutional analytics, mastery distribution curves, and intervention outcome reports.

---

## 👥 Role-Based Portals

- **Student Dashboard** (`pages/dashboard-student.html`): Personal study pathways, gap alerts, active recommendations, and assessment history.
- **Teacher Dashboard** (`pages/dashboard-teacher.html`): Class mastery progress, struggle alerts, and one-click intervention assignments.
- **Institution Administrator** (`pages/dashboard-admin.html`): Department health metrics, academic calendar milestones, CSV batch import engine with syntax/duplicate validation, and security audit logs.
- **Campus Facility Administrator** (`pages/campus.html`): Room and lab availability tracking with instant collision prevention.

---

## 🛠️ Technology Stack

- **Frontend Structure**: Semantic HTML5 (W3C compliant, accessible navigation, ARIA tags).
- **Styling & Motion**: Pure Vanilla CSS3 with CSS Custom Properties (Tokens), Flexbox, CSS Grid, and GPU-accelerated keyframe animations.
- **Frontend Logic**: Vanilla JavaScript (ES6+) with in-memory unified store (`DEMO_DATA`), session-based authentication (`sessionStorage`), and client-side route protection.
- **APIs**: Web Speech API (`SpeechSynthesis`), Service Worker API, CacheStorage, File/FileReader API.
- **Backend**: Lightweight, zero-dependency Node.js HTTP server (`server.js`).
- **Testing & QA**: Automated link and asset validation suite (`validate.js`) verifying 0 broken references across all 23 HTML pages.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer) installed on your system.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nithinkumar0416-ai/Digital-Campus.git
   cd Digital-Campus
   ```

2. **Configure Google Gemini AI (Optional for Live AI):**
   Copy `.env.example` to `.env` and insert your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-1.5-flash
   ```
   *(Note: You can also configure the key inside the web UI at `pages/settings.html`)*

3. **Start the local server:**
   ```bash
   node server.js
   ```

4. **Open the platform:**
   Open your browser and navigate to:
   ```
   http://127.0.0.1:3000/
   ```

5. **Run AI Assistant Verification Tests:**
   ```bash
   node test_ai_assistant.js
   ```

---

## 🔑 Demo Personas & Credentials

All demo data is synthetic and pre-configured with 1-click quick-fill buttons on the login page:

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Aanya Sharma** | `student@demo.edufaze.ai` | `demo1234` | Student (CS Year 2) |
| **Dr. Dev Kumar** | `teacher@demo.edufaze.ai` | `demo1234` | Teacher (Faculty) |
| **Nithin Kumar** | `admin@demo.edufaze.ai` | `demo1234` | Institution Administrator |
| **Meera Pillai** | `campus@demo.edufaze.ai` | `demo1234` | Campus Facilities Admin |

---

## 🧪 Interactive Hackathon Demonstration Flow

Navigate to `pages/demo.html` to run the 10-step end-to-end evaluation flow:
1. Student submits diagnostic test $\rightarrow$
2. System flags knowledge gaps $\rightarrow$
3. Platform recommends personalized practice $\rightarrow$
4. Student completes remediation practice $\rightarrow$
5. Follow-up test records improvement (+33% gain) $\rightarrow$
6. Teacher reviews intervention outcome $\rightarrow$
7. Learning Passport updates verified competency $\rightarrow$
8. Syllabus maps to industry skill requirements $\rightarrow$
9. Campus intelligence blocks conflicting room booking $\rightarrow$
10. All reports update in real time.

---

## 📄 License
This project is open-source under the MIT License.
