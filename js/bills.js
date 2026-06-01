/* 
   PENNY WISE — Bills Logic
   Pay, cancel, autopay, late fees
    */

function payBill(billId) {
  // Locate the selected bill and skip if it is already paid or does not exist.
  const bill = GameState.bills.find(b => b.id === billId);
  if (!bill || bill.paid) return;

  // Include any accumulated late fees for this bill when calculating the full payment.
  const totalOwed = bill.amount + (GameState.lateFees[billId] || 0);

  if (GameState.balance < totalOwed) {
    showNotification(`Can't afford ${bill.name}! Need £${totalOwed}, have £${GameState.balance}`, 'warning');
    return;
  }

  GameState.balance -= totalOwed;
  bill.paid = true;

  if (GameState.lateFees[billId]) {
    showNotification(`Paid ${bill.name}: £${bill.amount} + £${GameState.lateFees[billId]} late fees`, 'info');
    delete GameState.lateFees[billId];
  } else {
    showNotification(`Paid ${bill.name}: £${bill.amount}`, 'success');
  }

  // Record this payment in the monthly spending tracker and reduce stress.
  trackSpending(bill);
  GameState.stress = clamp(GameState.stress - 5);
  updateUI();
}

function payAllBills() {
  // Gather all remaining unpaid bills and calculate the total amount due.
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
  // Remove the cancellable subscription from the active bill list.
  const bill = GameState.bills.find(b => b.id === billId);
  if (!bill || !bill.cancellable) return;

  GameState.bills = GameState.bills.filter(b => b.id !== billId);

  if (bill.usageDays && bill.usageDays > 10) {
    GameState.happiness = clamp(GameState.happiness - 10);
    showNotification(`Cancelled ${bill.name} — you'll miss it. -Happiness`, 'info');
  } else {
    GameState.happiness = clamp(GameState.happiness - 2);
    showNotification(`Cancelled ${bill.name} — saves £${bill.amount}/mo`, 'success');
  }

  updateUI();
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-pay') && e.target.getAttribute('data-bill')) {
    payBill(e.target.getAttribute('data-bill'));
  }
  if (e.target.classList.contains('btn-cancel') && e.target.getAttribute('data-bill')) {
    cancelSubscription(e.target.getAttribute('data-bill'));
  }
  if (e.target.classList.contains('pay-all')) {
    payAllBills();
  }
});