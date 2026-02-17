import lessons from "../data/lessons.json";
import { getActiveUser } from "./storage";

export function getCurrentLesson(levelName) {
  const pool = lessons[levelName] || [];
  if (pool.length === 0) return null;

  const { user } = getActiveUser();
  if (!user) return pool[0];

  const idx = user.lessonIndexByLevel?.[levelName] ?? 0;
  const safeIdx = Math.min(idx, pool.length - 1);

  return pool[safeIdx];
}
