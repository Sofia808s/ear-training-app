export const STORAGE_KEY = "ear-training-progress";
export const COURSE_STORAGE_KEY = "ear-training-course-progress";
const SEEN_WORLD_UNLOCKS_STORAGE_KEY = "ear-training-seen-world-unlocks";
const INTRO_SEEN_STORAGE_KEY = "ear-training-intro-seen";

const defaultProgress = {
  correct: 0,
  attempts: 0,
  blitzStats: {
    rounds: 0,
    bestCorrect: 0,
    lastCorrect: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    lastTotal: 0,
    lastAccuracy: 0,
    bestAccuracy: 0
  }
};

function normalizeProgress(progress = {}) {
  return {
    correct: progress.correct || 0,
    attempts: progress.attempts || 0,
    blitzStats: {
      ...defaultProgress.blitzStats,
      ...(progress.blitzStats || {})
    }
  };
}

export function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const progress = saved ? JSON.parse(saved) : defaultProgress;
  const cleanProgress = normalizeProgress(progress);

  if (saved) {
    saveProgress(cleanProgress);
  }

  return cleanProgress;
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
}

export function updateProgress(progress, level, isCorrect) {
  return normalizeProgress({
    ...progress,
    attempts: (progress.attempts || 0) + 1,
    correct: (progress.correct || 0) + (isCorrect ? 1 : 0)
  });
}


export function loadCourseProgress() {
  const saved = localStorage.getItem(COURSE_STORAGE_KEY);
  const progress = saved ? JSON.parse(saved) : { completedTopicIds: [], lessonStats: {} };

  return {
    completedTopicIds: progress.completedTopicIds || [],
    openedTopicIds: progress.openedTopicIds || [],
    lessonStats: progress.lessonStats || {}
  };
}

export function saveCourseProgress(courseProgress) {
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courseProgress));
}

export function openCourseTopic(courseProgress, topicId) {
  if (!topicId || courseProgress.openedTopicIds?.includes(topicId)) {
    return courseProgress;
  }

  return {
    ...courseProgress,
    openedTopicIds: [...(courseProgress.openedTopicIds || []), topicId]
  };
}

export function resetDemoProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COURSE_STORAGE_KEY);
  localStorage.removeItem(SEEN_WORLD_UNLOCKS_STORAGE_KEY);
  localStorage.removeItem(INTRO_SEEN_STORAGE_KEY);
}

export function completeCourseTopic(courseProgress, topicId) {
  if (!topicId || courseProgress.completedTopicIds.includes(topicId)) {
    return courseProgress;
  }

  return {
    ...courseProgress,
    completedTopicIds: [...courseProgress.completedTopicIds, topicId]
  };
}


export function recordCourseLessonResult(courseProgress, topicId, correct, total, answers = []) {
  const passed = correct >= 3;
  const completedTopicIds = passed && !courseProgress.completedTopicIds.includes(topicId)
    ? [...courseProgress.completedTopicIds, topicId]
    : courseProgress.completedTopicIds;

  return {
    ...courseProgress,
    completedTopicIds,
    openedTopicIds: courseProgress.openedTopicIds || [],
    lessonStats: {
      ...(courseProgress.lessonStats || {}),
      [topicId]: {
        correct,
        total,
        accuracy: Math.round((correct / total) * 100),
        passed,
        answers,
        completedAt: new Date().toISOString()
      }
    }
  };
}


export function recordBlitzRoundResult(progress, correct, total) {
  const currentStats = progress.blitzStats || defaultProgress.blitzStats;
  const lastAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const bestCorrect = Math.max(currentStats.bestCorrect || 0, correct);

  return {
    ...progress,
    blitzStats: {
      rounds: (currentStats.rounds || 0) + 1,
      bestCorrect,
      lastCorrect: correct,
      totalCorrect: (currentStats.totalCorrect || 0) + correct,
      totalQuestions: (currentStats.totalQuestions || 0) + total,
      lastTotal: total,
      lastAccuracy,
      bestAccuracy: Math.round((bestCorrect / total) * 100)
    }
  };
}
