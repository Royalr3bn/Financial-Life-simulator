/* ═══════════════════════════════════════
   PENNY WISE — Core Game Loop
   Day advance, payday, stats, month end
   ═══════════════════════════════════════ */

function endDay() {
  if (GameState.gameOver) return;

  GameState.day++;

  // ——— Passive rest (basic night's sleep) ———
  GameState.energy = clamp(GameState.energy + 10);
  GameState.stress = clamp(GameState.stress - 2);

  // ——— Month rollover ———
  if (GameState.day > GameState.daysInMonth) {
    endMonth();
    GameState.day = 1;
    GameState.month++;
    if (GameState.month > 11) {
      GameState.month = 0;
      GameState.year++;
    }
    startMonth();
  }

  // ——— Payday ———
  if (GameState.day === GameState.payday) {
    GameState.balance += GameState.salary;
    showNotification(`Payday! +£${GameState.salary}`, 'success');
  }

  // ——— Autopay bills ———
  GameState.bills.forEach(bill => {
    if (!bill.paid && bill.autopay && bill.dueDay === GameState.day) {
      if (GameState.balance >= bill.amount) {
        GameState.balance -= bill.amount;
        bill.paid = true;
        trackSpending(bill);
        showNotification(`Autopaid: ${bill.name} — £${bill.amount}`, 'info');
      } else {
        showNotification(`Autopay failed: ${bill.name} — not enough funds!`, 'warning');
      }
    }
  });

  // ——— Late fees ———
  GameState.bills.forEach(bill => {
    if (!bill.paid && bill.dueDay < GameState.day) {
      const lateFee = 5;
      if (!GameState.lateFees[bill.id]) {
        GameState.lateFees[bill.id] = 0;
      }
      GameState.lateFees[bill.id] += lateFee;
      GameState.stress = clamp(GameState.stress + 3);
      showNotification(`Late fee: ${bill.name} +£${lateFee}`, 'warning');
    }
  });

  // ——— Overdraft check ———
  if (GameState.balance < 0) {
    GameState.balance -= GameState.overdraftFeePerDay;
    GameState.debt += GameState.overdraftFeePerDay;
    GameState.stress = clamp(GameState.stress + 5);
    showNotification(`Overdraft fee: -£${GameState.overdraftFeePerDay}`, 'danger');
  }

  // ——— Daily stat changes ———
  // Energy slowly drains
  GameState.energy = clamp(GameState.energy - 5);

  // Hunger effect — if no groceries bought recently, energy drains faster
  if (GameState.groceryCount === 0 && GameState.day > 7) {
    GameState.energy = clamp(GameState.energy - 5);
    GameState.happiness = clamp(GameState.happiness - 2);
  }

  // Stress slowly decays (recovery)
  GameState.stress = clamp(GameState.stress - 2);

  // Low energy = stress goes up
  if (GameState.energy < 20) {
    GameState.stress = clamp(GameState.stress + 5);
  }

  // High stress = happiness drops
  if (GameState.stress > 80) {
    GameState.happiness = clamp(GameState.happiness - 3);
  }

  // Low balance anxiety
  if (GameState.balance < 100) {
    GameState.stress = clamp(GameState.stress + 3);
    GameState.happiness = clamp(GameState.happiness - 2);
  }

  // ——— Job review countdown ———
  GameState.job.reviewIn--;

  // ——— Game over checks ———
  checkGameOver();

  // ——— Update the UI ———
  updateUI();
}

function endMonth() {
  // Record monthly history
  const monthName = MONTH_NAMES[GameState.month];
  const savedThisMonth = GameState.spending.savings;
  GameState.monthlyHistory.push({
    month: monthName,
    balance: GameState.savings,
    saved: savedThisMonth,
  });

  // Interest on savings
  const monthlyInterest = Math.round((GameState.savings * GameState.savingsInterestRate) / 12);
  if (monthlyInterest > 0) {
    GameState.savings += monthlyInterest;
    showNotification(`Savings interest: +£${monthlyInterest}`, 'success');
  }

  // Check monthly achievements
  checkMonthlyAchievements();

  showNotification(`End of ${monthName} — check your stats!`, 'info');
}

function startMonth() {
  // Reset bills to unpaid for new month
  GameState.bills.forEach(bill => {
    bill.paid = false;
  });

  // Reset monthly tracking
  GameState.spending = {
    rent: 0,
    groceries: 0,
    utilities: 0,
    subscriptions: 0,
    impulse: 0,
    savings: 0,
  };
  GameState.lateFees = {};
  GameState.impulseThisMonth = 0;
  GameState.groceryCount = 0;

  showNotification(`Welcome to ${MONTH_NAMES[GameState.month]} ${GameState.year}!`, 'info');
}

function trackSpending(bill) {
  if (bill.type === 'HOUSING') {
    GameState.spending.rent += bill.amount;
  } else if (bill.type === 'UTILITY') {
    GameState.spending.utilities += bill.amount;
  } else if (bill.type === 'SUB') {
    GameState.spending.subscriptions += bill.amount;
  }
}

function checkGameOver() {
  // Debt too high
  if (GameState.debt > 500) {
    GameState.gameOver = true;
    GameState.gameOverReason = 'Debt spiralled out of control. You couldn\'t keep up with payments.';
    showNotification('GAME OVER: Debt crisis!', 'danger');
  }

  // Fired from job
  if (GameState.job.warningCount >= 3) {
    GameState.gameOver = true;
    GameState.gameOverReason = 'You were fired for missing too many shifts. No income means no way to pay bills.';
    showNotification('GAME OVER: You got fired!', 'danger');
  }

  // All stats bottomed out
  if (GameState.happiness <= 0 && GameState.energy <= 0 && GameState.stress >= 100) {
    GameState.gameOver = true;
    GameState.gameOverReason = 'Complete burnout. Your health and happiness hit rock bottom.';
    showNotification('GAME OVER: Burnout!', 'danger');
  }
}

function checkMonthlyAchievements() {
  // No impulse month
  if (GameState.impulseThisMonth === 0 && !GameState.achievements.noImpulse.unlocked) {
    GameState.achievements.noImpulse.unlocked = true;
    showNotification('🏆 Achievement: No Impulse Month!', 'success');
  }

  // Rainy day ready
  if (GameState.savings >= 1000 && !GameState.achievements.rainyDay.unlocked) {
    GameState.achievements.rainyDay.unlocked = true;
    showNotification('🏆 Achievement: Rainy Day Ready!', 'success');
  }

  // All bills paid on time
  const anyLate = Object.keys(GameState.lateFees).length > 0;
  if (!anyLate && !GameState.achievements.billPayer.unlocked) {
    GameState.achievements.billPayer.unlocked = true;
    showNotification('🏆 Achievement: Bill Payer!', 'success');
  }
}