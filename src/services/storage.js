const KEY = "tfg_english_app_v1";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

// criterio real del nivel:
// solo cuenta el porcentaje final al terminar todas las lecciones del nivel
const LEVEL_CRITERIA = { minAccuracy: 60 };

function getSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function createEmptyStats() {
  return {
    sessions: 0,
    totalExercises: 0,
    correct: 0,
    wrong: 0,
  };
}

function createEmptyLevelProgress() {
  return {
    Principiante: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
      failed: false,
    },
    Intermedio: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
      failed: false,
    },
    Avanzado: {
      sessions: 0,
      totalExercises: 0,
      correct: 0,
      wrong: 0,
      completed: false,
      failed: false,
    },
  };
}

function createEmptyLessonIndexByLevel() {
  return {
    Principiante: 0,
    Intermedio: 0,
    Avanzado: 0,
  };
}

function getNextLevel(current) {
  const index = LEVELS.indexOf(current);
  if (index === -1) return null;
  return LEVELS[index + 1] || null;
}

function calcAccuracyPercent(levelStats) {
  const total = getSafeNumber(levelStats?.totalExercises, 0);
  const correct = getSafeNumber(levelStats?.correct, 0);

  if (total <= 0) return 0;
  return (correct / total) * 100;
}

function isLastLessonOfLevel(user, levelName, lessonsCountByLevel) {
  if (!levelName || !user?.lessonIndexByLevel) return false;

  const currentIndex = getSafeNumber(user.lessonIndexByLevel[levelName], 0);
  const totalLessons = getSafeNumber(lessonsCountByLevel?.[levelName], 0);

  if (totalLessons <= 0) return false;

  return currentIndex >= totalLessons - 1;
}

function isLevelCompletedByFinalAccuracy(levelStats, criteria = LEVEL_CRITERIA) {
  return calcAccuracyPercent(levelStats) >= getSafeNumber(criteria?.minAccuracy, 60);
}

function ensureUserShape(user) {
  if (!user) return user;

  if (!user.stats) user.stats = createEmptyStats();
  if (!Array.isArray(user.history)) user.history = [];
  if (!user.levelProgress) user.levelProgress = createEmptyLevelProgress();
  if (!user.lessonIndexByLevel) user.lessonIndexByLevel = createEmptyLessonIndexByLevel();

  for (const level of LEVELS) {
    if (!user.levelProgress[level]) {
      user.levelProgress[level] = {
        sessions: 0,
        totalExercises: 0,
        correct: 0,
        wrong: 0,
        completed: false,
        failed: false,
      };
    } else {
      user.levelProgress[level].sessions = getSafeNumber(
        user.levelProgress[level].sessions,
        0
      );
      user.levelProgress[level].totalExercises = getSafeNumber(
        user.levelProgress[level].totalExercises,
        0
      );
      user.levelProgress[level].correct = getSafeNumber(
        user.levelProgress[level].correct,
        0
      );
      user.levelProgress[level].wrong = getSafeNumber(
        user.levelProgress[level].wrong,
        0
      );

      if (typeof user.levelProgress[level].completed !== "boolean") {
        user.levelProgress[level].completed = false;
      }

      if (typeof user.levelProgress[level].failed !== "boolean") {
        user.levelProgress[level].failed = false;
      }
    }

    if (typeof user.lessonIndexByLevel[level] !== "number") {
      user.lessonIndexByLevel[level] = 0;
    }
  }

  return user;
}

function updateGlobalStats(user, session) {
  user.stats.sessions += 1;
  user.stats.totalExercises += session.total;
  user.stats.correct += session.correct;
  user.stats.wrong += session.wrong;
}

function updateLevelStats(user, levelName, session) {
  if (!levelName || !user.levelProgress?.[levelName]) return;

  const lp = user.levelProgress[levelName];
  lp.sessions += 1;
  lp.totalExercises += session.total;
  lp.correct += session.correct;
  lp.wrong += session.wrong;
}

function resolveLevelProgress(user, levelName, lessonsCountByLevel) {
  if (!levelName || !user.levelProgress?.[levelName]) return;

  const lp = user.levelProgress[levelName];
  const reachedEndOfLevel = isLastLessonOfLevel(user, levelName, lessonsCountByLevel);

  if (!reachedEndOfLevel) {
    // todavía no ha terminado el nivel, solo avanza a la siguiente lección
    user.lessonIndexByLevel[levelName] =
      getSafeNumber(user.lessonIndexByLevel[levelName], 0) + 1;
    return;
  }

  const passed = isLevelCompletedByFinalAccuracy(lp, LEVEL_CRITERIA);

  if (passed) {
    lp.completed = true;
    lp.failed = false;

    user.justCompletedLevel = levelName;

    const nextLevel = getNextLevel(levelName);

    // el nivel completado se reinicia visualmente al inicio por limpieza interna
    user.lessonIndexByLevel[levelName] = 0;

    if (nextLevel) {
      user.level = nextLevel;
      user.lessonIndexByLevel[nextLevel] = 0;
    }

    return;
  }

  // si no llega al 60%, repite automáticamente el mismo nivel
  lp.completed = false;
  lp.failed = true;
  user.lessonIndexByLevel[levelName] = 0;
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
  user.lessonIndexByLevel[level] = 0;
  delete user.justCompletedLevel;

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

  const total = Array.isArray(results) ? results.length : 0;
  const correct = Array.isArray(results)
    ? results.filter((r) => r.isCorrect).length
    : 0;
  const wrong = total - correct;

  const errorTagsCount = {};
  const wrongItems = [];

  for (const r of results || []) {
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

      for (const tag of r.tags ?? []) {
        errorTagsCount[tag] = (errorTagsCount[tag] || 0) + 1;
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

  updateGlobalStats(user, session);

  const currentLevel = levelName || user.level;
  updateLevelStats(user, currentLevel, session);

  resolveLevelProgress(user, currentLevel, lessonsCountByLevel);

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
export function importProgressJSON(data) {
  try {
    if (!data?.user || !data?.appVersion) return false;

    const state = getOrCreateState();
    const importedUser = data.user;

    ensureUserShape(importedUser);

    const existingIndex = state.users.findIndex((u) => u.id === importedUser.id);

    if (existingIndex !== -1) {
      state.users[existingIndex] = importedUser;
    } else {
      state.users.push(importedUser);
    }

    state.activeUserId = importedUser.id;
    saveState(state);
    return true;
  } catch {
    return false;
  }
}