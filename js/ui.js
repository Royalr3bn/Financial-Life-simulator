/* ═══════════════════════════════════════
   PENNY WISE — UI Updater
   Syncs HTML elements with GameState
   ═══════════════════════════════════════ */

function updateUI() {
  // ——— Top bar ———
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

  // ——— Stat bars ———
  const happyBar = document.querySelector('.bar.happy > span');
  const energyBar = document.querySelector('.bar.energy > span');
  const stressBar = document.querySelector('.bar.stress > span');

  if (happyBar) happyBar.style.width = `${GameState.happiness}%`;
  if (energyBar) energyBar.style.width = `${GameState.energy}%`;
  if (stressBar) stressBar.style.width = `${GameState.stress}%`;

  // ——— Home sidebar budget ———
  updateHomeBudget();

  // ——— Bills view ———
  updateBillsView();

  // ——— Shop cart ———
  updateCartView();

  // ——— Bank view ———
  updateBankView();

  // ——— Speech bubble ———
  updateBubble();

  // ——— Notification badge ———
  updateNotifBadge();
}

function updateHomeBudget() {
  const panel = document.querySelector('#view-home .panel');
  if (!panel) return;

  const totalBills = GameState.bills
    .filter(b => !b.paid)
    .reduce((sum, b) => sum + b.amount, 0);

  const groceryEstimate = 240;
  const savingsTarget = 150;

  panel.innerHTML = `
    <div class="budget-row income"><span class="lbl">Salary</span><span class="val">+${GameState.salary}</span></div>
    <div class="budget-row expense"><span class="lbl">Rent</span><span class="val">-850</span></div>
    <div class="budget-row expense"><span class="lbl">Groceries</span><span class="val">-${groceryEstimate}</span></div>
    <div class="budget-row expense"><span class="lbl">Utilities</span><span class="val">-${totalBills - 850}</span></div>
    <div class="budget-row expense"><span class="lbl">Subs</span><span class="val">-${GameState.bills.filter(b => b.type === 'SUB' && !b.paid).reduce((s, b) => s + b.amount, 0)}</span></div>
    <div class="budget-row save"><span class="lbl">Savings</span><span class="val">+${savingsTarget}</span></div>
  `;
}

function updateBillsView() {
  // Summary cards
  const overdueBills = GameState.bills.filter(b => !b.paid && b.dueDay < GameState.day);
  const upcomingBills = GameState.bills.filter(b => !b.paid && b.dueDay >= GameState.day);
  const paidBills = GameState.bills.filter(b => b.paid);

  const overdueTotal = overdueBills.reduce((s, b) => s + b.amount, 0);
  const upcomingTotal = upcomingBills.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paidBills.reduce((s, b) => s + b.amount, 0);
  const monthTotal = GameState.bills.reduce((s, b) => s + b.amount, 0);

  // Update summary cards
  const summaryVals = document.querySelectorAll('#view-bills .sum-card .val');
  if (summaryVals.length >= 4) {
    summaryVals[0].textContent = `£ ${overdueTotal}`;
    summaryVals[1].textContent = `£ ${upcomingTotal}`;
    summaryVals[2].textContent = `£ ${paidTotal}`;
    summaryVals[3].textContent = `£ ${monthTotal}`;
  }

  // Update pay-all button
  const payAllBtn = document.querySelector('.pay-all');
  const unpaidTotal = GameState.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  if (payAllBtn) payAllBtn.innerHTML = `PAY ALL<br>£ ${unpaidTotal}`;

  // Rebuild bills list
  const billsList = document.querySelector('.bills-list');
  if (!billsList) return;

  let html = '';

  // Overdue
  if (overdueBills.length > 0) {
    html += '<div class="section-label">▶ OVERDUE ◀</div>';
    overdueBills.forEach(bill => {
      const daysLate = GameState.day - bill.dueDay;
      html += buildBillCard(bill, -daysLate, true);
    });
  }

  // Upcoming
  if (upcomingBills.length > 0) {
    html += '<div class="section-label upcoming">▶ UPCOMING ◀</div>';
    upcomingBills.forEach(bill => {
      const daysUntil = bill.dueDay - GameState.day;
      html += buildBillCard(bill, daysUntil, false);
    });
  }

  // Paid
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
  const daysText = isOverdue ? `${days} DAYS` : `${days} DAYS`;
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
  const cartItemsEl = document.querySelector('.cart-items');
  const cartCountEl = document.querySelector('.cart-count');
  const cartTotalsEl = document.querySelector('.cart-totals');
  const budgetImpactEl = document.querySelector('.budget-impact');
  const checkoutBtn = document.querySelector('.btn-checkout');

  if (!cartItemsEl) return;

  // Cart items
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

  // Count
  if (cartCountEl) cartCountEl.textContent = GameState.cart.length;

  // Totals
  const essentialTotal = GameState.cart.filter(i => i.category === 'essential').reduce((s, i) => s + i.price, 0);
  const impulseTotal = GameState.cart.filter(i => i.category === 'impulse').reduce((s, i) => s + i.price, 0);
  const otherTotal = GameState.cart.filter(i => i.category !== 'essential' && i.category !== 'impulse').reduce((s, i) => s + i.price, 0);
  const cartTotal = GameState.cart.reduce((s, i) => s + i.price, 0);

  if (cartTotalsEl) {
    cartTotalsEl.innerHTML = `
      <div class="cart-row"><span class="cr-label">Essentials</span><span class="cr-value">£ ${essentialTotal}</span></div>
      ${impulseTotal > 0 ? `<div class="cart-row"><span class="cr-label">Impulse</span><span class="cr-value" style="color: var(--red)">£ ${impulseTotal}</span></div>` : ''}
      ${otherTotal > 0 ? `<div class="cart-row"><span class="cr-label">Other</span><span class="cr-value">£ ${otherTotal}</span></div>` : ''}
      <div class="cart-row total"><span class="cr-label">TOTAL</span><span class="cr-value">£ ${cartTotal}</span></div>
    `;
  }

  // Budget impact
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

  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.textContent = `CHECKOUT — £ ${cartTotal}`;
    checkoutBtn.disabled = GameState.cart.length === 0;
  }
}

