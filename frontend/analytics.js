// analytics.js - Gráficos de progreso y dashboard de gamificación
import { getRecentAttempts } from "./firebase.js";
import { getEvaluations, getEvaluationAttempts } from "./evaluations.js";
import { getFlashcards } from "./flashcards.js";

let chartAttemptsInstance = null;
let chartTopicsInstance = null;

function updateGamificationUI() {
  if (!window.Gamification) return;
  const gs = window.Gamification.getState();

  // Level card
  const levelIcon = document.getElementById('gam-level-icon');
  const levelTitle = document.getElementById('gam-level-title');
  const levelNum = document.getElementById('gam-level-num');
  const xpTotal = document.getElementById('gam-xp-total');
  const xpBar = document.getElementById('gam-xp-bar');
  const xpBarLabel = document.getElementById('gam-xp-bar-label');

  if (levelIcon) levelIcon.textContent = gs.level.icon;
  if (levelTitle) levelTitle.textContent = gs.level.title;
  if (levelNum) levelNum.textContent = `Nivel ${gs.level.level}`;
  if (xpTotal) xpTotal.textContent = `${gs.xp} XP`;
  if (xpBar) xpBar.style.width = `${Math.round(gs.levelProgress * 100)}%`;
  if (xpBarLabel) {
    if (gs.nextLevel) {
      xpBarLabel.textContent = `${gs.xp - gs.level.xp} / ${gs.nextLevel.xp - gs.level.xp} XP para nivel ${gs.nextLevel.level}`;
    } else {
      xpBarLabel.textContent = 'Nivel máximo alcanzado';
    }
  }

  // Stats
  const streakVal = document.getElementById('gam-streak-value');
  const streakIcon = document.getElementById('gam-streak-icon');
  const msgsVal = document.getElementById('gam-messages-value');
  const quizzesVal = document.getElementById('gam-quizzes-value');
  const evalsVal = document.getElementById('gam-evals-value');

  if (streakVal) streakVal.textContent = gs.streak;
  if (streakIcon) streakIcon.textContent = gs.streak >= 7 ? '⚡' : gs.streak >= 3 ? '🔥' : '🔥';
  if (msgsVal) msgsVal.textContent = gs.totalMessages;
  if (quizzesVal) quizzesVal.textContent = gs.quizzesCompleted;
  if (evalsVal) evalsVal.textContent = gs.evaluationsCompleted;

  // Daily goal
  const dailyXp = document.getElementById('gam-daily-xp');
  const dailyBar = document.getElementById('gam-daily-bar');
  const dailyHint = document.getElementById('gam-daily-hint');

  if (dailyXp) dailyXp.textContent = `${gs.dailyXp} / ${gs.dailyGoalXp} XP`;
  if (dailyBar) {
    const pct = Math.min((gs.dailyXp / gs.dailyGoalXp) * 100, 100);
    dailyBar.style.width = `${pct}%`;
    dailyBar.className = 'gam-daily-bar' + (gs.dailyGoalMet ? ' complete' : '');
  }
  if (dailyHint) {
    if (gs.dailyGoalMet) {
      dailyHint.textContent = 'Meta diaria completada. ¡Seguí así!';
      dailyHint.style.color = '#22c55e';
    } else {
      const remaining = gs.dailyGoalXp - gs.dailyXp;
      dailyHint.textContent = `Faltan ${remaining} XP para tu meta de hoy`;
      dailyHint.style.color = '';
    }
  }

  // Achievements
  const grid = document.getElementById('gam-achievements-grid');
  if (grid) {
    grid.innerHTML = gs.achievementsList.map(a => `
      <div class="gam-achievement ${a.unlocked ? 'unlocked' : ''}">
        <div class="gam-achievement-icon">${a.icon}</div>
        <div class="gam-achievement-title">${a.title}</div>
        <div class="gam-achievement-desc">${a.desc}</div>
        <div class="gam-achievement-xp">+${a.xp} XP</div>
        ${a.unlocked ? '' : '<div class="gam-achievement-lock-overlay">🔒</div>'}
      </div>
    `).join('');
  }
}

