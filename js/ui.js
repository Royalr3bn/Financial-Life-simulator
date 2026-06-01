/* 
   PENNY WISE — UI Updater
   Syncs HTML elements with GameState
    */

function updateUI() {
  // Main UI sync: update the dashboard, status bars, and panel views from GameState.
  // Top bar
  const monthLabel = document.querySelector('.date-badge .month');
  const dayLabel = document.querySelector('.date-badge .day');
  const balanceLabel = document.querySelector('.wallet .amount');
  const paydayLabel = document.querySelector('.wallet .sub');

  if (monthLabel) monthLabel.textContent = `${MONTH_NAMES[GameState.month]} ${GameState.year}`;
  if (dayLabel) dayLabel.textContent = `DAY ${GameState.day} / ${GameState.daysInMonth}`;
  if (balanceLabel) balanceLabel.textContent = `£ ${GameState.balance.toLocaleString()}`;

  // Payday countdown
  let daysToPayday = 0;
  if (GameState.day < GameState.payday) {
    daysToPayday = GameState.payday - GameState.day;
  } else {
    daysToPayday = GameState.daysInMonth - GameState.day + GameState.payday;
  }
  if (paydayLabel) paydayLabel.textContent = `+£${GameState.salary.toLocaleString()} payday in ${daysToPayday}d`;

  // Stat bars
  const happyBar = document.querySelector('.bar.happy > span');
  const energyBar = document.querySelector('.bar.energy > span');
  const stressBar = document.querySelector('.bar.stress > span');

  if (happyBar) happyBar.style.width = `${GameState.happiness}%`;
  if (energyBar) energyBar.style.width = `${GameState.energy}%`;
  if (stressBar) stressBar.style.width = `${GameState.stress}%`;

  //  Job view performance updates 
  const jobTitleCard = document.querySelector('.job-details .job-title');
  const jobCompanyCard = document.querySelector('.job-details .job-company');
  const jobSalaryCard = document.querySelector('.job-salary .sal-amount');
  const careerSalaryRow = document.querySelector('#view-job .sidebar .panel .budget-row.income .val');
  const warningBannerText = document.querySelector('.job-warning .jw-text');
  const warningBanner = document.querySelector('.job-warning');
  const performanceBarFill = document.querySelector('.perf-bar > span');
  const performanceRatingBadge = document.querySelector('.perf-rating');

  if (jobTitleCard) jobTitleCard.textContent = GameState.job.title.toUpperCase();
  if (jobCompanyCard) jobCompanyCard.textContent = GameState.job.company;
  if (jobSalaryCard) jobSalaryCard.textContent = `£ ${GameState.salary.toLocaleString()}`;
  if (careerSalaryRow) careerSalaryRow.textContent = `£${GameState.salary.toLocaleString()}`;
  
  if (performanceBarFill) performanceBarFill.style.width = `${GameState.job.performance}%`;
  
  if (performanceRatingBadge) {
    if (GameState.job.performance >= 75) {
      performanceRatingBadge.textContent = 'GOOD';
      performanceRatingBadge.className = 'perf-rating good';
    } else if (GameState.job.performance >= 40) {
      performanceRatingBadge.textContent = 'AVERAGE';
      performanceRatingBadge.className = 'perf-rating average';
    } else {
      performanceRatingBadge.textContent = 'POOR';
      performanceRatingBadge.className = 'perf-rating poor';
    }
  }

  // Handle active written warnings tracking
  if (warningBanner && warningBannerText) {
    if (GameState.job.warningCount > 0) {
      warningBanner.style.display = 'flex';
      warningBannerText.textContent = `WARNING: You have missed ${GameState.job.shiftsMissed} shift(s). Current status: ${GameState.job.warningCount}/3 warnings issued!`;
    } else {
      warningBanner.style.display = 'none';
    }
  }

  // Update counter cards
  const shiftsWorkedValue = document.querySelector('.perf-stat.good .ps-value');
  const shiftsMissedValue = document.querySelector('.perf-stat.warn .ps-value');
  if (shiftsWorkedValue) shiftsWorkedValue.textContent = GameState.job.shiftsWorked;
  if (shiftsMissedValue) shiftsMissedValue.textContent = GameState.job.shiftsMissed;

  updateHomeBudget();
  updateBillsView();
  updateCartView();
  updateBankView();
  updateWeeklySchedule();
  updateJobBoardRequirements();
  updateBubble();
  updateNotifBadge();
  checkGameOver();
}

