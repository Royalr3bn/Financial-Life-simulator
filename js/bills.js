/* ═══════════════════════════════════════
   PENNY WISE — Bills Logic
   Pay, cancel, autopay, late fees
   ═══════════════════════════════════════ */

function payBill(billId) {
  const bill = GameState.bills.find(b => b.id === billId);
  if (!bill || bill.paid) return;

  const totalOwed = bill.amount + (GameState.lateFees[billId] || 0);

  if (GameState.balance < totalOwed) {
    showNotification(`Can't afford ${bill.name}! Need £${totalOwed}, have £${GameState.balance}`, 'warning');
    return;
  }

  GameState.balance -= totalOwed;
  bill.paid = true;

  // Clear late fees
  if (GameState.lateFees[billId]) {
    showNotification(`Paid ${bill.name}: £${bill.amount} + £${GameState.lateFees[billId]} late fees`, 'info');
    delete GameState.lateFees[billId];
  } else {
    showNotification(`Paid ${bill.name}: £${bill.amount}`, 'success');
  }

  // Track spending
  trackSpending(bill);

  // Paying bills reduces stress
  GameState.stress = clamp(GameState.stress - 5);

  updateUI();
}

function payAllBills() {
  const unpaid = GameState.bills.filter(b => !b.paid);
  let totalNeeded = 0;

  unpaid.forEach(bill => {
    totalNeeded += bill.amount + (GameState.lateFees[bill.id] || 0);
  });

  if (GameState.balance < totalNeeded) {
    showNotification(`Can't pay all bills! Need £${totalNeeded}, have £${GameState.balance}`, 'warning');
    return;
  }

  unpaid.forEach(bill => {
    const totalOwed = bill.amount + (GameState.lateFees[bill.id] || 0);
    GameState.balance -= totalOwed;
    bill.paid = true;
    trackSpending(bill);
    if (GameState.lateFees[bill.id]) {
      delete GameState.lateFees[bill.id];
    }
  });

  GameState.stress = clamp(GameState.stress - 15);
  showNotification(`All bills paid! -£${totalNeeded}`, 'success');

  updateUI();
}

function cancelSubscription(billId) {
  const bill = GameState.bills.find(b => b.id === billId);
  if (!bill || !bill.cancellable) return;

  // Remove from bills array
  GameState.bills = GameState.bills.filter(b => b.id !== billId);

  // Cancelling might reduce happiness (especially if used a lot)
  if (bill.usageDays && bill.usageDays > 10) {
    GameState.happiness = clamp(GameState.happiness - 10);
    showNotification(`Cancelled ${bill.name} — you'll miss it. -Happiness`, 'info');
  } else {
    GameState.happiness = clamp(GameState.happiness - 2);
    showNotification(`Cancelled ${bill.name} — saves £${bill.amount}/mo (£${bill.amount * 12}/yr)`, 'success');
  }

  updateUI();
}

function toggleAutopay(billId) {
  const bill = GameState.bills.find(b => b.id === billId);
  if (!bill) return;

  bill.autopay = !bill.autopay;
  showNotification(`${bill.name} autopay: ${bill.autopay ? 'ON' : 'OFF'}`, 'info');
  updateUI();
}

// ——— Event delegation for bills view ———
document.addEventListener('click', (e) => {
  // Pay individual bill
  if (e.target.classList.contains('btn-pay') && e.target.dataset.bill) {
    payBill(e.target.dataset.bill);
  }

  // Cancel subscription
  if (e.target.classList.contains('btn-cancel') && e.target.dataset.bill) {
    cancelSubscription(e.target.dataset.bill);
  }

  // Pay all
  if (e.target.classList.contains('pay-all')) {
    payAllBills();
  }
});