function updateBankView() {
  // Current account
  const currentBal = document.querySelector('.account-card.current .acc-balance');
  const savingsBal = document.querySelector('.account-card.savings .acc-balance');

  if (currentBal) currentBal.textContent = `£ ${GameState.balance.toLocaleString()}`;
  if (savingsBal) savingsBal.textContent = `£ ${GameState.savings.toLocaleString()}`;

  // Transfer boxes
  const fromBox = document.querySelector('.transfer-box:first-child .tb-balance');
  const toBox = document.querySelector('.transfer-controls .transfer-box:last-child .tb-balance');
  if (fromBox) fromBox.textContent = `£ ${GameState.balance.toLocaleString()}`;
  if (toBox) toBox.textContent = `£ ${GameState.savings.toLocaleString()}`;

  // Net worth
  const netWorth = GameState.balance + GameState.savings - GameState.debt;
  const summaryRows = document.querySelectorAll('#view-bank .sidebar .budget-row .val');
  if (summaryRows.length >= 4) {
    summaryRows[0].textContent = `£${netWorth.toLocaleString()}`;
    summaryRows[1].textContent = `£${GameState.balance.toLocaleString()}`;
    summaryRows[2].textContent = `£${GameState.savings.toLocaleString()}`;
    summaryRows[3].textContent = `£${GameState.debt}`;
  }

  // Savings goal bars
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

  // Find most urgent thing to say
  const overdueBills = GameState.bills.filter(b => !b.paid && b.dueDay < GameState.day);
  const soonBills = GameState.bills.filter(b => !b.paid && b.dueDay >= GameState.day && (b.dueDay - GameState.day) <= 3);

  if (GameState.energy < 20) {
    bubble.textContent = "I'M EXHAUSTED...";
  } else if (overdueBills.length > 0) {
    bubble.textContent = `${overdueBills[0].name.toUpperCase()} IS OVERDUE!`;
  } else if (soonBills.length > 0) {
    const days = soonBills[0].dueDay - GameState.day;
    bubble.textContent = `${soonBills[0].name.toUpperCase()} DUE IN ${days} DAY${days > 1 ? 'S' : ''}!`;
  } else if (GameState.stress > 80) {
    bubble.textContent = "SO STRESSED...";
  } else if (GameState.happiness > 80) {
    bubble.textContent = "LIFE IS GOOD!";
  } else if (GameState.balance < 200) {
    bubble.textContent = "MONEY IS TIGHT...";
  } else {
    bubble.textContent = "WHAT SHOULD I DO TODAY?";
  }
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

// Helper to clamp values between 0-100
function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

// Helper to show a temporary notification
function showNotification(text, type = 'info') {
  GameState.notifications.push({ text, type, time: Date.now() });
  // TODO: render notification popup
  console.log(`[${type.toUpperCase()}] ${text}`);
}