async function refreshAnalytics() {
  try {
    const attempts = await getRecentAttempts(50).catch(()=>[]);
    const evalAttempts = await getEvaluationAttempts().catch(()=>[]);
    const flashcards = await getFlashcards().catch(()=>[]);

    // Intentos por semana (últimas 6 semanas)
    const now = new Date();
    const weeks = [];
    const counts = [];
    for (let i=5;i>=0;i--) {
      const d = new Date(now); d.setDate(now.getDate() - i*7);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      weeks.push(label);
      const weekStart = new Date(d); weekStart.setDate(d.getDate()-6);
      const cnt = [...attempts, ...evalAttempts].filter(a=>{
        const t = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds*1000 : 0);
        return t >= weekStart.getTime() && t <= d.getTime();
      }).length;
      counts.push(cnt);
    }
    const ctx1 = document.getElementById("chart-attempts");
    if (ctx1) {
      if (chartAttemptsInstance) chartAttemptsInstance.destroy();
      chartAttemptsInstance = new Chart(ctx1, {
        type: 'bar',
        data: { labels: weeks, datasets: [{ label: 'Intentos', data: counts, backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 6 }]},
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, ticks:{ color:'#94a3b8', stepSize:1 }}, x:{ ticks:{ color:'#94a3b8'}}}}
      });
    }

    // Aciertos por materia (top 5)
    const perTopic = {};
    [...attempts, ...evalAttempts].forEach(a=>{
      const subj = a.subject || a.evaluationTitle || "General";
      if (!perTopic[subj]) perTopic[subj] = { total:0, correct:0 };
      if (a.result) { perTopic[subj].total+=1; if(a.result==='correct') perTopic[subj].correct+=1; }
      else if (a.correct!==undefined) { perTopic[subj].total+=a.total||0; perTopic[subj].correct+=a.correct||0; }
    });
    const top = Object.entries(perTopic).sort((a,b)=>b[1].total - a[1].total).slice(0,5);
    const labels2 = top.map(([k])=>k.slice(0,15));
    const data2 = top.map(([,v])=> v.total ? Math.round(v.correct/v.total*100) : 0);
    const ctx2 = document.getElementById("chart-topics");
    if (ctx2) {
      if (chartTopicsInstance) chartTopicsInstance.destroy();
      chartTopicsInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: labels2, datasets: [{ data: data2, backgroundColor: ['#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b'], borderWidth: 0 }]},
        options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', boxWidth:12, font:{ size:11}}}} }
      });
    }

    // Flashcards due
    const flashcardsDue = flashcards.filter(c=>{
      const t = c.nextReview?.toMillis ? c.nextReview.toMillis() : (c.nextReview?.seconds ? c.nextReview.seconds*1000 : 0);
      return t <= Date.now();
    }).length;

    // Update gamification UI
    updateGamificationUI();

  } catch(e){ console.error(e); }
}

// --- Toasts y animaciones ---
function showLevelUpToast(level) {
  const existing = document.querySelector('.gam-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'gam-toast';
  toast.innerHTML = `<span class="gam-toast-icon">${level.icon}</span> ¡Nivel ${level.level}! — ${level.title}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 600); }, 3500);
}

function showAchievementToast(ach) {
  const toast = document.createElement('div');
  toast.className = 'gam-achievement-toast';
  toast.innerHTML = `
    <div class="gam-achievement-toast-icon">${ach.icon}</div>
    <div class="gam-achievement-toast-info">
      <div class="gam-achievement-toast-title">Logro desbloqueado</div>
      <div class="gam-achievement-toast-desc">${ach.title}</div>
      <div class="gam-achievement-toast-xp">+${ach.xp} XP</div>
    </div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 600); }, 4000);
}

function showXpFly(xpAmount) {
  const fly = document.createElement('div');
  fly.className = 'gam-xp-fly';
  fly.textContent = `+${xpAmount} XP`;
  fly.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
  fly.style.top = '60px';
  document.body.appendChild(fly);
  setTimeout(() => fly.remove(), 1300);
}

function processGamificationResult(result) {
  if (!result) return;
  showXpFly(result.xpGained);
  if (result.leveledUp) showLevelUpToast(result.level);
  if (result.newAchievements) {
    result.newAchievements.forEach((ach, i) => {
      setTimeout(() => showAchievementToast(ach), 800 + i * 1200);
    });
  }
}

window.refreshAnalytics = refreshAnalytics;
window.processGamificationResult = processGamificationResult;
window.showLevelUpToast = showLevelUpToast;
window.showAchievementToast = showAchievementToast;
window.updateGamificationUI = updateGamificationUI;