function updateJobBoardRequirements() {
  // Dynamically update met/unmet checkmarks on job listings based on current performance
  const listings = document.querySelectorAll('.job-listing');
  listings.forEach(listing => {
    const titleEl = listing.querySelector('.jl-title');
    if (!titleEl) return;
    
    if (titleEl.textContent.trim() === '💻 JUNIOR DEVELOPER') {
      const perfReqEl = listing.querySelector('.jl-reqs .jl-req:nth-child(2)');
      if (perfReqEl) {
        if (GameState.job.performance >= 75) {
          perfReqEl.textContent = '✓ PERF. ABOVE 75%';
          perfReqEl.className = 'jl-req met';
        } else {
          perfReqEl.textContent = '✗ PERF. ABOVE 75%';
          perfReqEl.className = 'jl-req unmet';
        }
      }
    }
  });
}

function updateWeeklySchedule() {
  // Build the weekly schedule view using the current game day and working history.
  const scheduleGrid = document.querySelector('.schedule-grid');
  if (!scheduleGrid) return;

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const currentWeekStart = Math.floor((GameState.day - 1) / 7) * 7 + 1;

  let html = '';
  daysOfWeek.forEach((day, index) => {
    const targetDayNumber = currentWeekStart + index;
    let status = '—';
    let dayClass = 'off';

    if (index < 5) {
      dayClass = 'work';
      if (GameState.workedDays.includes(targetDayNumber)) {
        status = '✓';
      } else if (targetDayNumber < GameState.day) {
        status = '✗';
        dayClass = 'missed';
      } else if (targetDayNumber === GameState.day) {
        status = '?';
        dayClass = 'work today';
      } else {
        status = '?';
      }
    } else {
      status = 'OFF';
    }

    html += `
      <div class="sched-day ${dayClass}">
        <div class="sd-name">${day}</div>
        <div class="sd-status">${status}</div>
      </div>
    `;
  });

  scheduleGrid.innerHTML = html;
}

function updateHomeBudget() {
  const panel = document.querySelector('#view-home .panel');
  if (!panel) return;

  const totalBills = GameState.bills.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0);
  const groceryEstimate = 240;
  const savingsTarget = 150;

  panel.innerHTML = `
    <div class="budget-row income"><span class="lbl">Salary</span><span class="val">+${GameState.salary}</span></div>
    <div class="budget-row expense"><span class="lbl">Rent</span><span class="val">-850</span></div>
    <div class="budget-row expense"><span class="lbl">Groceries</span><span class="val">-${groceryEstimate}</span></div>
    <div class="budget-row expense"><span class="lbl">Utilities</span><span class="val" style="color: var(--ink)">-${totalBills}</span></div>
    <div class="budget-row expense"><span class="lbl">Subs</span><span class="val">-${GameState.bills.filter(b => b.type === 'SUB' && !b.paid).reduce((s, b) => s + b.amount, 0)}</span></div>
    <div class="budget-row save"><span class="lbl">Savings</span><span class="val">+${savingsTarget}</span></div>
  `;
}

function updateBillsView() {
  const overdueBills = GameState.bills.filter(b => !b.paid && b.dueDay < GameState.day);
  const upcomingBills = GameState.bills.filter(b => !b.paid && b.dueDay >= GameState.day);
  const paidBills = GameState.bills.filter(b => b.paid);

  const overdueTotal = overdueBills.reduce((s, b) => s + b.amount, 0);
  const upcomingTotal = upcomingBills.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paidBills.reduce((s, b) => s + b.amount, 0);
  const monthTotal = GameState.bills.reduce((s, b) => s + b.amount, 0);

  const summaryVals = document.querySelectorAll('#view-bills .sum-card .val');
  if (summaryVals.length >= 4) {
    summaryVals[0].textContent = `£ ${overdueTotal}`;
    summaryVals[1].textContent = `£ ${upcomingTotal}`;
    summaryVals[2].textContent = `£ ${paidTotal}`;
    summaryVals[3].textContent = `£ ${monthTotal}`;
  }

  const payAllBtn = document.querySelector('.pay-all');
  const unpaidTotal = GameState.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  if (payAllBtn) payAllBtn.innerHTML = `PAY ALL<br>£ ${unpaidTotal}`;

  const billsList = document.querySelector('.bills-list');
  if (!billsList) return;

  let html = '';
  if (overdueBills.length > 0) {
    html += '<div class="section-label">▶ OVERDUE ◀</div>';
    overdueBills.forEach(bill => {
      const daysLate = GameState.day - bill.dueDay;
      html += buildBillCard(bill, daysLate, true);
    });
  }

  if (upcomingBills.length > 0) {
    html += '<div class="section-label upcoming">▶ UPCOMING ◀</div>';
    upcomingBills.forEach(bill => {
      const daysUntil = bill.dueDay - GameState.day;
      html += buildBillCard(bill, daysUntil, false);
    });
  }

  if (paidBills.length > 0) {
    html += '<div class="section-label paid">▶ PAID ◀</div>';
    paidBills.forEach(bill => {
      html += `
        <div class="bill is-paid">
          <div class="bill-icon ${bill.id}">${bill.icon}</div>
          <div class="bill-info">
            <div class="name">${bill.name.toUpperCase()}</div>
            <div class="meta"><span class="tag">${bill.type}</span> Paid this month</div>
          </div>
          <div class="bill-amount">£ ${bill.amount}</div>
          <div class="paid-stamp">PAID ✓</div>
        </div>
      `;
    });
  }
  billsList.innerHTML = html;
}

