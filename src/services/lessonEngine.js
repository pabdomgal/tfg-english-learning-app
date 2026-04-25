import lessons from "../data/lessons.json";

/**
 * Devuelve la lección actual según el índice guardado en storage
 */
export function getCurrentLesson(levelName, lessonIndex = 0) {
  const levelLessons = lessons[levelName] || [];
  if (!levelLessons.length) return null;

  const safeIndex = Math.max(0, Math.min(lessonIndex, levelLessons.length - 1));
  return levelLessons[safeIndex] || null;
}

/**
 * Genera la sesión diaria con un número limitado de ejercicios.
 * Prioriza variedad de tipos y mantiene rotación según sesiones.
 */
export function buildDailySession(
  levelName,
  lessonIndex,
  limit = 5,
  levelSessions = 0
) {
  const lesson = getCurrentLesson(levelName, lessonIndex);
  if (!lesson) return [];

  const all = Array.isArray(lesson.exercises) ? lesson.exercises : [];
  if (!all.length) return [];

  const total = all.length;
  const safeLimit = Math.max(1, Math.min(limit, total));
  const safeSessions = Math.max(0, Number(levelSessions) || 0);

  if (total <= safeLimit) {
    return [...all];
  }

  // 1. Agrupar por tipo
  const byType = {};
  for (const exercise of all) {
    const type = exercise?.type || "unknown";
    if (!byType[type]) byType[type] = [];
    byType[type].push(exercise);
  }

  const typeOrder = Object.keys(byType).sort();

  // 2. Rotar dentro de cada tipo
  const rotatedByType = {};
  for (const type of typeOrder) {
    const items = byType[type];
    const offset = safeSessions % items.length;
    rotatedByType[type] = items
      .slice(offset)
      .concat(items.slice(0, offset));
  }

  const picked = [];
  const usedIds = new Set();

  // 3. Primera pasada: intentar 1 de cada tipo
  let typeCursor = typeOrder.length > 0 ? safeSessions % typeOrder.length : 0;

  while (picked.length < safeLimit) {
    let addedInRound = false;

    for (let i = 0; i < typeOrder.length && picked.length < safeLimit; i++) {
      const type = typeOrder[(typeCursor + i) % typeOrder.length];
      const pool = rotatedByType[type];

      const nextExercise = pool.find((ex) => !usedIds.has(ex.id));
      if (nextExercise) {
        picked.push(nextExercise);
        usedIds.add(nextExercise.id);
        addedInRound = true;
      }
    }

    if (!addedInRound) break;
    typeCursor = (typeCursor + 1) % Math.max(typeOrder.length, 1);
  }

  // 4. Segunda pasada: rellenar con el resto manteniendo rotación global
  if (picked.length < safeLimit) {
    const startIndex = safeSessions % total;

    let step = 2;
    while (step < total && total % step === 0) {
      step += 1;
    }
    if (step >= total) step = 1;

    let cursor = startIndex;
    let safety = 0;

    while (picked.length < safeLimit && safety < total * 2) {
      const candidate = all[cursor];
      if (candidate && !usedIds.has(candidate.id)) {
        picked.push(candidate);
        usedIds.add(candidate.id);
      }

      cursor = (cursor + step + safeSessions) % total;
      safety += 1;
    }
  }

  return picked;
}

/**
 * Genera una sesión de repaso basada en los errores.
 * Prioriza errores con tags más frecuentes.
 */
export function buildReviewSession(wrongItems = [], limit = 3) {
  if (!Array.isArray(wrongItems) || !wrongItems.length) return [];

  const safeLimit = Math.max(1, limit);

  const tagCounts = {};
  for (const item of wrongItems) {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const scored = wrongItems.map((item, idx) => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const score = tags.reduce((sum, tag) => sum + (tagCounts[tag] || 0), 0);

    return {
      item,
      score,
      idx,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  return scored.slice(0, safeLimit).map((entry) => entry.item);
}