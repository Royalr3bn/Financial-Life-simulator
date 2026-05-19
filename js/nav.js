/* ═══════════════════════════════════════
   PENNY WISE — Navigation & Actions
   Tab switching, END DAY, quick actions
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Penny Wise loaded');

  const tabs = document.querySelectorAll('.action-tab[data-view]');
  const views = document.querySelectorAll('.view');

  // ——— Tab switching ———
  function switchView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    tabs.forEach(t => {
      if (t.dataset.view === viewId) t.classList.add('active');
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });

  // ——— END DAY button ———
  const endDayBtn = document.querySelector('.end-day');
  if (endDayBtn) {
    endDayBtn.addEventListener('click', () => {
      endDay();
    });
  }

  // ——— SLEEP button (full rest + ends day) ———
  const sleepBtn = document.querySelector('.sleep-btn');
  if (sleepBtn) {
    sleepBtn.addEventListener('click', () => {
      GameState.energy = clamp(GameState.energy + 25);
      GameState.stress = clamp(GameState.stress - 10);
      GameState.happiness = clamp(GameState.happiness + 3);
      showNotification('Slept well! +25 Energy, -10 Stress', 'success');
      endDay();
    });
  }

  // ——— Quick actions (Home view) ———
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) return;
    const text = e.target.textContent.trim();

    switch (text) {
      case 'SLEEP':
        // Trigger the bottom bar sleep button
        const sleepButton = document.querySelector('.sleep-btn');
        if (sleepButton) sleepButton.click();
        break;

      case 'WORK':
        if (GameState.energy < 15) {
          showNotification('Too tired to work! Get some rest.', 'warning');
          return;
        }
        GameState.energy = clamp(GameState.energy - 15);
        GameState.stress = clamp(GameState.stress + 5);
        GameState.job.performance = clamp(GameState.job.performance + 3);
        GameState.job.shiftsWorked++;
        showNotification('Worked a shift. +Performance -Energy', 'info');
        updateUI();
        break;

      case 'EAT':
        if (GameState.groceryCount > 0) {
          GameState.energy = clamp(GameState.energy + 10);
          GameState.happiness = clamp(GameState.happiness + 3);
          showNotification('Ate a home-cooked meal. +Energy +Happy', 'success');
        } else {
          showNotification('No groceries! Go to the shop first.', 'warning');
        }
        updateUI();
        break;

      case 'RELAX':
        GameState.happiness = clamp(GameState.happiness + 10);
        GameState.stress = clamp(GameState.stress - 8);
        GameState.energy = clamp(GameState.energy - 3);
        showNotification('Relaxed at home. +Happy -Stress', 'success');
        updateUI();
        break;
    }
  });

  // ——— Work action buttons (Job view) ———
  document.addEventListener('click', (e) => {
    const workBtn = e.target.closest('.work-btn');
    if (!workBtn) return;

    const title = workBtn.querySelector('.wb-title');
    if (!title) return;

    switch (title.textContent.trim()) {
      case 'GO TO WORK':
        if (GameState.energy < 15) {
          showNotification('Too tired to work!', 'warning');
          return;
        }
        GameState.energy = clamp(GameState.energy - 15);
        GameState.stress = clamp(GameState.stress + 5);
        GameState.job.performance = clamp(GameState.job.performance + 3);
        GameState.job.shiftsWorked++;
        showNotification('Good shift! +Performance', 'success');
        endDay();
        break;

      case 'OVERTIME':
        if (GameState.energy < 30) {
          showNotification('Not enough energy for overtime!', 'warning');
          return;
        }
        GameState.energy = clamp(GameState.energy - 30);
        GameState.stress = clamp(GameState.stress + 15);
        GameState.job.performance = clamp(GameState.job.performance + 6);
        GameState.job.shiftsWorked++;
        GameState.balance += GameState.job.overtimeBonus;
        showNotification(`Overtime done! +£${GameState.job.overtimeBonus} bonus`, 'success');
        endDay();
        break;

      case 'SKIP SHIFT':
        GameState.energy = clamp(GameState.energy + 20);
        GameState.stress = clamp(GameState.stress - 10);
        GameState.job.performance = clamp(GameState.job.performance - 10);
        GameState.job.shiftsMissed++;
        if (GameState.job.shiftsMissed % 3 === 0) {
          GameState.job.warningCount++;
          showNotification(`⚠ WARNING ${GameState.job.warningCount}/3: Too many missed shifts!`, 'danger');
        } else {
          showNotification('Skipped work. +Energy but --Performance', 'warning');
        }
        endDay();
        break;
    }
  });

  // ——— Bank transfer buttons ———
  document.addEventListener('click', (e) => {
    // Amount selection
    if (e.target.classList.contains('amt-btn')) {
      document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
    }

    // Transfer button
    if (e.target.classList.contains('btn-transfer')) {
      const selectedAmt = document.querySelector('.amt-btn.selected');
      if (!selectedAmt) return;

      let amount;
      const text = selectedAmt.textContent.trim();
      if (text === 'MAX') {
        amount = GameState.balance;
      } else {
        amount = parseInt(text.replace('£', ''));
      }

      if (isNaN(amount) || amount <= 0) return;

      if (GameState.balance < amount) {
        showNotification(`Can't transfer £${amount} — only have £${GameState.balance}`, 'warning');
        return;
      }

      GameState.balance -= amount;
      GameState.savings += amount;
      GameState.spending.savings += amount;

      // First saver achievement
      if (!GameState.achievements.firstSaver.unlocked) {
        GameState.achievements.firstSaver.unlocked = true;
        showNotification('🏆 Achievement: First Saver!', 'success');
      }

      // Rainy day check
      if (GameState.savings >= 1000 && !GameState.achievements.rainyDay.unlocked) {
        GameState.achievements.rainyDay.unlocked = true;
        showNotification('🏆 Achievement: Rainy Day Ready!', 'success');
      }

      showNotification(`Transferred £${amount} to savings`, 'success');
      updateUI();
    }

    // Arrow buttons (swap direction)
    if (e.target.classList.contains('arrow-btn')) {
      const fromLabel = document.querySelector('.transfer-box:first-child .tb-label');
      const toLabel = document.querySelector('.transfer-controls .transfer-box:last-child .tb-label');
      if (fromLabel && toLabel) {
        const temp = fromLabel.textContent;
        fromLabel.textContent = toLabel.textContent;
        toLabel.textContent = temp;
      }
    }
  });

  // ——— Autopay toggles ———
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle')) {
      e.target.classList.toggle('on');

      // Find which bill this toggle belongs to
      const row = e.target.closest('.toggle-row');
      if (row) {
        const label = row.querySelector('span');
        if (label) {
          const bill = GameState.bills.find(b => b.name.toLowerCase().includes(label.textContent.toLowerCase()));
          if (bill) {
            bill.autopay = e.target.classList.contains('on');
            showNotification(`${bill.name} autopay: ${bill.autopay ? 'ON' : 'OFF'}`, 'info');
          }
        }
      }
    }
  });

  // ——— Initial UI render ———
  updateUI();
});