import lessons from "../data/lessons.json";

/**
 * Devuelve la lección actual según el índice guardado en storage
 */
export function getCurrentLesson(levelName, lessonIndex) {
  const levelLessons = lessons[levelName] || [];
  return levelLessons[lessonIndex] || null;
}

/*
  Genera la sesión diaria con un número limitado de ejercicios
  Rota los ejercicios según el número de sesiones del nivel
*/
export function buildDailySession(
  levelName,
  lessonIndex,
  limit = 5,
  levelSessions = 0
) {
  const lesson = getCurrentLesson(levelName, lessonIndex);
  if (!lesson) return [];

  const all = lesson.exercises ?? [];
  if (!all.length) return [];

  const total = all.length;

  // Offset dinámico según sesiones hechas en el nivel
  const offset = ((levelSessions || 0) * limit) % total;

  const picked = [];
  const max = Math.min(limit, total);

  for (let i = 0; i < max; i++) {
    picked.push(all[(offset + i) % total]);
  }

  return picked;
}

/*
  Genera una sesión de repaso basada en los errores
  Prioriza errores con tags más frecuentes
*/
export function buildReviewSession(wrongItems = [], limit = 3) {
  if (!wrongItems.length) return [];

  // 1️ Contar frecuencia de tags
  const tagCounts = {};
  for (const item of wrongItems) {
    const tags = item.tags ?? [];
    for (const t of tags) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  // 2️ Calcular peso de cada error
  const scored = wrongItems.map((item, idx) => {
    const tags = item.tags ?? [];
    const score = tags.reduce((sum, t) => sum + (tagCounts[t] || 0), 0);
    return { item, score, idx };
  });

  // 3️ Ordenar por score descendente
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx; // mantiene orden original si empate
  });

  // 4️ Devolver los top N
  return scored.slice(0, limit).map((x) => x.item);
}