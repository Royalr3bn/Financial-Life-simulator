/* ═══════════════════════════════════════
   PENNY WISE — Game State
   Single source of truth for all data
   ═══════════════════════════════════════ */

const GameState = {
  // ——— Finances ———
  balance: 1247,
  savings: 340,
  salary: 2100,
  debt: 0,
  overdraftFeePerDay: 5,
  savingsInterestRate: 0.05,

  // ——— Calendar ———
  month: 2,
  year: 2026,
  day: 14,
  daysInMonth: 30,
  payday: 1,
  workedDays: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13], // Track historical days worked

  // ——— Wellbeing (0–100) ———
  happiness: 72,
  energy: 45,
  stress: 60,

  // ——— Job ———
  job: {
    title: 'Retail Assistant',
    company: 'MegaMart',
    salaryMonthly: 2100,
    performance: 62,
    shiftsWorked: 18,
    shiftsMissed: 1,
    shiftsTotal: 22,
    overtimeBonus: 39,
    warningCount: 1,
    reviewIn: 14,
  },

  // ——— Bills ———
  bills: [
    { id: 'rent',   name: 'Rent',        type: 'HOUSING', amount: 850, dueDay: 17, paid: false, autopay: true,  icon: '🏠', cancellable: false },
    { id: 'elec',   name: 'Electricity',  type: 'UTILITY', amount: 85,  dueDay: 12, paid: false, autopay: false, icon: '⚡', cancellable: false },
    { id: 'water',  name: 'Water',        type: 'UTILITY', amount: 52,  dueDay: 22, paid: false, autopay: false, icon: '💧', cancellable: false },
    { id: 'net',    name: 'Internet',     type: 'UTILITY', amount: 35,  dueDay: 26, paid: false, autopay: false, icon: '📡', cancellable: false },
    { id: 'phone',  name: 'Phone Plan',   type: 'UTILITY', amount: 25,  dueDay: 29, paid: false, autopay: false, icon: '📱', cancellable: false },
    { id: 'stream', name: 'Streamflix',   type: 'SUB',     amount: 15,  dueDay: 2,  paid: false, autopay: true,  icon: '🎬', cancellable: true, usageDays: 4 },
    { id: 'gym',    name: 'Gym Member',   type: 'SUB',     amount: 22,  dueDay: 4,  paid: false, autopay: true,  icon: '💪', cancellable: true, usageDays: 1 },
    { id: 'music',  name: 'Tunebox',      type: 'SUB',     amount: 10,  dueDay: 3,  paid: true,  autopay: true,  icon: '🎵', cancellable: true, usageDays: 20 },
  ],

  lateFees: {},

  // ——— Cart ———
  cart: [],

  // ——— Spending tracking ———
  spending: {
    rent: 0,
    groceries: 0,
    utilities: 0,
    subscriptions: 0,
    impulse: 0,
    savings: 0,
  },

  // ——— Monthly history ———
  monthlyHistory: [
    { month: 'OCT', balance: 80,  saved: -120 },
    { month: 'NOV', balance: 130, saved: 50 },
    { month: 'DEC', balance: 90,  saved: -40 },
    { month: 'JAN', balance: 190, saved: 100 },
    { month: 'FEB', balance: 240, saved: 50 },
  ],

  // ——— Achievements ———
  achievements: {
    firstSaver:    { unlocked: true,  name: 'First Saver',      desc: 'Put money into savings for the first time' },
    billPayer:     { unlocked: true,  name: 'Bill Payer',        desc: 'Paid all bills on time for 1 month' },
    homeCook:      { unlocked: true,  name: 'Home Cook',         desc: 'Bought groceries instead of takeaway 5 times' },
    rainyDay:      { unlocked: false, name: 'Rainy Day Ready',   desc: 'Build emergency fund to £1,000' },
    noImpulse:     { unlocked: false, name: 'No Impulse Month',  desc: 'Complete a month with zero impulse purchases' },
    promoted:      { unlocked: false, name: 'Promoted',          desc: 'Get a raise or promotion at work' },
  },

  // ——— Flags ———
  gameOver: false,
  gameOverReason: '',
  notifications: [],
  impulseThisMonth: 0,
  groceryCount: 0,
  workedToday: false,
  slept12Hours: false,
  transferDirection: 'to_savings',
};

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];