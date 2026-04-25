const KEY = "tfg_english_app_v1";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

// criterio
const LEVEL_CRITERIA = { minSessions: 3, minAccuracy: 60 };

function createEmptyStats() {
  return { sessions: 0, totalExercises: 0, correct: 0, wrong: 0 };
}

function createEmptyLevelProgress() {
  return {
    Principiante: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
    },
    Intermedio: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
    },
    Avanzado: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
    },
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

function ensureUserShape(user) {
  if (!user) return user;

  if (!user.stats) user.stats = createEmptyStats();
  if (!user.history) user.history = [];
  if (!user.levelProgress) user.levelProgress = createEmptyLevelProgress();
  if (!user.lessonIndexByLevel) user.lessonIndexByLevel = createEmptyLessonIndexByLevel();

  return user;
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
    stats: createEmptyStats(),
    levelProgress: createEmptyLevelProgress(),
    lessonIndexByLevel: createEmptyLessonIndexByLevel(),
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

  ensureUserShape(user);
  user.level = level;

  saveState(state);
  return { state, user };
}

export function getActiveUser() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;

  if (user) {
    ensureUserShape(user);
    saveState(state);
  }

  return { state, user };
}

export function saveSessionResult({
  lessonId,
  results,
  levelName,
  lessonsCountByLevel,
}) {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId);
  if (!user) return;

  ensureUserShape(user);

  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = total - correct;

  const errorTagsCount = {};
  const wrongItems = [];

  for (const r of results) {
    if (!r.isCorrect) {
      wrongItems.push({
        exerciseId: r.exerciseId,
        type: r.type,
        prompt: r.prompt,
        answer: r.answer,
        selected: r.selected,
        tags: r.tags ?? [],
        options: r.options ?? [],
        sourceText: r.sourceText ?? null,
        translation: r.translation ?? null,
        audio: r.audio ?? null,
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

  user.stats.sessions += 1;
  user.stats.totalExercises += total;
  user.stats.correct += correct;
  user.stats.wrong += wrong;

  const lvl = levelName || user.level;

  if (lvl && user.levelProgress[lvl]) {
    const lp = user.levelProgress[lvl];

    lp.sessions += 1;
    lp.totalExercises += total;
    lp.correct += correct;
    lp.wrong += wrong;

    if (!lp.completed && isLevelCompleted(lp, LEVEL_CRITERIA)) {
      lp.completed = true;

      // Guardamos el nivel recién completado para mostrar diploma
      user.justCompletedLevel = lvl;

      const next = getNextLevel(lvl);
      if (next) {
        user.level = next;
      }
    }
  }

  if (
    lvl &&
    user.lessonIndexByLevel &&
    typeof user.lessonIndexByLevel[lvl] === "number"
  ) {
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

  ensureUserShape(user);
  return user.history?.[0] ?? null;
}

export function exportProgressJSON() {
  const state = getOrCreateState();
  const user = state.users.find((u) => u.id === state.activeUserId) || null;
  if (!user) return null;

  ensureUserShape(user);

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

  ensureUserShape(user);

  user.stats = createEmptyStats();
  user.history = [];
  user.levelProgress = createEmptyLevelProgress();
  user.lessonIndexByLevel = createEmptyLessonIndexByLevel();
  delete user.justCompletedLevel;

  saveState(state);
  return true;
}