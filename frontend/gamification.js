// gamification.js — Engine de gamificación: XP, niveles, rachas, logros, metas diarias
(function () {
  'use strict';

  const STORAGE_KEY = 'fiuba_gamification';

  // --- Niveles y XP requerida ---
  const LEVELS = [
    { level: 1, xp: 0, title: 'Novato', icon: '🌱' },
    { level: 2, xp: 25, title: 'Aprendiz', icon: '📘' },
    { level: 3, xp: 60, title: 'Estudiante', icon: '🎓' },
    { level: 4, xp: 120, title: 'Becado', icon: '💰' },
    { level: 5, xp: 200, title: 'Ingeniero Jr.', icon: '🔧' },
    { level: 6, xp: 350, title: 'Ingeniero', icon: '⚙️' },
    { level: 7, xp: 550, title: 'Especialista', icon: '🧪' },
    { level: 8, xp: 800, title: 'Maestro', icon: '🏆' },
    { level: 9, xp: 1100, title: 'Leyenda', icon: '⭐' },
    { level: 10, xp: 1500, title: 'FIUBA Master', icon: '👑' },
  ];

  // --- Recompensas XP ---
  const XP_REWARDS = {
    chat_message: 2,
    quiz_correct: 5,
    quiz_completed: 10,
    flashcard_reviewed: 1,
    flashcard_mastered: 3,
    evaluation_passed: 15,
    attempt_logged: 5,
    streak_bonus: 10,
  };

  // --- Logros ---
  const ACHIEVEMENTS = [
    { id: 'first_chat', title: 'Primer Intercambio', desc: 'Enviá tu primer mensaje', icon: '💬', xp: 5, condition: s => s.totalMessages >= 1 },
    { id: 'chat_10', title: 'Conversador', desc: 'Enviá 10 mensajes', icon: '🗣️', xp: 10, condition: s => s.totalMessages >= 10 },
    { id: 'chat_50', title: 'Elocuente', desc: 'Enviá 50 mensajes', icon: '📣', xp: 25, condition: s => s.totalMessages >= 50 },
    { id: 'chat_100', title: 'No Para de Hablar', desc: 'Enviá 100 mensajes', icon: '🎤', xp: 50, condition: s => s.totalMessages >= 100 },
    { id: 'quiz_first', title: 'Primer Examen', desc: 'Completá tu primer quiz', icon: '📝', xp: 10, condition: s => s.quizzesCompleted >= 1 },
    { id: 'quiz_10', title: 'Examinador', desc: 'Completá 10 quizzes', icon: '📋', xp: 30, condition: s => s.quizzesCompleted >= 10 },
    { id: 'quiz_perfect', title: 'Nota 10', desc: 'Sacá 100% en un quiz', icon: '💯', xp: 20, condition: s => s.perfectQuizzes >= 1 },
    { id: 'flash_first', title: 'Primer Repaso', desc: 'Repasá tu primer flashcard', icon: '🃏', xp: 5, condition: s => s.flashcardsReviewed >= 1 },
    { id: 'flash_50', title: 'Memoria Lejana', desc: 'Repasá 50 flashcards', icon: '🧠', xp: 25, condition: s => s.flashcardsReviewed >= 50 },
    { id: 'eval_first', title: 'A Evaluar', desc: 'Evaluación completada', icon: '🎯', xp: 15, condition: s => s.evaluationsCompleted >= 1 },
    { id: 'eval_5', title: 'Rindiendo Finales', desc: 'Completá 5 evaluaciones', icon: '🏅', xp: 40, condition: s => s.evaluationsCompleted >= 5 },
    { id: 'streak_3', title: 'En Racha', desc: '3 días seguidos estudiando', icon: '🔥', xp: 15, condition: s => s.streak >= 3 },
    { id: 'streak_7', title: 'Imparable', desc: '7 días seguidos estudiando', icon: '⚡', xp: 30, condition: s => s.streak >= 7 },
    { id: 'streak_14', title: 'Obsesivo', desc: '14 días seguidos estudiando', icon: '🌋', xp: 60, condition: s => s.streak >= 14 },
    { id: 'streak_30', title: 'Leyenda Viva', desc: '30 días seguidos estudiando', icon: '💎', xp: 100, condition: s => s.streak >= 30 },
    { id: 'level_5', title: 'Mitad del Camino', desc: 'Alcanzá nivel 5', icon: '🚀', xp: 30, condition: s => s.level >= 5 },
    { id: 'level_10', title: 'FIUBA Master', desc: 'Alcanzá nivel 10', icon: '👑', xp: 100, condition: s => s.level >= 10 },
    { id: 'daily_goal', title: 'Meta del Día', desc: 'Completá tu meta diaria', icon: '🎯', xp: 10, condition: s => s.dailyGoalMet },
  ];

  // --- Estado ---
  let state = loadState();

  function defaultState() {
    return {
      xp: 0,
      totalMessages: 0,
      quizzesCompleted: 0,
      perfectQuizzes: 0,
      flashcardsReviewed: 0,
      evaluationsCompleted: 0,
      attemptsLogged: 0,
      streak: 0,
      lastActiveDate: null,
      dailyXp: 0,
      dailyGoalXp: 30,
      dailyDate: null,
      achievements: [],
      xpHistory: [],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const saved = JSON.parse(raw);
      return { ...defaultState(), ...saved };
    } catch { return defaultState(); }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  // --- Helpers ---
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function calcLevel(xp) {
    let lvl = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xp) { lvl = LEVELS[i]; break; }
    }
    return lvl;
  }

  function nextLevel(currentLevel) {
    const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  }

  function updateStreak() {
    const today = todayStr();
    if (state.lastActiveDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (state.lastActiveDate === yesterdayStr) {
      state.streak += 1;
    } else if (state.lastActiveDate !== today) {
      state.streak = 1;
    }
    state.lastActiveDate = today;
  }

  function checkAchievements() {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      if (state.achievements.includes(ach.id)) continue;
      try {
        if (ach.condition(state)) {
          state.achievements.push(ach.id);
          state.xp += ach.xp;
          newlyUnlocked.push(ach);
        }
      } catch {}
    }
    return newlyUnlocked;
  }

  // --- API pública ---
  function addXp(action) {
    const reward = XP_REWARDS[action] || 0;
    if (reward <= 0) return null;

    const prevLevel = calcLevel(state.xp);
    updateStreak();

    // Bonus por racha
    let totalReward = reward;
    if (state.streak >= 3 && action !== 'streak_bonus') {
      totalReward += Math.floor(reward * 0.2 * Math.min(state.streak, 10));
    }

    state.xp += totalReward;

    // Daily tracking
    const today = todayStr();
    if (state.dailyDate !== today) {
      state.dailyXp = 0;
      state.dailyDate = today;
    }
    state.dailyXp += totalReward;

    // XP history (últimos 30 días)
    state.xpHistory.push({ date: today, xp: totalReward, action });
    if (state.xpHistory.length > 200) state.xpHistory = state.xpHistory.slice(-200);

    const newLevel = calcLevel(state.xp);
    const leveledUp = newLevel.level > prevLevel.level;

    // Check achievements
    const newAchievements = checkAchievements();

    saveState();

    return {
      xpGained: totalReward,
      totalXp: state.xp,
      level: newLevel,
      leveledUp,
      prevLevel,
      newAchievements,
      streak: state.streak,
      dailyXp: state.dailyXp,
      dailyGoalMet: state.dailyXp >= state.dailyGoalXp,
    };
  }

  function trackMessage() { state.totalMessages++; saveState(); }
  function trackQuiz(perfect) { state.quizzesCompleted++; if (perfect) state.perfectQuizzes++; saveState(); }
  function trackFlashcard(mastered) { state.flashcardsReviewed++; saveState(); }
  function trackEvaluation() { state.evaluationsCompleted++; saveState(); }
  function trackAttempt() { state.attemptsLogged++; saveState(); }

  function getState() {
    const today = todayStr();
    if (state.dailyDate !== today) {
      state.dailyXp = 0;
      state.dailyDate = today;
      saveState();
    }
    const level = calcLevel(state.xp);
    const next = nextLevel(level);
    const progress = next ? (state.xp - level.xp) / (next.xp - level.xp) : 1;
    return {
      ...state,
      level,
      nextLevel: next,
      levelProgress: Math.min(progress, 1),
      dailyGoalMet: state.dailyXp >= state.dailyGoalXp,
      achievementsList: ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: state.achievements.includes(a.id),
      })),
    };
  }

  function setDailyGoal(xp) {
    state.dailyGoalXp = Math.max(10, Math.min(200, xp));
    saveState();
  }

  // Expose
  window.Gamification = {
    addXp,
    trackMessage,
    trackQuiz,
    trackFlashcard,
    trackEvaluation,
    trackAttempt,
    getState,
    setDailyGoal,
    XP_REWARDS,
    LEVELS,
  };
})();
