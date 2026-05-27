/* ═══════════════════════════════════════
   PENNY WISE — Navigation & Actions
   Tab switching, END DAY, quick actions
   ═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Penny Wise loaded');

  const tabs = document.querySelectorAll('.action-tab[data-view]');
  const views = document.querySelectorAll('.view');

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

  const endDayBtn = document.querySelector('.end-day');
  if (endDayBtn) {
    endDayBtn.addEventListener('click', () => {
      const hoursSelect = document.getElementById('sleep-hours-select');
      const hours = hoursSelect ? parseInt(hoursSelect.value) : 8;
      endDay(hours);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) return;
    const text = e.target.textContent.trim();

    switch (text) {
      case 'SLEEP':
        const hoursSelect = document.getElementById('sleep-hours-select');
        const hours = hoursSelect ? parseInt(hoursSelect.value) : 8;
        endDay(hours);
        break;

      case 'WORK':
        if (GameState.workedToday) {
          showNotification('Already worked today!', 'warning');
          return;
        }
        if (GameState.energy < 15) {
          showNotification('Too tired to work! Get some rest.', 'warning');
          return;
        }
        if (!GameState.workedDays.includes(GameState.day)) GameState.workedDays.push(GameState.day);
        GameState.energy = clamp(GameState.energy - 15);
        GameState.stress = clamp(GameState.stress + 5);
        GameState.job.performance = clamp(GameState.job.performance + 3);
        GameState.job.shiftsWorked++;
        GameState.workedToday = true;
        showNotification('Worked a shift. +Performance -Energy', 'info');
        disableWorkButtons();
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

  document.addEventListener('click', (e) => {
    const workBtn = e.target.closest('.work-btn');
    if (!workBtn || workBtn.classList.contains('disabled')) return;

    const title = workBtn.querySelector('.wb-title');
    if (!title) return;

    switch (title.textContent.trim()) {
      case '8HR SHIFT':
      case 'GO TO WORK':
        if (GameState.workedToday) {
          showNotification('Already worked today!', 'warning');
          return;
        }
        if (GameState.energy < 15) {
          showNotification('Too tired to work!', 'warning');
          return;
        }
        if (!GameState.workedDays.includes(GameState.day)) GameState.workedDays.push(GameState.day);
        GameState.energy = clamp(GameState.energy - 15);
        GameState.stress = clamp(GameState.stress + 5);
        GameState.job.performance = clamp(GameState.job.performance + 3);
        GameState.job.shiftsWorked++;
        GameState.workedToday = true;
        showNotification('8hr shift done! +Performance', 'success');
        disableWorkButtons();
        updateUI();
        // endDay(8);
        break;

      case 'DOUBLE (16HR)':
      case 'DOUBLE SHIFT':
        if (GameState.slept12Hours) {
          showNotification('Cannot do a double shift after sleeping 12 hours!', 'warning');
          return;
        }
        if (GameState.workedToday) {
          showNotification('Already worked today!', 'warning');
          return;
        }
        if (GameState.energy < 50) {
          showNotification('Not enough energy for a double! Need 50+', 'warning');
          return;
        }
        if (!GameState.workedDays.includes(GameState.day)) GameState.workedDays.push(GameState.day);
        GameState.energy = clamp(GameState.energy - 50);
        GameState.stress = clamp(GameState.stress + 25);
        GameState.happiness = clamp(GameState.happiness - 5);
        GameState.job.performance = clamp(GameState.job.performance + 10);
        GameState.job.shiftsWorked += 2;
        GameState.balance += (GameState.job.overtimeBonus * 2);
        GameState.workedToday = true;
        showNotification('16hr double shift survived!', 'success');
        disableWorkButtons();
        updateUI();
        // endDay(12);
        break;

      case 'SKIP SHIFT':
        if (GameState.workedToday) {
          showNotification('Already made a choice today!', 'warning');
          return;
        }
        GameState.energy = clamp(GameState.energy + 20);
        GameState.stress = clamp(GameState.stress - 10);
        GameState.job.performance = clamp(GameState.job.performance - 10);
        GameState.job.shiftsMissed++;
        GameState.workedToday = true;
        if (GameState.job.shiftsMissed % 3 === 0) {
          GameState.job.warningCount++;
          showNotification(`⚠ WARNING ${GameState.job.warningCount}/3: Too many missed shifts!`, 'danger');
        } else {
          showNotification('Skipped work. +Energy but --Performance', 'warning');
        }
        disableWorkButtons();
        updateUI();
        // endDay(8);
        break;
    }
  });

  function disableWorkButtons() { document.querySelectorAll('.work-btn').forEach(btn => btn.classList.add('disabled')); }
  function enableWorkButtons() { document.querySelectorAll('.work-btn').forEach(btn => btn.classList.remove('disabled')); }
  window.enableWorkButtons = enableWorkButtons;

  // ——— Job Application Handler with Dynamic Retro Popups ———
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-apply')) return;
    const listing = e.target.closest('.job-listing');
    if (!listing) return;
    const jobTitleEl = listing.querySelector('.jl-title');
    if (!jobTitleEl) return;

    const jobTitle = jobTitleEl.textContent.trim();
    switch (jobTitle) {
      case '☕ BARISTA':
        GameState.job.title = 'Barista'; 
        GameState.job.company = 'Local Coffee Shop'; 
        GameState.salary = 1800; 
        GameState.job.performance = 50; 
        GameState.job.warningCount = 0; 
        GameState.job.shiftsMissed = 0;
        showNotification('Hired as Barista!', 'success');
        showJobAlertModal(true, 'Hired successfully! You are now a Barista at the Local Coffee Shop. Lower stress requirements, and your warning file record has been entirely wiped.');
        break;

      case '💻 JUNIOR DEVELOPER':
        if (GameState.job.performance < 75) { 
          showNotification('Application rejected!', 'warning'); 
          showJobAlertModal(false, 'Application Failed! The recruitment software filter rejected your application automatically because your performance rating is below the required 75% benchmark.');
          return; 
        }
        GameState.job.title = 'Junior Developer'; 
        GameState.job.company = 'Tech Startup'; 
        GameState.salary = 2800; 
        GameState.job.performance = 40; 
        GameState.job.warningCount = 0; 
        GameState.job.shiftsMissed = 0;
        if (!GameState.achievements.promoted.unlocked) { 
          GameState.achievements.promoted.unlocked = true; 
          showNotification('🏆 Achievement: Promoted!', 'success'); 
        }
        showNotification('Welcome to tech development!', 'success');
        showJobAlertModal(true, 'Application Success! Welcome to the tech industry. You are now a Junior Developer at Tech Startup. High pressure, but higher monetary rewards, and previous warning counts are completely cleared.');
        break;

      case '📦 WAREHOUSE WORKER':
        GameState.job.title = 'Warehouse Worker'; 
        GameState.job.company = 'Logistics Depot'; 
        GameState.salary = 2300; 
        GameState.job.performance = 50; 
        GameState.job.warningCount = 0; 
        GameState.job.shiftsMissed = 0;
        showNotification('Hired as Warehouse Worker!', 'success');
        showJobAlertModal(true, 'Hired successfully! You have accepted a Warehouse position at Logistics Depot. It will drain energy fast, but the extra coin will protect you from debt overdraft fees.');
        break;
    }
    updateUI();
  });

  // Reusable retro popup constructor for applications
  function showJobAlertModal(isSuccess, message) {
    const existing = document.getElementById('job-alert-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'job-alert-modal';
    modal.style.position = 'absolute';
    modal.style.top = '0'; modal.style.left = '0';
    modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(10, 6, 19, 0.85)'; 
    modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';

    const content = document.createElement('div');
    content.style.background = 'var(--panel)';
    content.style.border = `4px solid ${isSuccess ? 'var(--green)' : 'var(--red)'}`;
    content.style.padding = '24px'; content.style.width = '420px'; content.style.textAlign = 'center';
    content.style.boxShadow = '0 0 20px rgba(0,0,0,0.8), inset -4px -4px 0 rgba(0,0,0,0.4)';

    const title = document.createElement('h2');
    title.textContent = isSuccess ? '★ APPLICATION SUCCESSFUL ★' : '⚠ APPLICATION REJECTED ⚠';
    title.style.fontFamily = 'var(--font-pixel)'; title.style.fontSize = '10px';
    title.style.color = isSuccess ? 'var(--green)' : 'var(--red)'; title.style.marginBottom = '16px';

    const msgText = document.createElement('p');
    msgText.textContent = message;
    msgText.style.fontFamily = 'var(--font-body)'; msgText.style.fontSize = '22px';
    msgText.style.color = 'var(--ink)'; msgText.style.marginBottom = '24px'; msgText.style.lineHeight = '1.4';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CONFIRM';
    closeBtn.style.fontFamily = 'var(--font-pixel)'; closeBtn.style.fontSize = '10px'; closeBtn.style.padding = '10px 20px';
    closeBtn.style.background = isSuccess ? 'linear-gradient(180deg, var(--green) 0%, var(--green-deep) 100%)' : 'linear-gradient(180deg, var(--red) 0%, var(--red-deep) 100%)';
    closeBtn.style.color = isSuccess ? 'var(--bg-0)' : 'var(--ink)';
    closeBtn.style.border = '3px solid var(--panel-edge)'; closeBtn.style.cursor = 'pointer';
    closeBtn.style.boxShadow = 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.3)';

    closeBtn.onclick = () => { modal.remove(); };

    content.appendChild(title); content.appendChild(msgText); content.appendChild(closeBtn);
    modal.appendChild(content);

    const screenEl = document.querySelector('.screen');
    if (screenEl) screenEl.appendChild(modal);
    else document.body.appendChild(modal);
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('amt-btn')) {
      document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
      e.target.classList.add('selected');
    }

    if (e.target.classList.contains('btn-transfer')) {
      const selectedAmt = document.querySelector('.amt-btn.selected');
      if (!selectedAmt) return;

      let amount;
      const text = selectedAmt.textContent.trim();

      if (GameState.transferDirection === 'to_savings') {
        amount = (text === 'MAX') ? GameState.balance : parseInt(text.replace('£', ''));
        if (isNaN(amount) || amount <= 0) return;
        if (GameState.balance < amount) { showNotification(`Insufficient funds!`, 'warning'); return; }
        GameState.balance -= amount; GameState.savings += amount; GameState.spending.savings += amount;
      } else {
        amount = (text === 'MAX') ? GameState.savings : parseInt(text.replace('£', ''));
        if (isNaN(amount) || amount <= 0) return;
        if (GameState.savings < amount) { showNotification(`Insufficient savings!`, 'warning'); return; }
        GameState.savings -= amount; GameState.balance += amount;
      }
      updateUI();
    }

    if (e.target.classList.contains('arrow-btn')) {
      const fromLabel = document.querySelector('.transfer-box:first-child .tb-label');
      const toLabel = document.querySelector('.transfer-controls .transfer-box:last-child .tb-label');
      const transferBtn = document.querySelector('.btn-transfer');
      if (fromLabel && toLabel) {
        const temp = fromLabel.textContent; fromLabel.textContent = toLabel.textContent; toLabel.textContent = temp;
        if (fromLabel.textContent.includes('SAVINGS')) {
          GameState.transferDirection = 'to_current';
          if (transferBtn) transferBtn.textContent = 'TRANSFER Funds ←';
        } else {
          GameState.transferDirection = 'to_savings';
          if (transferBtn) transferBtn.textContent = 'TRANSFER Funds →';
        }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle')) {
      e.target.classList.toggle('on');
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

  updateUI();
});