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

---

## 🔧 NEEDS FIXING
- [ ] Scanline overlay z-index blocking clicks (change `z-index: 50` → `5` in `layout.css`)
- [ ] Verify Live Server loads all CSS/JS correctly
- [ ] Test tab switching works between Home ↔ Bills

---

## 🔲 TO BUILD — Screens

### Shop / Groceries View
- [ ] Create `css/shop.css`
- [ ] Add `#view-shop` section to `index.html`
- [ ] Grocery items with prices (essentials vs luxuries)
- [ ] Impulse buy temptations (takeaway, gadgets, clothes)
- [ ] Cart / spending tracker
- [ ] Budget impact preview ("if you buy this, you'll have £X left")
- [ ] Cheap vs premium choices (own-brand vs branded)

### Job View
- [ ] Create `css/job.css`
- [ ] Add `#view-job` section to `index.html`
- [ ] Current job details (title, salary, shift schedule)
- [ ] Work action (go to work / skip work)
- [ ] Performance meter — skip too much = job loss
- [ ] Overtime option (more money, more stress, less happiness)
- [ ] Job board — apply for better/worse paying jobs

### Bank / Savings View
- [ ] Create `css/bank.css`
- [ ] Add `#view-bank` section to `index.html`
- [ ] Account overview (current balance, savings balance)
- [ ] Transfer money to/from savings
- [ ] Savings goals (emergency fund, holiday, etc.)
- [ ] Savings progress bars
- [ ] Interest earned display
- [ ] Debt / overdraft warning if balance goes negative

### Stats / Dashboard View
- [ ] Create `css/stats.css`
- [ ] Add `#view-stats` section to `index.html`
- [ ] Monthly spending breakdown (visual chart)
- [ ] Income vs expenses comparison
- [ ] Savings trend over time
- [ ] Financial health score
- [ ] Tips / achievements panel

---

## 🔲 TO BUILD — Game Logic

### Core Game Loop
- [ ] END DAY button advances day counter
- [ ] Month rollover (day 30 → next month, day 1)
- [ ] Payday — salary added to balance on set day
- [ ] Auto-deduct bills on their due dates
- [ ] Late fee penalty for overdue bills
- [ ] Autopay logic (if toggled on, auto-deduct on due date)

### Wellbeing System
- [ ] Stats change based on actions (sleep → +energy, work → -energy +stress)
- [ ] Eating → costs money, restores energy/happiness
- [ ] Relaxing → +happiness, -stress (but costs time)
- [ ] Low energy → can't work
- [ ] High stress → happiness drops faster
- [ ] Consequences — burnout (all stats low), job loss, debt spiral

### Financial Logic
- [ ] Pay individual bills (deduct from balance, mark as paid)
- [ ] Pay all bills button
- [ ] Cancel subscription (removes bill, may affect happiness)
- [ ] Grocery spending (essential vs luxury choices)
- [ ] Impulse purchases
- [ ] Overdraft / debt accumulation if balance < 0
- [ ] Savings interest calculation

### Random Events
- [ ] Emergency expenses (car repair, medical bill, appliance breaks)
- [ ] Unexpected income (tax refund, gift, bonus)
- [ ] Rent increase notification
- [ ] Subscription price hike
- [ ] Sale / discount opportunities

### UI Updates
- [ ] Wallet balance updates live when paying bills/buying
- [ ] Stat bars animate when values change
- [ ] Notification badge count updates dynamically
- [ ] Speech bubble changes based on game events
- [ ] Day/month display updates from game state

---

## 🔲 TO BUILD — Polish & Dissertation

### Visual Polish
- [ ] Pixel art sprites for character (replace CSS shapes)
- [ ] Furniture sprite upgrades
- [ ] Screen transition animations between views
- [ ] Sound effects (coin clink, button press, alert)
- [ ] Victory / failure end screens

### Educational Features
- [ ] Financial tips that rotate based on player behaviour
- [ ] End-of-month summary report (how did you do?)
- [ ] Achievement system (e.g. "Saved 3 months in a row")
- [ ] Tutorial / onboarding for first-time players

### Dissertation Support
- [ ] Document all design decisions
- [ ] Screenshot each screen for write-up
- [ ] Record gameplay demo video
- [ ] User testing with target demographic
- [ ] Collect feedback data for analysis chapter

---

*Last updated: May 2026*