function buildBillCard(bill, days, isOverdue) {
  const daysText = `${days} DAYS`;
  const daysClass = isOverdue ? '' : (days <= 3 ? 'warn-days' : '');
  const cancelBtn = bill.cancellable ? `<button class="btn-cancel" data-bill="${bill.id}">CANCEL</button>` : '';

  return `
    <div class="bill ${isOverdue ? 'overdue' : ''}">
      <div class="bill-icon ${bill.id}">${bill.icon}</div>
      <div class="bill-info">
        <div class="name">${bill.name.toUpperCase()}</div>
        <div class="meta"><span class="tag">${bill.type}</span> ${isOverdue ? 'OVERDUE — late fees risk!' : 'Monthly'}</div>
      </div>
      <div class="bill-due"><div>DUE</div><div class="days ${daysClass}">${daysText}</div></div>
      <div class="bill-amount">£ ${bill.amount}</div>
      <div class="bill-actions">
        <button class="btn-pay" data-bill="${bill.id}">${isOverdue ? 'PAY NOW' : 'PAY'}</button>
        ${cancelBtn}
      </div>
    </div>
  `;
}

function updateCartView() {
  // Refresh the shopping cart view and calculate spending impacts.
  const cartItemsEl = document.querySelector('.cart-items');
  const cartCountEl = document.querySelector('.cart-count');
  const cartTotalsEl = document.querySelector('.cart-totals');
  const budgetImpactEl = document.querySelector('.budget-impact');
  const checkoutBtn = document.querySelector('.btn-checkout');

  if (!cartItemsEl) return;

  if (GameState.cart.length === 0) {
    cartItemsEl.innerHTML = '<div style="text-align:center; color: var(--ink-dim); font-size: 14px; padding: 10px;">Cart is empty</div>';
  } else {
    cartItemsEl.innerHTML = GameState.cart.map((item, i) => `
      <div class="cart-item">
        <span class="ci-name">${item.icon} ${item.name}</span>
        <span class="ci-price">£${item.price}</span>
        <div class="ci-remove" data-cart-index="${i}">×</div>
      </div>
    `).join('');
  }

  if (cartCountEl) cartCountEl.textContent = GameState.cart.length;

  const essentialTotal = GameState.cart.filter(i => i.category === 'essential').reduce((s, i) => s + i.price, 0);
  const impulseTotal = GameState.cart.filter(i => i.category === 'impulse').reduce((s, i) => s + i.price, 0);
  const otherTotal = GameState.cart.filter(i => i.category !== 'essential' && i.category !== 'impulse').reduce((s, i) => s + i.price, 0);
  const cartTotal = GameState.cart.reduce((sum, item) => sum + item.price, 0);

  if (cartTotalsEl) {
    cartTotalsEl.innerHTML = `
      <div class="cart-row"><span class="cr-label">Essentials</span><span class="cr-value">£ ${essentialTotal}</span></div>
      ${impulseTotal > 0 ? `<div class="cart-row"><span class="cr-label">Impulse</span><span class="cr-value" style="color: var(--red)">£ ${impulseTotal}</span></div>` : ''}
      ${otherTotal > 0 ? `<div class="cart-row"><span class="cr-label">Other</span><span class="cr-value">£ ${otherTotal}</span></div>` : ''}
      <div class="cart-row total"><span class="cr-label">TOTAL</span><span class="cr-value">£ ${cartTotal}</span></div>
    `;
  }

  const unpaidBills = GameState.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const leftOver = GameState.balance - cartTotal - unpaidBills;

  if (budgetImpactEl) {
    budgetImpactEl.innerHTML = `
      <div class="impact-row"><span class="ir-label">Balance now</span><span class="ir-value">£ ${GameState.balance.toLocaleString()}</span></div>
      <div class="impact-row"><span class="ir-label">Cart total</span><span class="ir-value" style="color: var(--red)">- £ ${cartTotal}</span></div>
      <div class="impact-row"><span class="ir-label">Bills due</span><span class="ir-value" style="color: var(--red)">- £ ${unpaidBills}</span></div>
      <div class="impact-row remaining ${leftOver < 0 ? 'danger' : ''}"><span class="ir-label">LEFT OVER</span><span class="ir-value">£ ${leftOver}</span></div>
    `;
  }

  if (checkoutBtn) {
    checkoutBtn.textContent = `CHECKOUT — £ ${cartTotal}`;
    checkoutBtn.disabled = GameState.cart.length === 0;
  }
}

