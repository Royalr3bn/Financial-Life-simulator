/* ═══════════════════════════════════════
   PENNY WISE — Core Game Loop
   Day advance, payday, stats, month end
   ═══════════════════════════════════════ */

function endDay(chosenHours = 8) {
  if (GameState.gameOver) return;

  // ——— Kingdom Come Style Time-lapse Wheel Animation ———
  const overlay = document.getElementById('time-wheel-overlay');
  const dial = document.getElementById('rotating-dial');
  const counterText = document.getElementById('wheel-countdown-text');
  
  if (overlay && dial && counterText) {
    overlay.style.display = 'flex';
    
    let hoursRemaining = chosenHours;
    let currentRotation = 0;
    counterText.textContent = `${hoursRemaining}h`;

    const tickInterval = setInterval(() => {
      hoursRemaining--;
      currentRotation += 180;
      
      dial.style.transform = `rotate(${currentRotation}deg)`;
      counterText.textContent = `${hoursRemaining}h`;
      
      if (hoursRemaining <= 0) {
        clearInterval(tickInterval);
        overlay.style.display = 'none';
        finalizeDayCalculations(chosenHours);
      }
    }, 250);
  } else {
    finalizeDayCalculations(chosenHours);
  }
}

function finalizeDayCalculations(chosenHours) {
  // Calculate current weekday index index before advancing (0 = Mon, 4 = Fri, 5-6 = Weekend)
  const currentWeekdayIndex = (GameState.day - 1) % 7;

  // PASSIVE MISSED SHIFT TRACKING:
  // If today is Mon-Fri and the player did NOT work today or click skip shift
  if (currentWeekdayIndex < 5 && !GameState.workedToday) {
    GameState.job.shiftsMissed++;
    GameState.job.performance = clamp(GameState.job.performance - 15);
    
    // Every unexcused absence triggers an immediate warning increment
    GameState.job.warningCount++;
    showNotification(`No-show! You missed your shift. Warning ${GameState.job.warningCount}/3!`, 'danger');
  }

  GameState.day++;
  GameState.workedToday = false;

  if (typeof window.enableWorkButtons === 'function') {
    window.enableWorkButtons();
  }

  // ——— Variable Rest Calculations Based on Chosen Hours ———
  if (chosenHours === 4) {
    GameState.slept12Hours = false;
    GameState.energy = clamp(GameState.energy + 15);
    GameState.stress = clamp(GameState.stress + 5); 
    GameState.happiness = clamp(GameState.happiness - 5);
    showNotification('Short rest! Minimal energy recovery, stress rising.', 'warning');
  } else if (chosenHours === 12) {
    GameState.slept12Hours = true;
    GameState.energy = clamp(GameState.energy + 45);
    GameState.stress = clamp(GameState.stress - 20); 
    GameState.happiness = clamp(GameState.happiness + 5);
    showNotification('Deep sleep! Full recovery achieved.', 'success');
  } else {
    GameState.slept12Hours = false;
    GameState.energy = clamp(GameState.energy + 30);
    GameState.stress = clamp(GameState.stress - 10);
    GameState.happiness = clamp(GameState.happiness + 3);
    showNotification('Slept well! Healthy baseline metrics recovered.', 'success');
  }

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
  GameState.energy = clamp(GameState.energy - 5);

  if (GameState.groceryCount === 0 && GameState.day > 7) {
    GameState.energy = clamp(GameState.energy - 5);
    GameState.happiness = clamp(GameState.happiness - 2);
  }

  GameState.stress = clamp(GameState.stress - 2);

  if (GameState.energy < 20) {
    GameState.stress = clamp(GameState.stress + 5);
  }

  if (GameState.stress > 80) {
    GameState.happiness = clamp(GameState.happiness - 3);
  }

  if (GameState.balance < 100) {
    GameState.stress = clamp(GameState.stress + 3);
    GameState.happiness = clamp(GameState.happiness - 2);
  }

  GameState.job.reviewIn--;
  checkGameOver();
  updateUI();
}

function endMonth() {
  const monthName = MONTH_NAMES[GameState.month];
  const savedThisMonth = GameState.spending.savings;
  GameState.monthlyHistory.push({
    month: monthName,
    balance: GameState.savings,
    saved: savedThisMonth,
  });

  const monthlyInterest = Math.round((GameState.savings * GameState.savingsInterestRate) / 12);
  if (monthlyInterest > 0) {
    GameState.savings += monthlyInterest;
    showNotification(`Savings interest: +£${monthlyInterest}`, 'success');
  }

  checkMonthlyAchievements();
  showNotification(`End of ${monthName} — check your stats!`, 'info');
}

