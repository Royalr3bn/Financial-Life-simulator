/* ═══════════════════════════════════════
   PENNY WISE — Game State
   Core data: money, stats, date, bills
   ═══════════════════════════════════════ */

const GameState = {
  // Player finances
  balance: 1247,
  salary: 2100,
  savings: 150,

  // Calendar
  month: 'MAR',
  year: 2026,
  day: 14,
  daysInMonth: 30,

  // Wellbeing stats (0-100)
  happiness: 72,
  energy: 45,
  stress: 60,

  // Bills — will drive the bills view dynamically later
  bills: [
    { id: 'elec',   name: 'Electricity', type: 'UTILITY', amount: 85,  dueDay: 12, paid: false, icon: '⚡' },
    { id: 'rent',   name: 'Rent',        type: 'HOUSING', amount: 850, dueDay: 17, paid: false, icon: '🏠' },
    { id: 'water',  name: 'Water',       type: 'UTILITY', amount: 52,  dueDay: 22, paid: false, icon: '💧' },
    { id: 'net',    name: 'Internet',    type: 'UTILITY', amount: 35,  dueDay: 26, paid: false, icon: '📡' },
    { id: 'phone',  name: 'Phone Plan',  type: 'UTILITY', amount: 25,  dueDay: 29, paid: false, icon: '📱' },
    { id: 'stream', name: 'Streamflix',  type: 'SUB',     amount: 15,  dueDay: 2,  paid: false, icon: '🎬', cancellable: true },
    { id: 'gym',    name: 'Gym Member',  type: 'SUB',     amount: 22,  dueDay: 4,  paid: false, icon: '💪', cancellable: true },
    { id: 'music',  name: 'Tunebox',     type: 'SUB',     amount: 10,  dueDay: 3,  paid: true,  icon: '🎵', cancellable: true },
  ],
};
