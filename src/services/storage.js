const KEY = "tfg_english_app_v1";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

// criterio
const LEVEL_CRITERIA = { minSessions: 3, minAccuracy: 60 };

function createEmptyLevelProgress() {
  return {
    Principiante: { sessions: 0, totalExercises: 0, correct: 0, wrong: 0, completed: false },
    Intermedio:   { sessions: 0, totalExercises: 0, correct: 0, wrong: 0, completed: false },
    Avanzado:     { sessions: 0, totalExercises: 0, correct: 0, wrong: 0, completed: false }
  };
}

function createEmptyLessonIndexByLevel() {
  return { Principiante: 0, Intermedio: 0, Avanzado: 0 };
}

function getNextLevel(current) {
  const i = LEVELS.indexOf(current);
  if (i === -1) return null;
  return LEVELS[i + 1] || null;
}

function calcAccuracyPercent(levelStats) {
  const total = levelStats.totalExercises || 0;
  if (total === 0) return 0;
  return (levelStats.correct / total) * 100;
}

function isLevelCompleted(levelStats, criteria = LEVEL_CRITERIA) {
  const sessionsOk = (levelStats.sessions || 0) >= criteria.minSessions;
  const accOk = calcAccuracyPercent(levelStats) >= criteria.minAccuracy;
  return sessionsOk && accOk;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getOrCreateState() {
  const state = loadState();
  if (state) return state;

  const initial = {
    activeUserId: null,
    users: [],
  };

  saveState(initial);
  return initial;
}

export function addUser(name) {
  const state = getOrCreateState();
  const id = "u_" + Date.now();

  const user = {
    id,
    name,
    level: null,
    stats: { sessions: 0, totalExercises: 0, correct: 0, wrong: 0 },
    levelProgress: createEmptyLevelProgress(),
    lessonIndexByLevel: createEmptyLessonIndexByLevel(), // ✅ NUEVO
    history: [],
  };

  state.users.push(user);
  state.activeUserId = id;
  saveState(state);

  return { state, user };
}

export function setUserLevel(level) {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId);
  if (!user) return { state, user: null };

  user.level = level;

  // si el usuario existía de antes
  if (!user.levelProgress) user.levelProgress = createEmptyLevelProgress();
  if (!user.lessonIndexByLevel) user.lessonIndexByLevel = createEmptyLessonIndexByLevel(); // ✅ NUEVO

  saveState(state);
  return { state, user };
}

export function getActiveUser() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;

  // si el usuario existía de antes
  if (user && !user.levelProgress) {
    user.levelProgress = createEmptyLevelProgress();
    saveState(state);
  }

  //  lecciones
  if (user && !user.lessonIndexByLevel) {
    user.lessonIndexByLevel = createEmptyLessonIndexByLevel();
    saveState(state);
  }

  return { state, user };
}

export function saveSessionResult({ lessonId, results, levelName, lessonsCountByLevel }) {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId);
  if (!user) return;

  // si el usuario existía de antes
  if (!user.levelProgress) user.levelProgress = createEmptyLevelProgress();
  if (!user.lessonIndexByLevel) user.lessonIndexByLevel = createEmptyLessonIndexByLevel();

  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = total - correct;

  const errorTagsCount = {};
  const wrongItems = [];

  for (const r of results) {
    if (!r.isCorrect) {
      wrongItems.push({
        exerciseId: r.exerciseId,
        prompt: r.prompt,
        answer: r.answer,
        selected: r.selected,
        tags: r.tags ?? [],
      });

      for (const t of r.tags ?? []) {
        errorTagsCount[t] = (errorTagsCount[t] || 0) + 1;
      }
    }
  }

  const session = {
    id: "s_" + Date.now(),
    dateISO: new Date().toISOString(),
    lessonId,
    total,
    correct,
    wrong,
    errorTagsCount,
    wrongItems,
  };

  user.history.unshift(session);

  // estadísticas globales
  user.stats.sessions += 1;
  user.stats.totalExercises += total;
  user.stats.correct += correct;
  user.stats.wrong += wrong;

  // ---- progreso por nivel + criterio de finalización ----
  const lvl = levelName || user.level; 
  if (lvl && user.levelProgress[lvl]) {
    const lp = user.levelProgress[lvl];

    lp.sessions += 1;
    lp.totalExercises += total;
    lp.correct += correct;
    lp.wrong += wrong;

    if (!lp.completed && isLevelCompleted(lp, LEVEL_CRITERIA)) {
      lp.completed = true;

      const next = getNextLevel(lvl);
      if (next) {
        user.level = next; // auto-subida de nivel
      }
    }
  }

  // Avanzar en el camino de lecciones 
  if (lvl && user.lessonIndexByLevel && typeof user.lessonIndexByLevel[lvl] === "number") {
    const current = user.lessonIndexByLevel[lvl];

    const maxCount = lessonsCountByLevel?.[lvl];

    if (typeof maxCount === "number" && maxCount > 0) {
      user.lessonIndexByLevel[lvl] = Math.min(current + 1, maxCount - 1);
    } else {
      user.lessonIndexByLevel[lvl] = current + 1;
    }
  }

  saveState(state);
}

export function getLastSession() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;
  if (!user) return null;
  return user.history?.[0] ?? null;
}

export function exportProgressJSON() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;
  if (!user) return null;

  return {
    exportedAt: new Date().toISOString(),
    appVersion: "v1",
    user,
  };
}

export function resetActiveUserProgress() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;
  if (!user) return false;

  user.stats = { sessions: 0, totalExercises: 0, correct: 0, wrong: 0 };
  user.history = [];
  user.levelProgress = createEmptyLevelProgress();
  user.lessonIndexByLevel = createEmptyLessonIndexByLevel();

  saveState(state);
  return true;
}