function startMonth() {
  GameState.bills.forEach(bill => { bill.paid = false; });
  GameState.spending = { rent: 0, groceries: 0, utilities: 0, subscriptions: 0, impulse: 0, savings: 0 };
  GameState.lateFees = {};
  GameState.impulseThisMonth = 0;
  GameState.groceryCount = 0;
  showNotification(`Welcome to ${MONTH_NAMES[GameState.month]} ${GameState.year}!`, 'info');
}

function trackSpending(bill) {
  if (bill.type === 'HOUSING') GameState.spending.rent += bill.amount;
  else if (bill.type === 'UTILITY') GameState.spending.utilities += bill.amount;
  else if (bill.type === 'SUB') GameState.spending.subscriptions += bill.amount;
}

function checkGameOver() {
  if (GameState.stress >= 100) {
    GameState.gameOver = true;
    GameState.gameOverReason = "Complete Burnout! Your stress levels hit 100% and you couldn't handle the pressure.";
    showNotification('GAME OVER: Stress Burnout!', 'danger');
    showGameOverModal();
    return;
  }
  if (GameState.debt > 500) {
    GameState.gameOver = true;
    GameState.gameOverReason = "Debt spiralled out of control. You couldn't keep up with payments.";
    showNotification('GAME OVER: Debt crisis!', 'danger');
    showGameOverModal();
    return;
  }
  if (GameState.job.warningCount >= 3) {
    GameState.gameOver = true;
    GameState.gameOverReason = "You were fired for missing too many shifts. No income means no way to pay bills.";
    showNotification('GAME OVER: You got fired!', 'danger');
    showGameOverModal();
    return;
  }
  if (GameState.happiness <= 0 && GameState.energy <= 0) {
    GameState.gameOver = true;
    GameState.gameOverReason = "Complete burnout. Your health and happiness hit rock bottom.";
    showNotification('GAME OVER: Burnout!', 'danger');
    showGameOverModal();
    return;
  }
}

function showGameOverModal() {
  if (document.getElementById('game-over-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'game-over-modal';
  modal.style.position = 'absolute';
  modal.style.top = '0'; modal.style.left = '0';
  modal.style.width = '100%'; modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(10, 6, 19, 0.9)'; 
  modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';

  const content = document.createElement('div');
  content.style.background = 'var(--panel)';
  content.style.border = '4px solid var(--red)';
  content.style.padding = '30px'; content.style.width = '440px'; content.style.textAlign = 'center';
  content.style.boxShadow = '0 0 20px rgba(0,0,0,0.8), inset -4px -4px 0 rgba(0,0,0,0.4)';

  const title = document.createElement('h2');
  title.textContent = '★ GAME OVER ★';
  title.style.fontFamily = 'var(--font-pixel)'; title.style.fontSize = '16px'; title.style.color = 'var(--red)'; title.style.marginBottom = '20px';

  const reason = document.createElement('p');
  reason.textContent = GameState.gameOverReason;
  reason.style.fontFamily = 'var(--font-body)'; reason.style.fontSize = '24px'; reason.style.color = 'var(--ink)'; reason.style.marginBottom = '30px';

  const restartBtn = document.createElement('button');
  restartBtn.textContent = 'RESTART ↻';
  restartBtn.style.fontFamily = 'var(--font-pixel)'; restartBtn.style.fontSize = '10px'; restartBtn.style.padding = '12px 24px';
  restartBtn.style.background = 'linear-gradient(180deg, var(--green) 0%, var(--green-deep) 100%)';
  restartBtn.style.color = 'var(--ink)'; restartBtn.style.border = '3px solid var(--panel-edge)'; restartBtn.style.cursor = 'pointer';

  restartBtn.onclick = () => { window.location.reload(); };

  content.appendChild(title); content.appendChild(reason); content.appendChild(restartBtn);
  modal.appendChild(content);

  const screenEl = document.querySelector('.screen');
  if (screenEl) screenEl.appendChild(modal);
  else document.body.appendChild(modal);
}

function checkMonthlyAchievements() {
  if (GameState.impulseThisMonth === 0 && !GameState.achievements.noImpulse.unlocked) {
    GameState.achievements.noImpulse.unlocked = true;
    showNotification('🏆 Achievement: No Impulse Month!', 'success');
  }
}