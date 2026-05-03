import lessons from "../data/lessons.json";

export function getLessonsByLevel(levelName) {
  return Array.isArray(lessons[levelName]) ? lessons[levelName] : [];
}

export function getLessonsCountByLevel(levelName) {
  return getLessonsByLevel(levelName).length;
}

export function getCurrentLesson(levelName, lessonIndex = 0) {
  const levelLessons = getLessonsByLevel(levelName);
  if (!levelLessons.length) return null;

  const safeIndex = Math.max(0, Math.min(lessonIndex, levelLessons.length - 1));
  return levelLessons[safeIndex] || null;
}

export function buildDailySession(levelName, lessonIndex = 0, limit = null) {
  const lesson = getCurrentLesson(levelName, lessonIndex);
  if (!lesson) return [];

  const allExercises = Array.isArray(lesson.exercises) ? lesson.exercises : [];
  if (!allExercises.length) return [];

  if (limit === null || limit === undefined) {
    return [...allExercises];
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || allExercises.length, allExercises.length));
  return allExercises.slice(0, safeLimit);
}

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