function updateBankView() {
  const currentBal = document.querySelector('.account-card.current .acc-balance');
  const savingsBal = document.querySelector('.account-card.savings .acc-balance');

  if (currentBal) currentBal.textContent = `£ ${GameState.balance.toLocaleString()}`;
  if (savingsBal) savingsBal.textContent = `£ ${GameState.savings.toLocaleString()}`;

  const fromBox = document.querySelector('.transfer-box:first-child .tb-balance');
  const toBox = document.querySelector('.transfer-controls .transfer-box:last-child .tb-balance');
  
  if (GameState.transferDirection === 'to_savings') {
    if (fromBox) fromBox.textContent = `£ ${GameState.balance.toLocaleString()}`;
    if (toBox) toBox.textContent = `£ ${GameState.savings.toLocaleString()}`;
  } else {
    if (fromBox) fromBox.textContent = `£ ${GameState.savings.toLocaleString()}`;
    if (toBox) toBox.textContent = `£ ${GameState.balance.toLocaleString()}`;
  }

  const netWorth = GameState.balance + GameState.savings - GameState.debt;
  const summaryRows = document.querySelectorAll('#view-bank .sidebar .budget-row .val');
  if (summaryRows.length >= 4) {
    summaryRows[0].textContent = `£${netWorth.toLocaleString()}`;
    summaryRows[1].textContent = `£${GameState.balance.toLocaleString()}`;
    summaryRows[2].textContent = `£${GameState.savings.toLocaleString()}`;
    summaryRows[3].textContent = `£${GameState.debt}`;
  }

  const emergencyBar = document.querySelector('.goal-bar.emergency > span');
  const emergencyPct = document.querySelector('.goal-card:nth-child(2) .gf-pct');
  const emergencyAmounts = document.querySelector('.goal-card:nth-child(2) .goal-amounts');
  if (emergencyBar) {
    const pct = Math.min(100, Math.round((GameState.savings / 1000) * 100));
    emergencyBar.style.width = `${pct}%`;
    if (emergencyPct) emergencyPct.textContent = `${pct}%`;
    if (emergencyAmounts) emergencyAmounts.textContent = `£${GameState.savings} / £1,000`;
  }
}

function updateBubble() {
  const bubble = document.querySelector('.bubble');
  if (!bubble) return;

  const overdueBills = GameState.bills.filter(b => !b.paid && b.dueDay < GameState.day);
  const soonBills = GameState.bills.filter(b => !b.paid && b.dueDay >= GameState.day && (b.dueDay - GameState.day) <= 3);

  if (GameState.energy < 20) bubble.textContent = "I'M EXHAUSTED...";
  else if (overdueBills.length > 0) bubble.textContent = `${overdueBills[0].name.toUpperCase()} IS OVERDUE!`;
  else if (soonBills.length > 0) {
    const days = soonBills[0].dueDay - GameState.day;
    bubble.textContent = `${soonBills[0].name.toUpperCase()} DUE IN ${days} DAY${days > 1 ? 'S' : ''}!`;
  }
  else if (GameState.stress > 80) bubble.textContent = "SO STRESSED...";
  else if (GameState.happiness > 80) bubble.textContent = "LIFE IS GOOD!";
  else if (GameState.balance < 200) bubble.textContent = "MONEY IS TIGHT...";
  else bubble.textContent = "WHAT SHOULD I DO TODAY?";
}

function updateNotifBadge() {
  const badge = document.querySelector('.action-tab[data-view="view-bills"] .notif');
  if (!badge) return;

  const overdue = GameState.bills.filter(b => !b.paid && b.dueDay < GameState.day).length;
  const soon = GameState.bills.filter(b => !b.paid && b.dueDay >= GameState.day && (b.dueDay - GameState.day) <= 3).length;
  const count = overdue + soon;

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'grid';
  } else {
    badge.style.display = 'none';
  }
}

function clamp(val, min = 0, max = 100) { return Math.max(min, Math.min(max, val)); }
function showNotification(text, type = 'info') { console.log(`[${type.toUpperCase()}] ${text}`); }