# PENNY WISE — Project To-Do List
### Personal Finance Life-Simulation Game

---

## ✅ COMPLETED

### Project Setup
- [x] Established project folder structure (`css/`, `js/`, `assets/`)
- [x] Created `variables.css` — shared colour palette and design tokens
- [x] Created `layout.css` — screen frame, topbar, bottombar, stat bars, wallet, view switching
- [x] Created `components.css` — reusable buttons, panels, toggles, budget rows, section labels
- [x] Created `game.js` — core game state object (balance, salary, stats, bills data)
- [x] Created `nav.js` — tab click handling and toggle switch interaction
- [x] Single `index.html` entry point loading all CSS/JS

### Home View (HUD)
- [x] Created `hud.css`
- [x] Top bar — date badge (month + day counter)
- [x] Top bar — three wellbeing stat bars (Happy / Energy / Stress)
- [x] Top bar — wallet display with animated coin, balance, and payday countdown
- [x] Main stage — isometric room with floor, wall, perspective transforms
- [x] Main stage — furniture (bed, couch, TV, rug, lamp, plant)
- [x] Main stage — pixel character with idle bob animation
- [x] Main stage — speech bubble with contextual reminder ("RENT DUE IN 3 DAYS!")
- [x] Main stage — decorative drifting clouds
- [x] Right sidebar — monthly budget breakdown (income, expenses, savings)
- [x] Right sidebar — quick action buttons (Sleep, Work, Eat, Relax)
- [x] CRT scanline overlay effect

### Bills View
- [x] Created `bills.css`
- [x] Summary strip — 4 cards (Overdue / Upcoming / Paid / Monthly Total)
- [x] Bills list — overdue section with red pulsing border + late fee warning
- [x] Bills list — upcoming section with due-day countdowns
- [x] Bills list — paid section with faded style + "PAID ✓" stamp
- [x] Bill cards — icon, name, type tag, meta info, amount, due date
- [x] Bill cards — PAY button on all bills
- [x] Bill cards — CANCEL button on subscriptions (Streamflix, Gym, Tunebox)
- [x] Right sidebar — autopay toggle switches
- [x] Right sidebar — financial tip panel (gym usage warning)
- [x] Right sidebar — "PAY ALL" bulk action button

### Navigation
- [x] Bottom nav bar with 6 tabs (Home, Bills, Shop, Job, Bank, Stats)
- [x] Notification badge on Bills tab
- [x] END DAY button
- [x] Tab switching between Home and Bills views via `nav.js`

### Core Core Screen Layouts (Added via State Mapping Updates)
- [x] Created `css/shop.css` and built `#view-shop` layout container rules
- [x] Created `css/job.css` and built `#view-job` interactive career panel row matrices
- [x] Created `css/bank.css` and built `#view-bank` transfer splits and goal tracking meters
- [x] Created `css/stats.css` and built `#view-stats` visual status overview meters

### Central State Game Logic
- [x] END DAY button successfully steps forward current calendar tracking arrays
- [x] Automated system rollover handles month progression steps (Day 30 → Day 1)
- [x] Payday intervals safely compute and deposit monthly salary into current wallet balance
- [x] Automated system billing scripts execute automatic bill processing sweeps on designated due dates
- [x] System tracking triggers rigid daily overdraft penalties if core currency falls below zero thresholds
- [x] Autopay toggle parameters intercept billing queues to automatically pay statements on time
- [x] Condition checks correctly balance wellbeing parameters (Sleep → +Energy, Work → -Energy / +Stress)
- [x] Marketplace loops evaluate cost properties to alter account limits and calculate biological yields
- [x] Script limits enforce work boundaries, rendering career warning metrics or job loss alerts
- [x] Implemented instant game-over routines tracking structural bankruptcy and physiological burnout

### UI & Bug Adjustments
- [x] Repositioned screen scanline overlay z-index parameters to restore mouse selection routines
- [x] Verified local server file load ordering matrices to secure initialization data flows
- [x] Synchronized active display nodes so wallet counters and status bars update immediately on event fires
- [x] Programmed active view switching completely across all 6 menu layout partitions

---

## 🔧 NEEDS FIXING
- [ ] Refine micro-balancing parameters (ensure game progression limits are neither too simple nor overly punishing)

---

## 🔲 TO BUILD — Post-Deadline Polish & Future Milestones
*(Deferred to manage scope creep and protect strict dissertation submission parameters)*

### Visual & Audio Polish
- [ ] Replace temporary asset placeholders with dedicated standalone pixel art character sprite assets
- [ ] Upgrade asset furniture objects to complex modular retro tile sheets
- [ ] Implement audio synthesizers to render vintage chiptune events (coin drops, warning rings, click sounds)
- [ ] Add smooth screen filter transitions during multi-tab view switching executions

### Dynamic Event Logic
- [ ] Inject randomized systemic micro-events (unforeseen mechanic bills, emergency pricing hikes, windfall tax refunds)

### Native Handheld Package Delivery
- [ ] Wrap responsive frontend files into a native mobile Progressive Web App (PWA) container for internet-free train commuting usage

---

## 📝 DISSERTATION SUPPORT (CURRENT PROGRESS)
- [x] Document project setup, architectural foundations, and project management scope tracking methodologies
- [x] Finish Section 1: Introduction chapter body
- [x] Finish Section 2: Literature Review academic comparisons
- [x] Finish Section 3: Project Management backlog summaries
- [ ] Complete Section 4: Software Design system structure maps
- [ ] Complete Section 5: Evaluation performance test reviews
- [ ] Complete Section 6: Reflection structural conclusions

---

*Last updated: May 2026*