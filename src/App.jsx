import { ArrowLeft, BarChart3, BookOpen, CheckCircle2, Headphones, Home, KeyboardMusic, Library, Lock, Music2, Play, Timer, XCircle } from "lucide-react";
import { Component, useEffect, useMemo, useState } from "react";
import { courseSections, courseTopics } from "./data/course";
import { getSavedLanguage, languageStorageKey, translations } from "./data/translations";
import { levels } from "./data/trainingLevels";
import { loadSavedVolume, playChordComparison, playCountdownBeep, playEducationalExamples, playExerciseTones, getAudioPlaybackVersion, playIntervalLearningExamples, playMelodySequence, playIntroAmbience, playPianoAmbience, playReferenceScale, setAudioVolume, stopAllAudio } from "./utils/audio";
import { loadCourseProgress, loadProgress, openCourseTopic, recordBlitzRoundResult, recordCourseLessonResult, resetDemoProgress, saveCourseProgress, saveProgress, updateProgress } from "./utils/progress";

const screens = {
  home: "home",
  journeyMap: "journeyMap",
  world: "world",
  levels: "levels",
  training: "training",
  result: "result",
  progress: "progress",
  reference: "reference",
  melody: "melody",
  blitz: "blitz",
  course: "course",
  topic: "topic",
  lesson: "lesson",
  lessonResult: "lessonResult"
};

const LESSON_TOTAL_QUESTIONS = 5;
const LESSON_PASSING_SCORE = 3;
const BLITZ_READY_COUNT = 3;
const BLITZ_ROUND_TOTAL = 10;

const blitzTimeLimits = {
  notes: 9,
  intervals: 11,
  chords: 14,
  scales: 14
};

const chordComparisonPairs = [
  { root: "C", major: [261.63, 329.63, 392], minor: [261.63, 311.13, 392] },
  { root: "G", major: [196, 246.94, 293.66], minor: [196, 233.08, 293.66] },
  { root: "F", major: [174.61, 220, 261.63], minor: [174.61, 207.65, 261.63] }
];

const melodyNoteButtons = [
  { name: "C", degree: 0 },
  { name: "D", degree: 1 },
  { name: "E", degree: 2 },
  { name: "F", degree: 3 },
  { name: "G", degree: 4 },
  { name: "A", degree: 5 },
  { name: "B", degree: 6 },
  { name: "C+", degree: 7 }
];

const melodyFrequencies = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];

const melodyPatterns = [
  [0, 1, 2],
  [0, 2, 1],
  [0, 2, 4],
  [0, 1, 3, 2],
  [0, 3, 2, 4],
  [0, 2, 4, 5],
  [0, 4, 3, 1, 2],
  [0, 1, 2, 4, 3]
];

const melodyModes = ["repeat", "choose", "complete"];

const lessonKnowledgeTypes = ["formula", "description", "tip", "sound", "focus"];
const guidedLessonPhases = ["intro", "difference", "focus", "challenge", "summary", "question"];
const lessonIntroExamples = {
  unison: [
    { answer: "Unison", tones: [261.63, 261.63] },
    { answer: "Unison", tones: [329.63, 329.63] },
    { answer: "Unison", tones: [392, 392] }
  ],
  octave: [
    { answer: "Octave", tones: [261.63, 523.25] },
    { answer: "Octave", tones: [196, 392] },
    { answer: "Octave", tones: [293.66, 587.33] }
  ],
  seconds: [
    { answer: "Minor 2nd", tones: [261.63, 277.18] },
    { answer: "Major 2nd", tones: [293.66, 329.63] },
    { answer: "Minor 2nd", tones: [392, 415.3] }
  ],
  thirds: [
    { answer: "Minor 3rd", tones: [261.63, 311.13] },
    { answer: "Major 3rd", tones: [293.66, 369.99] },
    { answer: "Minor 3rd", tones: [392, 466.16] }
  ],
  "fourths-and-fifths": [
    { answer: "Perfect 4th", tones: [261.63, 349.23] },
    { answer: "Perfect 5th", tones: [293.66, 440] },
    { answer: "Perfect 4th", tones: [196, 261.63] }
  ],
  tritone: [
    { answer: "Tritone", tones: [261.63, 369.99] },
    { answer: "Tritone", tones: [293.66, 415.3] },
    { answer: "Tritone", tones: [196, 277.18] }
  ],
  "sixths-and-sevenths": [
    { answer: "Minor 6th", tones: [261.63, 415.3] },
    { answer: "Major 6th", tones: [293.66, 493.88] },
    { answer: "Minor 7th", tones: [196, 349.23] },
    { answer: "Major 7th interval", tones: [261.63, 493.88] }
  ],
  "major-minor-triads": [
    { answer: "Major triad", tones: [261.63, 329.63, 392] },
    { answer: "Minor triad", tones: [261.63, 311.13, 392] }
  ],
  "diminished-augmented-triads": [
    { answer: "Diminished triad", tones: [246.94, 293.66, 349.23] },
    { answer: "Augmented triad", tones: [196, 246.94, 311.13] }
  ],
  "seventh-chord-basics": [
    { answer: "Dominant 7th", tones: [261.63, 329.63, 392, 466.16] },
    { answer: "Major 7th", tones: [196, 246.94, 293.66, 369.99] },
    { answer: "Minor 7th chord", tones: [293.66, 349.23, 440, 523.25] }
  ],
  "dominant-seventh-chord": [
    { answer: "Dominant 7th", tones: [261.63, 329.63, 392, 466.16] },
    { answer: "Dominant 7th", tones: [196, 246.94, 293.66, 349.23] }
  ],
  "major-seventh-chord": [
    { answer: "Major 7th", tones: [196, 246.94, 293.66, 369.99] },
    { answer: "Major 7th", tones: [261.63, 329.63, 392, 493.88] }
  ],
  "minor-seventh-chord": [
    { answer: "Minor 7th chord", tones: [293.66, 349.23, 440, 523.25] },
    { answer: "Minor 7th chord", tones: [220, 261.63, 329.63, 392] }
  ],
  "half-diminished-seventh-chord": [
    { answer: "Half-diminished 7th", tones: [246.94, 293.66, 349.23, 440] },
    { answer: "Half-diminished 7th", tones: [196, 233.08, 293.66, 349.23] }
  ],
  "diminished-seventh-chord": [
    { answer: "Diminished 7th", tones: [246.94, 293.66, 349.23, 415.3] },
    { answer: "Diminished 7th", tones: [196, 233.08, 277.18, 329.63] }
  ],
  "seventh-chord-resolution": [
    { answer: "Dominant 7th", tones: [261.63, 329.63, 392, 466.16] },
    { answer: "Half-diminished 7th", tones: [246.94, 293.66, 349.23, 440] },
    { answer: "Diminished 7th", tones: [246.94, 293.66, 349.23, 415.3] }
  ],
  "major-scale": [
    { answer: "Major scale", tones: [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25] },
    { answer: "Major scale", tones: [293.66, 329.63, 369.99, 392, 440, 493.88, 554.37, 587.33] }
  ],
  "natural-minor": [
    { answer: "Natural minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440] },
    { answer: "Natural minor", tones: [293.66, 329.63, 349.23, 392, 440, 466.16, 523.25, 587.33] }
  ],
  "harmonic-minor": [
    { answer: "Harmonic minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 415.3, 440] },
    { answer: "Harmonic minor", tones: [293.66, 329.63, 349.23, 392, 440, 466.16, 554.37, 587.33] }
  ],
  "melodic-minor": [
    { answer: "Melodic minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 369.99, 415.3, 440] },
    { answer: "Melodic minor", tones: [293.66, 329.63, 349.23, 392, 440, 493.88, 554.37, 587.33] }
  ]
};
const beginnerIntervalAnswers = ["Unison", "Octave", "Minor 2nd", "Major 2nd", "Perfect 5th"];
const groupedIntervalDistractors = ["Unison", "Octave", "Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th", "Tritone", "Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th", "Major 7th interval"];
const basicNotesTopicIds = ["basic-note-recognition", "high-vs-low-pitch"];
const basicIntervalsTopicIds = ["seconds"];
const basicChordsTopicIds = ["major-minor-triads"];
const melodyUnlockTopicIds = [...basicNotesTopicIds, ...basicIntervalsTopicIds, ...basicChordsTopicIds];
const seenWorldUnlocksStorageKey = "ear-training-seen-world-unlocks";
const introSeenStorageKey = "ear-training-intro-seen";


function hasCompletedTopics(courseProgress, topicIds) {
  return topicIds.every((topicId) => courseProgress.completedTopicIds.includes(topicId));
}

function isTheoryUnlocked(courseProgress) {
  return (courseProgress.openedTopicIds || []).length > 0 || courseProgress.completedTopicIds.length > 0;
}

function isTrainingUnlocked(courseProgress) {
  return hasCompletedTopics(courseProgress, basicNotesTopicIds);
}

function isBlitzUnlocked(courseProgress) {
  return hasCompletedTopics(courseProgress, [...basicNotesTopicIds, ...basicIntervalsTopicIds]);
}

function isMelodyUnlocked(courseProgress) {
  return melodyUnlockTopicIds.every((topicId) => courseProgress.completedTopicIds.includes(topicId));
}

function getLessonOptionKey(type, answer) {
  return "lesson:" + type + ":" + answer;
}

function getLessonDecoyKey(levelId, type, index) {
  return "lesson:" + type + ":decoy:" + levelId + ":" + index;
}

const lessonOnlyQuestions = {
  notes: [
    { answer: "C", tones: [523.25], options: ["C", "E", "G", "A"] },
    { answer: "E", tones: [164.81], options: ["C", "E", "G", "A"] },
    { answer: "G", tones: [196], options: ["C", "E", "G", "A"] },
    { answer: "A", tones: [220], options: ["C", "E", "G", "A"] }
  ],
  intervals: [
    { answer: "Unison", tones: [261.63, 261.63], options: ["Unison", "Octave", "Minor 2nd", "Perfect 5th"] },
    { answer: "Unison", tones: [329.63, 329.63], options: ["Unison", "Octave", "Major 2nd", "Perfect 4th"] },
    { answer: "Octave", tones: [261.63, 523.25], options: ["Unison", "Octave", "Perfect 5th", "Minor 7th"] },
    { answer: "Octave", tones: [196, 392], options: ["Unison", "Octave", "Perfect 5th", "Major 6th"] },
    { answer: "Minor 2nd", tones: [261.63, 277.18], options: ["Minor 2nd", "Major 2nd", "Major 3rd", "Perfect 4th"] },
    { answer: "Major 2nd", tones: [261.63, 293.66], options: ["Minor 2nd", "Major 2nd", "Major 3rd", "Perfect 5th"] },
    { answer: "Minor 3rd", tones: [261.63, 311.13], options: ["Minor 3rd", "Major 3rd", "Perfect 4th", "Tritone"] },
    { answer: "Major 3rd", tones: [261.63, 329.63], options: ["Minor 3rd", "Major 3rd", "Perfect 4th", "Perfect 5th"] },
    { answer: "Perfect 4th", tones: [261.63, 349.23], options: ["Major 3rd", "Perfect 4th", "Perfect 5th", "Tritone"] },
    { answer: "Perfect 5th", tones: [261.63, 392], options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Octave"] },
    { answer: "Tritone", tones: [261.63, 369.99], options: ["Major 3rd", "Perfect 4th", "Tritone", "Perfect 5th"] },
    { answer: "Minor 6th", tones: [261.63, 415.3], options: ["Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th"] },
    { answer: "Major 6th", tones: [261.63, 440], options: ["Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th"] },
    { answer: "Major 7th interval", tones: [261.63, 493.88], options: ["Major 6th", "Minor 7th", "Major 7th interval", "Octave"] },
    { answer: "Minor 7th", tones: [261.63, 466.16], options: ["Major 6th", "Minor 7th", "Octave", "Tritone"] },
    { answer: "Minor 2nd", tones: [293.66, 311.13], options: ["Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd"] },
    { answer: "Major 2nd", tones: [392, 440], options: ["Minor 2nd", "Major 2nd", "Minor 3rd", "Perfect 4th"] },
    { answer: "Minor 3rd", tones: [293.66, 349.23], options: ["Minor 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th"] },
    { answer: "Major 3rd", tones: [392, 493.88], options: ["Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 5th"] },
    { answer: "Perfect 4th", tones: [196, 261.63], options: ["Major 3rd", "Perfect 4th", "Perfect 5th", "Tritone"] },
    { answer: "Perfect 5th", tones: [293.66, 440], options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Minor 7th"] },
    { answer: "Tritone", tones: [293.66, 415.3], options: ["Perfect 4th", "Tritone", "Perfect 5th", "Minor 7th"] },
    { answer: "Minor 6th", tones: [293.66, 466.16], options: ["Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th"] },
    { answer: "Major 6th", tones: [196, 329.63], options: ["Perfect 5th", "Minor 6th", "Major 6th", "Octave"] },
    { answer: "Major 7th interval", tones: [196, 369.99], options: ["Major 6th", "Minor 7th", "Major 7th interval", "Octave"] },
    { answer: "Minor 7th", tones: [293.66, 523.25], options: ["Major 6th", "Minor 7th", "Octave", "Perfect 5th"] }
  ],
  chords: [
    { answer: "Major triad", tones: [174.61, 220, 261.63], options: ["Major triad", "Minor triad"] },
    { answer: "Minor triad", tones: [293.66, 349.23, 440], options: ["Major triad", "Minor triad"] },
    { answer: "Major triad", tones: [220, 277.18, 329.63], options: ["Major triad", "Minor triad"] },
    { answer: "Minor triad", tones: [329.63, 392, 493.88], options: ["Major triad", "Minor triad"] },
    { answer: "Diminished triad", tones: [246.94, 293.66, 349.23], options: ["Diminished triad", "Augmented triad", "Major triad", "Minor triad"] },
    { answer: "Augmented triad", tones: [196, 246.94, 311.13], options: ["Diminished triad", "Augmented triad", "Major triad", "Minor triad"] },
    { answer: "Dominant 7th", tones: [261.63, 329.63, 392, 466.16], options: ["Dominant 7th", "Major 7th", "Minor 7th chord", "Half-diminished 7th"] },
    { answer: "Major 7th", tones: [196, 246.94, 293.66, 369.99], options: ["Dominant 7th", "Major 7th", "Minor 7th chord", "Half-diminished 7th"] },
    { answer: "Minor 7th chord", tones: [293.66, 349.23, 440, 523.25], options: ["Dominant 7th", "Major 7th", "Minor 7th chord", "Half-diminished 7th"] },
    { answer: "Half-diminished 7th", tones: [246.94, 293.66, 349.23, 440], options: ["Half-diminished 7th", "Diminished 7th", "Minor 7th chord", "Dominant 7th"] },
    { answer: "Diminished 7th", tones: [246.94, 293.66, 349.23, 415.3], options: ["Half-diminished 7th", "Diminished 7th", "Minor 7th chord", "Dominant 7th"] }
  ],
  scales: [
    { answer: "Major scale", tones: [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25], options: ["Major scale", "Natural minor", "Harmonic minor", "Melodic minor"] },
    { answer: "Major scale", tones: [293.66, 329.63, 369.99, 392, 440, 493.88, 554.37, 587.33], options: ["Major scale", "Natural minor", "Harmonic minor", "Melodic minor"] },
    { answer: "Major scale", tones: [196, 220, 246.94, 261.63, 293.66, 329.63, 369.99, 392], options: ["Major scale", "Natural minor", "Harmonic minor", "Melodic minor"] },
    { answer: "Natural minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440], options: ["Major scale", "Natural minor", "Harmonic minor", "Melodic minor"] },
    { answer: "Harmonic minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 415.3, 440], options: ["Natural minor", "Harmonic minor", "Melodic minor", "Major scale"] },
    { answer: "Melodic minor", tones: [220, 246.94, 261.63, 293.66, 329.63, 369.99, 415.3, 440], options: ["Natural minor", "Harmonic minor", "Melodic minor", "Major scale"] }
  ]
};




function getHomeJourneySteps(t, unlocks, actions) {
  const worlds = t.homeJourney.worlds;

  return [
    { id: "notes", icon: Music2, unlocked: true, completed: unlocks.trainingUnlocked, action: actions.notes, ...worlds.notes },
    { id: "intervals", icon: Headphones, unlocked: unlocks.trainingUnlocked, completed: unlocks.blitzUnlocked, action: actions.intervals, ...worlds.intervals },
    { id: "chords", icon: KeyboardMusic, unlocked: unlocks.blitzUnlocked, completed: unlocks.chordBasicsUnlocked, action: actions.chords, ...worlds.chords },
    { id: "seventhChords", icon: Library, unlocked: unlocks.chordBasicsUnlocked, completed: unlocks.seventhBasicsUnlocked, action: actions.seventhChords, ...worlds.seventhChords },
    { id: "scalesModes", icon: BookOpen, unlocked: unlocks.scalesBasicsUnlocked, completed: unlocks.scalesBasicsUnlocked, action: actions.scalesModes, ...worlds.scalesModes },
    { id: "tonality", icon: Music2, unlocked: unlocks.scalesBasicsUnlocked, completed: false, action: actions.tonality, ...worlds.tonality },
    { id: "melody", icon: KeyboardMusic, unlocked: unlocks.melodyUnlocked, completed: false, action: actions.melody, ...worlds.melody },
    { id: "harmony", icon: Headphones, unlocked: unlocks.chordBasicsUnlocked, completed: false, action: actions.harmony, ...worlds.harmony },
    { id: "bluesJazz", icon: Timer, unlocked: unlocks.seventhBasicsUnlocked, completed: false, action: actions.bluesJazz, ...worlds.bluesJazz },
    { id: "intuition", icon: BarChart3, unlocked: unlocks.advancedUnlocked, completed: false, action: actions.intuition, ...worlds.intuition }
  ];
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getIntervalPattern(sequence) {
  if (!Array.isArray(sequence) || sequence.length < 2) return [];
  return sequence.slice(1).map((degree, index) => degree - sequence[index]);
}

function melodyPatternsMatch(firstSequence, secondSequence) {
  const firstPattern = getIntervalPattern(firstSequence);
  const secondPattern = getIntervalPattern(secondSequence);

  return firstPattern.length === secondPattern.length && firstPattern.every((step, index) => step === secondPattern[index]);
}


function formatMelodyPattern(sequence, t) {
  return sequence.map((degree) => translateAnswer(melodyNoteButtons.find((note) => note.degree === degree)?.name || "C", t)).join(" - ");
}

function getMelodyTones(sequence) {
  return sequence.map((degree) => melodyFrequencies[Math.max(0, Math.min(melodyFrequencies.length - 1, degree))]);
}

function createMelodyQuestion(mode = "repeat") {
  const sequence = [...getRandomItem(melodyPatterns)];

  if (mode === "choose") {
    const distractors = melodyPatterns
      .filter((pattern) => !melodyPatternsMatch(pattern, sequence))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((pattern) => ({ sequence: pattern }));
    const options = [{ sequence, correct: true }, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((option, index) => ({ ...option, label: String.fromCharCode(65 + index) }));

    return { mode, sequence, tones: getMelodyTones(sequence), options, correctLabel: options.find((option) => option.correct)?.label || "A" };
  }

  if (mode === "complete") {
    const promptSequence = sequence.slice(0, -1);
    const correctDegree = sequence[sequence.length - 1];
    const optionDegrees = [...new Set([correctDegree, Math.max(0, correctDegree - 1), Math.min(7, correctDegree + 1)])]
      .sort(() => Math.random() - 0.5);

    return { mode, sequence, promptSequence, correctDegree, tones: getMelodyTones(promptSequence), options: optionDegrees };
  }

  return { mode, sequence, tones: getMelodyTones(sequence), options: melodyNoteButtons };
}

function getQuestionKey(question) {
  if (!question) return "missing";

  if (question.type === "compare") {
    return question.answer + "|" + question.chordPair.map((chord) => chord.join("-")).join("|");
  }

  if (question.type === "knowledge") {
    return question.answer + "|" + question.promptVariant + "|" + (question.conceptAnswer || "");
  }

  return question.answer + "|" + (question.tones || []).join("-");
}

function getQuestionRoot(question) {
  if (question.root) return question.root;
  const tones = question.tones || question.chordPair?.[0] || [];
  return tones.length > 0 ? String(Math.round(tones[0] * 100) / 100) : "";
}

function getAnswerType(answer, levelId) {
  const normalized = answer.toLowerCase();

  if (levelId === "chords") {
    if (normalized.includes("diminished")) return "diminished";
    if (normalized.includes("augmented")) return "augmented";
    if (normalized.includes("7th")) return "seventh";
    if (normalized.includes("minor")) return "minor";
    if (normalized.includes("major")) return "major";
  }

  if (levelId === "intervals") {
    if (normalized.includes("tritone")) return "tritone";
    if (normalized.includes("2nd")) return "second";
    if (normalized.includes("3rd")) return "third";
    if (normalized.includes("4th")) return "fourth";
    if (normalized.includes("5th")) return "fifth";
    if (normalized.includes("6th")) return "sixth";
    if (normalized.includes("7th")) return "seventh";
    if (normalized.includes("octave")) return "octave";
  }

  if (levelId === "scales") {
    if (normalized.includes("minor")) return normalized.replace(" scale", "");
    if (normalized.includes("major")) return "major";
    return normalized;
  }

  return answer;
}

function countRecentMatches(history, getValue, value) {
  let count = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (getValue(history[index]) !== value) break;
    count += 1;
  }

  return count;
}

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

function pickBalancedQuestion(level, history = [], pool = level.questions) {
  const recentQuestion = history[history.length - 1];
  const shuffledPool = shuffleQuestions(pool);

  const candidates = shuffledPool.filter((question) => {
    const answerType = getAnswerType(question.answer, level.id);
    const repeatsAnswer = countRecentMatches(history, (item) => item.answer, question.answer);
    const repeatsType = countRecentMatches(history, (item) => getAnswerType(item.answer, level.id), answerType);
    const repeatsRoot = countRecentMatches(history, getQuestionRoot, getQuestionRoot(question));
    const repeatsExactQuestion = recentQuestion && getQuestionKey(recentQuestion) === getQuestionKey(question);

    return !repeatsExactQuestion && repeatsAnswer < 2 && repeatsType < 2 && repeatsRoot < 2;
  });

  if (candidates.length > 0) return candidates[0];

  return shuffledPool.find((question) => !recentQuestion || getQuestionKey(recentQuestion) !== getQuestionKey(question)) || shuffledPool[0];
}

function getRandomQuestion(level, history = [], pool = level.questions) {
  return pickBalancedQuestion(level, history, pool);
}

function getCompleteQuestionPool(level) {
  return [...level.questions, ...(lessonOnlyQuestions[level.id] || [])];
}

function getUniqueQuestions(questions) {
  return Array.from(new Map(questions.map((question) => [getQuestionKey(question), question])).values());
}

function pickAnswerOptions(answer, allowedAnswers) {
  const availableAnswers = [...allowedAnswers].filter(Boolean);

  if (!allowedAnswers.has(answer)) return [answer];
  if (availableAnswers.length <= 4) return availableAnswers;

  const distractors = shuffleQuestions(availableAnswers.filter((option) => option !== answer)).slice(0, 3);
  return shuffleQuestions([answer, ...distractors]);
}

function getIntervalLessonAnswerPool(topic, allowedAnswers) {
  const answers = [...new Set([...(topic.focusAnswers || []), ...allowedAnswers])];
  groupedIntervalDistractors.forEach((answer) => {
    if (answers.length < 4 && !answers.includes(answer)) answers.push(answer);
  });
  return new Set(answers);
}

function prepareQuestionForAllowedAnswers(question, level, allowedAnswers) {
  if (!question?.answer) return null;

  if (!allowedAnswers || allowedAnswers.size === 0) {
    return question;
  }

  return {
    ...question,
    options: pickAnswerOptions(question.answer, allowedAnswers)
  };
}

function getLessonKnowledgeOptions(level, type, correctAnswer, allowedAnswers) {
  const learnedOptions = [...allowedAnswers].filter(Boolean).map((answer) => getLessonOptionKey(type, answer));
  const correctOption = getLessonOptionKey(type, correctAnswer);
  const options = learnedOptions.includes(correctOption) ? learnedOptions : [correctOption, ...learnedOptions];

  let decoyIndex = 1;
  while (options.length < 4) {
    options.push(getLessonDecoyKey(level.id, type, decoyIndex));
    decoyIndex += 1;
  }

  return shuffleQuestions([...new Set(options)]).slice(0, 4);
}

function buildKnowledgeQuestion(topic, level, type, correctAnswer, allowedAnswers, index) {
  const answer = getLessonOptionKey(type, correctAnswer);

  return {
    type: "knowledge",
    promptVariant: type,
    conceptAnswer: correctAnswer,
    answer,
    correctAnswer: correctAnswer,
    options: getLessonKnowledgeOptions(level, type, correctAnswer, allowedAnswers),
    label: type,
    root: topic.id + "-" + type + "-" + index
  };
}


function normalizeLessonQuestion(sourceQuestion, index) {
  if (!sourceQuestion || !sourceQuestion.answer) {
    console.warn("[lesson] Skipping invalid question", sourceQuestion);
    return null;
  }

  const minimumOptions = sourceQuestion.type === "compare" ? 2 : 4;
  const optionCount = sourceQuestion.type === "compare" ? 2 : 4;
  let options = Array.isArray(sourceQuestion.options) ? [...new Set(sourceQuestion.options.filter(Boolean))] : [];
  const distractors = shuffleQuestions(options.filter((option) => option !== sourceQuestion.answer)).slice(0, optionCount - 1);
  options = shuffleQuestions([sourceQuestion.answer, ...distractors]);

  if (options.length < minimumOptions || options.filter((option) => option === sourceQuestion.answer).length !== 1) {
    console.warn("[lesson] Question does not have enough unique option keys", sourceQuestion);
    return null;
  }

  return {
    type: sourceQuestion.type || "listen",
    label: sourceQuestion.type === "compare" ? "Compare two chords" : "Listen and choose",
    promptVariant: sourceQuestion.promptVariant || (index % 2 === 0 ? "listen" : "match"),
    tones: sourceQuestion.tones,
    chordPair: sourceQuestion.chordPair,
    root: sourceQuestion.root,
    answer: sourceQuestion.answer,
    correctAnswer: sourceQuestion.correctAnswer || sourceQuestion.answer,
    conceptAnswer: sourceQuestion.conceptAnswer || sourceQuestion.correctAnswer || sourceQuestion.answer,
    options
  };
}

function getMinimumLessonOptionCount(question) {
  return question?.type === "compare" ? 2 : 4;
}

function isValidLessonQuestion(question) {
  return Boolean(
    question &&
    question.answer &&
    Array.isArray(question.options) &&
    question.options.length >= getMinimumLessonOptionCount(question) &&
    question.options.includes(question.answer)
  );
}

function getSafeLessonQuestion(questionList, currentIndex) {
  if (!Array.isArray(questionList) || questionList.length === 0) return null;
  if (currentIndex >= 0 && currentIndex < questionList.length && isValidLessonQuestion(questionList[currentIndex])) {
    return questionList[currentIndex];
  }

  console.warn("[lesson] Invalid lesson index or question", { currentIndex, questionCount: questionList.length });
  return questionList.find(isValidLessonQuestion) || null;
}

function getPracticeQuestionsForLevel(level, courseProgress, reviewOnly = false) {
  const completePool = getCompleteQuestionPool(level);
  const levelTopics = courseTopics.filter((topic) => topic.levelId === level.id);
  let matchingTopics = levelTopics.filter((topic) => {
    const status = getTopicStatus(topic, courseProgress);
    return reviewOnly ? status === "completed" : status === "completed" || status === "available";
  });

  if (matchingTopics.length === 0 && reviewOnly) {
    matchingTopics = levelTopics.filter((topic) => getTopicStatus(topic, courseProgress) === "available");
  }

  if (matchingTopics.length === 0 && levelTopics.length > 0) {
    matchingTopics = [levelTopics[0]];
  }

  const allowedAnswers = new Set(matchingTopics.flatMap((topic) => topic.focusAnswers || []));
  const practicePool = completePool
    .filter((question) => allowedAnswers.has(question.answer))
    .map((question) => prepareQuestionForAllowedAnswers(question, level, allowedAnswers))
    .filter(Boolean);

  return practicePool.length > 0 ? getUniqueQuestions(practicePool) : [];
}

function addQuestionToHistory(history, question) {
  const lastQuestion = history[history.length - 1];

  if (lastQuestion && getQuestionKey(lastQuestion) === getQuestionKey(question)) {
    return history.slice(-6);
  }

  return [...history, question].slice(-6);
}

function getLevelById(levelId) {
  return levels.find((level) => level.id === levelId) || levels[0];
}

function getBlitzTimeLimit(level) {
  return blitzTimeLimits[level.id] || 10;
}

function getLessonAllowedAnswers(topic, courseProgress) {
  const topicIndex = courseTopics.findIndex((courseTopic) => courseTopic.id === topic.id);
  const earlierCompletedTopics = courseTopics.slice(0, topicIndex).filter((courseTopic) => (
    courseTopic.levelId === topic.levelId && courseProgress.completedTopicIds.includes(courseTopic.id)
  ));

  return new Set([
    ...(topic.focusAnswers || []),
    ...earlierCompletedTopics.flatMap((courseTopic) => courseTopic.focusAnswers || [])
  ]);
}

function getLessonIntroExamples(topic) {
  const topicExamples = lessonIntroExamples[topic.id];
  if (topicExamples) return topicExamples;

  const levelQuestions = lessonOnlyQuestions[topic.levelId] || [];
  return (topic.focusAnswers || []).slice(0, 3).map((answer) => ({
    answer,
    tones: (levelQuestions.find((question) => question.answer === answer) || {}).tones || []
  })).filter((example) => example.tones.length > 0);
}

function hasGuidedLesson(topic) {
  return ["intervals", "chords", "scales"].includes(topic.levelId) && getLessonIntroExamples(topic).length > 0;
}

function getLessonDifferenceExamples(topic) {
  return getLessonIntroExamples(topic).slice(0, 2);
}

function getLessonFocusExamples(topic) {
  const examples = getLessonIntroExamples(topic);

  if (topic.levelId === "chords") {
    return examples.map((example) => {
      const tones = example.tones || [];
      if (tones.length >= 4) return { ...example, tones: [tones[0], tones[tones.length - 1]] };
      if (tones.length >= 3) return { ...example, tones: [tones[0], tones[1]] };
      return example;
    }).slice(0, 2);
  }

  if (topic.levelId === "scales") {
    return examples.map((example) => ({ ...example, tones: (example.tones || []).slice(0, 5) })).slice(0, 2);
  }

  return examples.slice(0, 2);
}

function buildIntervalComparisonQuestion(topic, primaryConcept) {
  const answer = "lesson:comparison:" + topic.id + ":correct";
  return normalizeLessonQuestion({
    type: "knowledge",
    promptVariant: "comparison",
    conceptAnswer: primaryConcept,
    correctAnswer: primaryConcept,
    answer,
    options: [
      answer,
      "lesson:comparison:" + topic.id + ":decoy:1",
      "lesson:comparison:" + topic.id + ":decoy:2",
      "lesson:comparison:" + topic.id + ":decoy:3"
    ],
    root: topic.id + "-comparison"
  }, 4);
}

function buildIntervalLessonQuestions(topic, level, lessonPool, focusedQuestions, primaryConcept) {
  const selectedQuestions = [];
  const focusedByAnswer = new Map();

  focusedQuestions.forEach((question) => {
    if (!focusedByAnswer.has(question.answer)) focusedByAnswer.set(question.answer, []);
    focusedByAnswer.get(question.answer).push(question);
  });

  shuffleQuestions(topic.focusAnswers || []).forEach((answer) => {
    if (selectedQuestions.length >= 4) return;
    const options = focusedByAnswer.get(answer) || [];
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, options);
    if (nextQuestion) selectedQuestions.push(nextQuestion);
  });

  while (selectedQuestions.length < 4 && focusedQuestions.length > 0) {
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, focusedQuestions);
    if (!nextQuestion) break;
    selectedQuestions.push(nextQuestion);
  }

  if (primaryConcept) {
    selectedQuestions.push(buildKnowledgeQuestion(topic, level, "focus", primaryConcept, getIntervalLessonAnswerPool(topic, new Set(topic.focusAnswers || [primaryConcept])), 0));
  }

  while (selectedQuestions.length < LESSON_TOTAL_QUESTIONS && lessonPool.length > 0) {
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, lessonPool);
    if (!nextQuestion) break;
    selectedQuestions.push(nextQuestion);
  }

  return selectedQuestions
    .map((question, index) => normalizeLessonQuestion(question, index))
    .filter(Boolean)
    .slice(0, LESSON_TOTAL_QUESTIONS);
}

function buildChordComparisonQuestions(topic) {
  if (topic.id !== "major-minor-triads") return [];

  return chordComparisonPairs.slice(0, 3).map((pair, index) => {
    const asksForMajor = index % 2 === 0;
    const majorFirst = index % 2 === 0;

    return {
      type: "compare",
      promptVariant: asksForMajor ? "compareMajor" : "compareMinor",
      root: pair.root,
      chordPair: majorFirst ? [pair.major, pair.minor] : [pair.minor, pair.major],
      answer: majorFirst === asksForMajor ? "firstChord" : "secondChord",
      correctAnswer: asksForMajor ? "Major triad" : "Minor triad",
      options: ["firstChord", "secondChord"]
    };
  });
}

function buildLessonQuestions(topic, courseProgress = { completedTopicIds: [] }) {
  const level = getLevelById(topic.levelId);
  const allowedAnswers = getLessonAllowedAnswers(topic, courseProgress);
  const optionAnswers = level.id === "intervals" ? getIntervalLessonAnswerPool(topic, allowedAnswers) : allowedAnswers;
  const comparisonQuestions = buildChordComparisonQuestions(topic).map((question, index) => normalizeLessonQuestion(question, index)).filter(Boolean);
  const lessonPool = getUniqueQuestions(getCompleteQuestionPool(level))
    .filter((question) => allowedAnswers.has(question.answer))
    .map((question, index) => normalizeLessonQuestion(prepareQuestionForAllowedAnswers(question, level, optionAnswers), index))
    .filter(Boolean);
  const focusedQuestions = lessonPool.filter((question) => (topic.focusAnswers || []).includes(question.answer));
  const selectedQuestions = [];
  const mainConcepts = (topic.focusAnswers || []).filter((answer) => allowedAnswers.has(answer));
  const primaryConcept = mainConcepts[0] || [...allowedAnswers][0];

  if (level.id === "intervals") {
    return buildIntervalLessonQuestions(topic, level, lessonPool, focusedQuestions, primaryConcept);
  }

  comparisonQuestions.forEach((question) => {
    if (question && selectedQuestions.length < 4) selectedQuestions.push(question);
  });

  while (selectedQuestions.length < 4 && focusedQuestions.length > 0) {
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, focusedQuestions);
    if (!nextQuestion) break;
    selectedQuestions.push(nextQuestion);
  }

  if (level.id !== "notes") {
    ["focus"].forEach((type, index) => {
      if (selectedQuestions.length >= LESSON_TOTAL_QUESTIONS || !primaryConcept) return;
      selectedQuestions.push(buildKnowledgeQuestion(topic, level, type, primaryConcept, allowedAnswers, index));
    });
  }

  while (selectedQuestions.length < LESSON_TOTAL_QUESTIONS && focusedQuestions.length > 0) {
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, focusedQuestions) || focusedQuestions[selectedQuestions.length % focusedQuestions.length];
    selectedQuestions.push(nextQuestion);
  }

  while (selectedQuestions.length < LESSON_TOTAL_QUESTIONS && lessonPool.length > 0) {
    const nextQuestion = pickBalancedQuestion(level, selectedQuestions, lessonPool) || lessonPool[selectedQuestions.length % lessonPool.length];
    selectedQuestions.push(nextQuestion);
  }

  const validQuestions = selectedQuestions
    .map((question, index) => normalizeLessonQuestion(question, index))
    .filter(Boolean)
    .slice(0, LESSON_TOTAL_QUESTIONS);

  if (validQuestions.length < LESSON_TOTAL_QUESTIONS) {
    console.warn("[lesson] Built a short lesson", { topicId: topic.id, count: validQuestions.length });
  }

  return validQuestions;
}

function getLessonExplanation(level, answer, t) {
  const theory = getTheory(level, answer, t);
  return translateAnswer(answer, t) + ": " + (t.lessonTheory[answer] || theory.sound + " " + theory.tip);
}
function getGuidedLessonExamplesForPhase(topic, phase) {
  if (phase === "difference") return getLessonDifferenceExamples(topic);
  if (phase === "focus") return getLessonFocusExamples(topic);
  if (phase === "challenge") return getLessonIntroExamples(topic).slice(-1);
  if (phase === "summary") return getLessonIntroExamples(topic).slice(0, 1);
  return getLessonIntroExamples(topic);
}

function getGuidedLessonText(topic, phase, t) {
  const topicText = getTopicText(topic, t);
  const examples = getGuidedLessonExamplesForPhase(topic, phase).map((example) => translateAnswer(example.answer, t));
  const first = examples[0] || topicText.title;
  const second = examples[1] || first;
  const phaseText = t.lessonFlow[phase] || t.lessonFlow.intro;

  return {
    badge: phaseText.badge,
    title: phaseText.title(topicText.title),
    text: phaseText.text(first, second),
    examplesLabel: phaseText.examplesLabel,
    focusLabel: phaseText.focusLabel,
    focus: phase === "summary" ? topicText.listenFor : phaseText.focus(first, second)
  };
}

function getLessonFeedbackTitle(feedback, level, t) {
  const answer = translateAnswer(feedback.correctAnswer, t);
  return feedback.isCorrect ? t.lessonFeedback.correct(answer) : t.lessonFeedback.incorrect(answer);
}

function getLessonMicroFeedback(feedback, level, t) {
  const theory = getTheory(level, feedback.theoryAnswer || feedback.correctAnswer, t);
  const selected = translateAnswer(feedback.userAnswer, t);
  const correct = translateAnswer(feedback.correctAnswer, t);

  if (feedback.isCorrect) {
    return t.lessonFeedback.correctTip(correct, theory.tip);
  }

  return t.lessonFeedback.incorrectTip(selected, correct, theory.tip);
}


function getTheory(level, answer, t) {
  return t.theoryByAnswer?.[answer] || (t.useTrainingTheoryFallback ? level.theoryByAnswer?.[answer] : null) || t.theoryFallback;
}

function getComparison(level, selectedAnswer, correctAnswer, t) {
  const selectedTheory = getTheory(level, selectedAnswer, t);
  const correctTheory = getTheory(level, correctAnswer, t);
  const selectedText = translateAnswer(selectedAnswer, t);
  const correctText = translateAnswer(correctAnswer, t);

  if (level.id === "intervals") {
    return t.comparisons.intervals(selectedText, correctText, selectedTheory.sound, correctTheory.sound);
  }

  if (level.id === "chords") {
    return t.comparisons.chords(selectedText, correctText, selectedTheory.sound, correctTheory.sound);
  }

  if (level.id === "scales") {
    return t.comparisons.scales(selectedText, correctText, correctTheory.tip);
  }

  return t.comparisons.notes(selectedText, correctText, correctTheory.tip);
}


function getDisplayUniqueOptions(options, t) {
  const uniqueOptions = [];
  const seenLabels = new Set();

  (options || []).filter(Boolean).forEach((option) => {
    const label = translateAnswer(option, t).trim().toLowerCase();
    if (seenLabels.has(label)) return;
    seenLabels.add(label);
    uniqueOptions.push(option);
  });

  return uniqueOptions;
}

function hasFourUniqueDisplayedOptions(question, t) {
  if (!question || !Array.isArray(question.options)) return false;
  const uniqueOptions = getDisplayUniqueOptions(question.options, t, question.answer);
  return uniqueOptions.length >= 4 && uniqueOptions.filter((option) => option === question.answer).length === 1;
}

function translateAnswer(answer, t) {
  return t.answers[answer] || answer;
}

function getLevelText(level, t) {
  return t.levels[level.id] || { title: level.title, subtitle: level.subtitle };
}

function getTopicText(topic, t) {
  return t.courseTopics[topic.id] || topic;
}

function getSectionTitle(section, t) {
  return t.courseSections[section.id] || section.title;
}

function getLessonPrompt(question, level, t) {
  const levelText = getLevelText(level, t);

  if (!question) return t.lesson.listenPrompt;

  if (question.type === "compare") {
    return t.lesson.comparePrompts[question.promptVariant] || t.lesson.comparePrompts.compareMajor;
  }

  if (question.type === "knowledge") {
    const concept = translateAnswer(question.conceptAnswer || question.correctAnswer, t);
    return t.lesson.knowledgePrompts[question.promptVariant](concept);
  }

  return question.promptVariant === "match" ? t.lesson.matchPrompt(levelText.title) : t.lesson.listenPrompt;
}

export default function App() {
  const [screen, setScreen] = useState(screens.home);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const [question, setQuestion] = useState(() => getRandomQuestion(levels[0]));
  const [questionHistory, setQuestionHistory] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [volume, setVolume] = useState(loadSavedVolume);
  const [language, setLanguage] = useState(getSavedLanguage);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [courseProgress, setCourseProgress] = useState(loadCourseProgress);
  const [activeCourseTopic, setActiveCourseTopic] = useState(courseTopics[0]);
  const [lessonQuestions, setLessonQuestions] = useState(() => buildLessonQuestions(courseTopics[0]));
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonCorrect, setLessonCorrect] = useState(0);
  const [lessonResult, setLessonResult] = useState(null);
  const [lessonPhase, setLessonPhase] = useState("question");
  const [lessonFeedback, setLessonFeedback] = useState(null);
  const [lessonAnswers, setLessonAnswers] = useState([]);
  const [melodyMode, setMelodyMode] = useState("repeat");
  const [melodyQuestion, setMelodyQuestion] = useState(() => createMelodyQuestion("repeat"));
  const [melodyInput, setMelodyInput] = useState([]);
  const [melodyFeedback, setMelodyFeedback] = useState(null);
  const [unlockNotice, setUnlockNotice] = useState(null);
  const [worldTransition, setWorldTransition] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introSlide, setIntroSlide] = useState(0);
  const [activeWorldId, setActiveWorldId] = useState("notes");
  const [navigationStack, setNavigationStack] = useState([]);

  const [blitzLevel, setBlitzLevel] = useState(levels[0]);
  const [blitzQuestion, setBlitzQuestion] = useState(() => getRandomQuestion(levels[0]));
  const [blitzQuestionHistory, setBlitzQuestionHistory] = useState([]);
  const [blitzPhase, setBlitzPhase] = useState("start");
  const [blitzReadyCount, setBlitzReadyCount] = useState(BLITZ_READY_COUNT);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(getBlitzTimeLimit(levels[0]));
  const [blitzResult, setBlitzResult] = useState(null);
  const [blitzQuestionNumber, setBlitzQuestionNumber] = useState(1);
  const [blitzCorrectCount, setBlitzCorrectCount] = useState(0);
  const t = translations[language];

  function stopCurrentAudio() {
    stopAllAudio();
    setAudioPlaying(false);
  }

  function completeIntro() {
    stopCurrentAudio();
    localStorage.setItem(introSeenStorageKey, "true");
    setShowIntro(false);
    setIntroSlide(0);
  }

  function replayIntro() {
    stopCurrentAudio();
    setIntroSlide(0);
    setShowIntro(true);
  }

  function getCurrentNavigationEntry() {
    return { screen, worldId: activeWorldId, topicId: activeCourseTopic?.id || null, levelId: selectedLevel?.id || null };
  }

  function pushNavigation(entry = getCurrentNavigationEntry()) {
    setNavigationStack((currentStack) => [...currentStack, entry].slice(-12));
  }

  function goBack(defaultScreen = screens.home) {
    const previous = navigationStack[navigationStack.length - 1];
    if (!previous) {
      setScreen(defaultScreen);
      return;
    }

    setNavigationStack((currentStack) => currentStack.slice(0, -1));
    if (previous.worldId) setActiveWorldId(previous.worldId);
    if (previous.topicId) {
      const previousTopic = courseTopics.find((topic) => topic.id === previous.topicId);
      if (previousTopic) setActiveCourseTopic(previousTopic);
    }
    if (previous.levelId) setSelectedLevel(getLevelById(previous.levelId));
    setScreen(previous.screen || defaultScreen);
  }

  function openWorldDetail(world, fromScreen = screen) {
    stopCurrentAudio();
    setWorldTransition({ ...world, onEnter: () => {
      pushNavigation({ screen: fromScreen, worldId: activeWorldId, topicId: null, levelId: null });
      setActiveWorldId(world.id);
      setScreen(screens.world);
    } });
  }

  function enterWorldAction(world, action) {
    stopCurrentAudio();
    setWorldTransition({ ...world, onEnter: action });
  }

  const accuracy = useMemo(() => {
    if (progress.attempts === 0) return 0;
    return Math.round((progress.correct / progress.attempts) * 100);
  }, [progress]);

  const screenMood = useMemo(() => {
    if ([screens.course, screens.topic, screens.lesson, screens.lessonResult].includes(screen)) return "course";
    if ([screens.levels, screens.training, screens.result].includes(screen)) return "training";
    if (screen === screens.blitz) return "blitz";
    if (screen === screens.melody) return "melody";
    if (screen === screens.reference) return "theory";
    if (screen === screens.progress) return "progress";
    if (screen === screens.world) return activeWorldId;
    return "journey";
  }, [screen, activeWorldId]);


  useEffect(() => {
    stopCurrentAudio();
  }, [screen]);

  useEffect(() => {
    if (!showIntro) return undefined;
    let cancelled = false;

    playIntroAmbience().catch((error) => {
      if (!cancelled) console.info("[audio] Intro ambience blocked until interaction", error);
    });

    return () => {
      cancelled = true;
      stopCurrentAudio();
    };
  }, [showIntro]);

  useEffect(() => {
    if (screen !== screens.lesson) return;
    if (lessonQuestions.length > 0 && lessonIndex >= 0 && lessonIndex < lessonQuestions.length && isValidLessonQuestion(lessonQuestions[lessonIndex])) return;

    const nextValidIndex = lessonQuestions.findIndex(isValidLessonQuestion);
    if (nextValidIndex >= 0) {
      console.warn("[lesson] Resetting to valid question index", { lessonIndex, nextValidIndex });
      setLessonIndex(nextValidIndex);
      setLessonPhase(hasGuidedLesson(activeCourseTopic) ? "intro" : "question");
      setLessonFeedback(null);
      return;
    }

    console.warn("[lesson] Rebuilding empty or invalid lesson", { topicId: activeCourseTopic.id });
    setLessonQuestions(buildLessonQuestions(activeCourseTopic, courseProgress));
    setLessonIndex(0);
    setLessonPhase("question");
    setLessonFeedback(null);
  }, [screen, lessonQuestions, lessonIndex, activeCourseTopic, courseProgress]);

  useEffect(() => {
    if (screen !== screens.blitz || blitzPhase !== "ready") return undefined;

    setBlitzReadyCount(BLITZ_READY_COUNT);
    const readyTimer = window.setInterval(() => {
      setBlitzReadyCount((currentCount) => {
        if (currentCount <= 1) {
          window.clearInterval(readyTimer);
          setBlitzPhase("question");
          return 0;
        }
        return currentCount - 1;
      });
    }, 1000);

    return () => window.clearInterval(readyTimer);
  }, [screen, blitzPhase, blitzQuestion]);

  useEffect(() => {
    if (screen === screens.blitz && blitzPhase === "ready" && blitzReadyCount > 0) {
      playCountdownBeep();
    }
  }, [screen, blitzPhase, blitzReadyCount]);

  useEffect(() => {
    if (screen !== screens.blitz || blitzPhase !== "question") return undefined;

    setBlitzTimeLeft(getBlitzTimeLimit(blitzLevel));
    const answerTimer = window.setInterval(() => {
      setBlitzTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(answerTimer);
          finishBlitzQuestion("", false, true);
          return 0;
        }
        return currentTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(answerTimer);
  }, [screen, blitzPhase, blitzLevel, blitzQuestion]);

  function startLevel(level, returnEntry = null) {
    stopCurrentAudio();
    if (returnEntry) pushNavigation(returnEntry);
    const nextQuestion = getRandomQuestion(level, [], getPracticeQuestionsForLevel(level, courseProgress));

    setSelectedLevel(level);
    setQuestion(nextQuestion);
    setQuestionHistory([nextQuestion]);
    setSelectedAnswer("");
    setLastResult(null);
    setScreen(screens.training);
  }

  function finishQuestion(answer, isCorrect, timedOut = false) {
    const nextProgress = updateProgress(progress, selectedLevel, isCorrect);

    setSelectedAnswer(answer);
    setLastResult({ isCorrect, answer, correctAnswer: question.answer, timedOut });
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setScreen(screens.result);
  }

  async function handleAudioPlayback(playAudio) {
    if (audioPlaying) return;

    setAudioPlaying(true);
    try {
      await playAudio();
    } catch (error) {
      console.error("[audio] Playback failed", error);
    } finally {
      setAudioPlaying(false);
    }
  }

  function checkAnswer(answer) {
    finishQuestion(answer, answer === question.answer);
  }

  function tryAgain() {
    stopCurrentAudio();
    const history = addQuestionToHistory(questionHistory, question);
    const nextQuestion = getRandomQuestion(selectedLevel, history, getPracticeQuestionsForLevel(selectedLevel, courseProgress));

    setQuestion(nextQuestion);
    setQuestionHistory(addQuestionToHistory(history, nextQuestion));
    setSelectedAnswer("");
    setLastResult(null);
    setScreen(screens.training);
  }

  function openTopic(topic, returnEntry = null) {
    stopCurrentAudio();
    if (returnEntry) pushNavigation(returnEntry);
    const nextCourseProgress = openCourseTopic(courseProgress, topic.id);
    setCourseProgress(nextCourseProgress);
    saveCourseProgress(nextCourseProgress);
    setActiveCourseTopic(topic);
    setScreen(screens.topic);
  }

  function startLessonPractice(topic = activeCourseTopic) {
    stopCurrentAudio();
    const nextQuestions = buildLessonQuestions(topic, courseProgress);
    console.log("[lesson] Starting lesson", { topicId: topic.id, questions: nextQuestions.length });

    setActiveCourseTopic(topic);
    setLessonQuestions(nextQuestions);
    setLessonIndex(0);
    setLessonCorrect(0);
    setLessonResult(null);
    setLessonPhase(hasGuidedLesson(topic) ? "intro" : "question");
    setLessonFeedback(null);
    setLessonAnswers([]);
    setScreen(screens.lesson);
  }

  function advanceGuidedLesson() {
    stopCurrentAudio();
    const currentIndex = guidedLessonPhases.indexOf(lessonPhase);
    const nextPhase = guidedLessonPhases[currentIndex + 1] || "question";
    setLessonPhase(nextPhase);
    setLessonFeedback(null);
  }

  async function playGuidedLessonExamples(topic = activeCourseTopic, phase = lessonPhase) {
    const examplesByPhase = {
      intro: getLessonIntroExamples(topic),
      difference: getLessonDifferenceExamples(topic),
      focus: getLessonFocusExamples(topic),
      challenge: getLessonIntroExamples(topic).slice(-1),
      summary: getLessonIntroExamples(topic).slice(0, 1)
    };
    const examples = examplesByPhase[phase] || getLessonIntroExamples(topic);

    if (!examples.length) {
      console.warn("[lesson] No guided audio examples found", { topicId: topic.id, phase });
      return;
    }

    if (topic.levelId === "intervals") {
      await playIntervalLearningExamples(examples);
      return;
    }

    await playEducationalExamples(examples, topic.levelId === "chords");
  }

  function answerLessonQuestion(answer) {
    const lessonQuestion = getSafeLessonQuestion(lessonQuestions, lessonIndex);

    if (!lessonQuestion) {
      console.warn("[lesson] Missing question during answer; restarting lesson", { lessonIndex });
      startLessonPractice(activeCourseTopic);
      return;
    }

    const isCorrect = answer === lessonQuestion.answer;
    const response = {
      promptVariant: lessonQuestion.promptVariant,
      type: lessonQuestion.type,
      conceptAnswer: lessonQuestion.conceptAnswer,
      userAnswer: answer,
      correctAnswer: lessonQuestion.answer,
      theoryAnswer: lessonQuestion.conceptAnswer || lessonQuestion.correctAnswer || lessonQuestion.answer,
      isCorrect
    };

    setLessonFeedback(response);
    setLessonAnswers((currentAnswers) => [...currentAnswers, response]);
    setLessonPhase("feedback");
  }

  function continueLesson() {
    if (lessonPhase !== "feedback" || !lessonFeedback) {
      console.warn("[lesson] Ignoring invalid transition", { lessonPhase, lessonIndex });
      setLessonPhase("question");
      return;
    }

    const nextCorrect = lessonCorrect + (lessonFeedback?.isCorrect ? 1 : 0);
    const finalAnswers = lessonAnswers.length === lessonIndex + 1 || !lessonFeedback
      ? lessonAnswers
      : [...lessonAnswers, lessonFeedback];

    if (lessonIndex + 1 >= LESSON_TOTAL_QUESTIONS || lessonIndex + 1 >= lessonQuestions.length) {
      const nextCourseProgress = recordCourseLessonResult(courseProgress, activeCourseTopic.id, nextCorrect, LESSON_TOTAL_QUESTIONS, finalAnswers);
      setLessonCorrect(nextCorrect);
      setLessonResult({ correct: nextCorrect, total: LESSON_TOTAL_QUESTIONS, passed: nextCorrect >= LESSON_PASSING_SCORE, answers: finalAnswers });
      setCourseProgress(nextCourseProgress);
      saveCourseProgress(nextCourseProgress);
      setScreen(screens.lessonResult);
      return;
    }

    setLessonCorrect(nextCorrect);
    setLessonIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= lessonQuestions.length) {
        console.warn("[lesson] Next index out of bounds", { nextIndex, questionCount: lessonQuestions.length });
        return 0;
      }
      return nextIndex;
    });
    setLessonFeedback(null);
    setLessonPhase("question");
  }


  function openMelodyMode(returnEntry = null) {
    stopCurrentAudio();
    if (returnEntry) pushNavigation(returnEntry);
    if (!isMelodyUnlocked(courseProgress)) return;

    const nextMode = melodyMode || "repeat";
    setMelodyMode(nextMode);
    setMelodyQuestion(createMelodyQuestion(nextMode));
    setMelodyInput([]);
    setMelodyFeedback(null);
    setScreen(screens.melody);
  }

  function chooseMelodyMode(nextMode) {
    stopCurrentAudio();
    setMelodyMode(nextMode);
    setMelodyQuestion(createMelodyQuestion(nextMode));
    setMelodyInput([]);
    setMelodyFeedback(null);
  }

  function nextMelodyQuestion() {
    stopCurrentAudio();
    setMelodyQuestion(createMelodyQuestion(melodyMode));
    setMelodyInput([]);
    setMelodyFeedback(null);
  }

  function addMelodyNote(note) {
    if (melodyFeedback || melodyMode !== "repeat") return;
    setMelodyInput((currentInput) => currentInput.length >= melodyQuestion.sequence.length ? currentInput : [...currentInput, note]);
  }

  function clearMelodyInput() {
    setMelodyInput([]);
    setMelodyFeedback(null);
  }

  function checkRepeatedMelody() {
    const userSequence = melodyInput.map((note) => note.degree);
    const isCorrect = melodyPatternsMatch(melodyQuestion.sequence, userSequence);
    setMelodyFeedback({ isCorrect, kind: "repeat", correctPattern: melodyQuestion.sequence, userPattern: userSequence });
  }

  function chooseMelodyOption(option) {
    if (melodyFeedback) return;
    setMelodyFeedback({ isCorrect: melodyPatternsMatch(melodyQuestion.sequence, option.sequence), kind: "choose", selectedLabel: option.label, selectedPattern: option.sequence, correctPattern: melodyQuestion.sequence, correctLabel: melodyQuestion.correctLabel });
  }

  function completeMelody(note) {
    if (melodyFeedback) return;
    setMelodyFeedback({ isCorrect: note.degree === melodyQuestion.correctDegree, kind: "complete", selectedNote: note.name, correctNote: melodyNoteButtons.find((item) => item.degree === melodyQuestion.correctDegree)?.name || "C" });
  }

  function enterBlitzMode(returnEntry = null) {
    stopCurrentAudio();
    if (returnEntry) pushNavigation(returnEntry);
    if (!isBlitzUnlocked(courseProgress)) return;

    setBlitzPhase("start");
    setBlitzResult(null);
    setBlitzReadyCount(BLITZ_READY_COUNT);
    setBlitzTimeLeft(getBlitzTimeLimit(blitzLevel));
    setScreen(screens.blitz);
  }

  function chooseBlitzLevel(level) {
    stopCurrentAudio();
    const nextQuestion = getRandomQuestion(level, [], getPracticeQuestionsForLevel(level, courseProgress, true));

    setBlitzLevel(level);
    setBlitzQuestion(nextQuestion);
    setBlitzQuestionHistory([nextQuestion]);
    setBlitzTimeLeft(getBlitzTimeLimit(level));
    setBlitzResult(null);
    setBlitzQuestionNumber(1);
    setBlitzCorrectCount(0);
  }

  function startBlitzRound() {
    stopCurrentAudio();
    const nextQuestion = getRandomQuestion(blitzLevel, [], getPracticeQuestionsForLevel(blitzLevel, courseProgress, true));

    setBlitzQuestionNumber(1);
    setBlitzCorrectCount(0);
    setBlitzQuestion(nextQuestion);
    setBlitzQuestionHistory([nextQuestion]);
    setBlitzResult(null);
    setBlitzReadyCount(BLITZ_READY_COUNT);
    setBlitzTimeLeft(getBlitzTimeLimit(blitzLevel));
    setBlitzPhase("ready");
  }

  function startBlitzQuestion(nextQuestionNumber = blitzQuestionNumber + 1) {
    stopCurrentAudio();
    const history = addQuestionToHistory(blitzQuestionHistory, blitzQuestion);
    const nextQuestion = getRandomQuestion(blitzLevel, history, getPracticeQuestionsForLevel(blitzLevel, courseProgress, true));

    setBlitzQuestionNumber(nextQuestionNumber);
    setBlitzQuestion(nextQuestion);
    setBlitzQuestionHistory(addQuestionToHistory(history, nextQuestion));
    setBlitzResult(null);
    setBlitzReadyCount(BLITZ_READY_COUNT);
    setBlitzTimeLeft(getBlitzTimeLimit(blitzLevel));
    setBlitzPhase("ready");
  }

  function finishBlitzQuestion(answer, isCorrect, timedOut = false) {
    const nextProgress = updateProgress(progress, blitzLevel, isCorrect);

    setBlitzResult({ isCorrect, answer, correctAnswer: blitzQuestion.answer, timedOut });
    setBlitzCorrectCount((currentCount) => currentCount + (isCorrect ? 1 : 0));
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setBlitzPhase("result");
  }

  function checkBlitzAnswer(answer) {
    finishBlitzQuestion(answer, answer === blitzQuestion.answer);
  }

  function nextBlitzQuestion() {
    if (blitzQuestionNumber >= BLITZ_ROUND_TOTAL) {
      const nextProgress = recordBlitzRoundResult(progress, blitzCorrectCount, BLITZ_ROUND_TOTAL);
      setProgress(nextProgress);
      saveProgress(nextProgress);
      setBlitzPhase("summary");
      return;
    }
    startBlitzQuestion(blitzQuestionNumber + 1);
  }

  function exitBlitz() {
    stopCurrentAudio();
    setBlitzPhase("start");
    setBlitzResult(null);
    goBack(screens.home);
  }

  function getBlitzAccuracy() {
    return Math.round((blitzCorrectCount / BLITZ_ROUND_TOTAL) * 100);
  }

  function playCurrentReferenceScale() {
    const scaleName = selectedLevel.id === "scales" && question.answer === "Natural minor" ? "naturalMinor" : "major";
    return playReferenceScale(scaleName);
  }

  function playCurrentBlitzReferenceScale() {
    const scaleName = blitzLevel.id === "scales" && blitzQuestion.answer === "Natural minor" ? "naturalMinor" : "major";
    return playReferenceScale(scaleName);
  }

  function handleVolumeChange(event) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setAudioVolume(nextVolume);
  }

  function changeLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    localStorage.setItem(languageStorageKey, nextLanguage);
  }

  const currentLessonQuestion = getSafeLessonQuestion(lessonQuestions, lessonIndex);
  const currentLessonNumber = Math.min(lessonIndex + 1, LESSON_TOTAL_QUESTIONS);
  const theoryUnlocked = isTheoryUnlocked(courseProgress);
  const trainingUnlocked = isTrainingUnlocked(courseProgress);
  const blitzUnlocked = isBlitzUnlocked(courseProgress);
  const melodyUnlocked = isMelodyUnlocked(courseProgress);
  const chordBasicsUnlocked = hasCompletedTopics(courseProgress, basicChordsTopicIds);
  const seventhBasicsUnlocked = courseProgress.completedTopicIds.includes("seventh-chord-basics");
  const scalesBasicsUnlocked = courseProgress.completedTopicIds.includes("major-scale") || courseProgress.completedTopicIds.includes("natural-minor");
  const advancedUnlocked = melodyUnlocked && seventhBasicsUnlocked && scalesBasicsUnlocked;
  const worldText = t.homeJourney.worlds;
  const journeySteps = getHomeJourneySteps(t, { theoryUnlocked, trainingUnlocked, blitzUnlocked, melodyUnlocked, chordBasicsUnlocked, seventhBasicsUnlocked, scalesBasicsUnlocked, advancedUnlocked }, {
    notes: () => {}, intervals: () => {}, chords: () => {}, seventhChords: () => {}, scalesModes: () => {}, tonality: () => {}, melody: () => {}, harmony: () => {}, bluesJazz: () => {}, intuition: () => {}
  }).map((world) => ({ ...world, action: () => openWorldDetail(world) }));
  const activeWorld = journeySteps.find((world) => world.id === activeWorldId) || journeySteps[0];
  const continueWorld = journeySteps.find((world) => world.unlocked && !world.completed && isWorldReady(world.id, melodyUnlocked)) || journeySteps.find((world) => world.unlocked) || journeySteps[0];

  useEffect(() => {
    const seenWorlds = JSON.parse(localStorage.getItem(seenWorldUnlocksStorageKey) || "[]");
    const nextUnlockedWorld = journeySteps.find((step) => step.unlocked && step.id !== "notes" && !seenWorlds.includes(step.id));
    if (!nextUnlockedWorld) return undefined;

    const updatedSeenWorlds = [...seenWorlds, nextUnlockedWorld.id];
    localStorage.setItem(seenWorldUnlocksStorageKey, JSON.stringify(updatedSeenWorlds));
    setUnlockNotice(nextUnlockedWorld);

    const hideTimer = window.setTimeout(() => setUnlockNotice(null), 3600);
    return () => window.clearTimeout(hideTimer);
  }, [journeySteps.map((step) => step.id + ":" + step.unlocked).join("|")]);

  return (
    <main className={`app-shell app-screen-${screen} app-mood-${screenMood}`}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="ambient-particles" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>

      <header className="top-bar">
        <button className="brand-button" onClick={() => { setNavigationStack([]); setScreen(screens.home); }}>
          <span className="brand-icon"><Headphones size={24} /></span>
          <span><strong>{t.appName}</strong><small>{t.appSubtitle}</small></span>
        </button>

        <nav className="nav-actions minimal-nav">
          {screen !== screens.home && <button onClick={() => { setNavigationStack([]); setScreen(screens.home); }}><Home size={18} />{t.labels.home}</button>}
          <LanguageSwitcher language={language} onChange={changeLanguage} label={t.languageLabel} />
        </nav>
      </header>

      {showIntro && <CinematicIntro t={t} slide={introSlide} onNext={() => setIntroSlide((current) => Math.min(current + 1, t.intro.slides.length - 1))} onSkip={completeIntro} />}
      {worldTransition && <WorldTransitionOverlay world={worldTransition} t={t} onEnter={() => { const action = worldTransition.onEnter; setWorldTransition(null); action?.(); }} onBack={() => setWorldTransition(null)} />}
      {unlockNotice && <WorldUnlockNotice notice={unlockNotice} t={t} onClose={() => setUnlockNotice(null)} />}

      {screen === screens.home && <HomeStartScreen t={t} continueWorld={continueWorld} onContinue={() => openWorldDetail(continueWorld)} onMap={() => { pushNavigation({ screen: screens.home, worldId: activeWorldId }); setScreen(screens.journeyMap); }} onProgress={() => { pushNavigation(getCurrentNavigationEntry()); setScreen(screens.progress); }} onReplayIntro={replayIntro} />}

      {screen === screens.journeyMap && <JourneyMapScreen t={t} steps={journeySteps} onOpenWorld={(world) => openWorldDetail(world, screens.journeyMap)} onHome={() => goBack(screens.home)} unlockNoticeId={unlockNotice?.id} melodyUnlocked={melodyUnlocked} />}

      {screen === screens.world && <WorldDetailScreen world={activeWorld} t={t} courseProgress={courseProgress} melodyUnlocked={melodyUnlocked} blitzUnlocked={blitzUnlocked} onBack={() => goBack(screens.journeyMap)} onHome={() => { setNavigationStack([]); setScreen(screens.home); }} onOpenTopic={(topic) => openTopic(topic, { screen: screens.world, worldId: activeWorld.id, levelId: getWorldLevelId(activeWorld.id) })} onCourse={() => enterWorldAction(activeWorld, () => { pushNavigation({ screen: screens.world, worldId: activeWorld.id, levelId: getWorldLevelId(activeWorld.id) }); setScreen(screens.course); })} onPractice={(levelId) => startLevel(getLevelById(levelId), { screen: screens.world, worldId: activeWorld.id, levelId })} onTheory={() => enterWorldAction(t.homeJourney.theoryWorld, () => { pushNavigation({ screen: screens.world, worldId: activeWorld.id }); setScreen(screens.reference); })} onBlitz={() => enterWorldAction(t.homeJourney.blitzWorld, () => enterBlitzMode({ screen: screens.world, worldId: activeWorld.id, levelId: getWorldLevelId(activeWorld.id) }))} onMelody={() => openMelodyMode({ screen: screens.world, worldId: activeWorld.id, levelId: "melody" })} />}

      {screen === screens.reference && <TheoryReferenceScreen t={t} onHome={() => goBack(screens.home)} />}

      {screen === screens.melody && (
        <MelodyScreen
          t={t}
          mode={melodyMode}
          question={melodyQuestion}
          input={melodyInput}
          feedback={melodyFeedback}
          audioPlaying={audioPlaying}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onChooseMode={chooseMelodyMode}
          onPlay={() => handleAudioPlayback(() => playMelodySequence(melodyQuestion.tones))}
          onAddNote={addMelodyNote}
          onClear={clearMelodyInput}
          onCheck={checkRepeatedMelody}
          onChooseOption={chooseMelodyOption}
          onComplete={completeMelody}
          onNext={nextMelodyQuestion}
          onHome={() => goBack(screens.home)}
        />
      )}

      {screen === screens.course && <CourseScreen courseProgress={courseProgress} t={t} onOpenTopic={(topic) => openTopic(topic, { screen: screens.course, worldId: activeWorldId })} onHome={() => goBack(screens.home)} />}
      {screen === screens.topic && <TopicScreen topic={activeCourseTopic} courseProgress={courseProgress} t={t} onBack={() => goBack(screens.course)} onStartPractice={() => startLessonPractice(activeCourseTopic)} />}
      {screen === screens.lesson && (
        <LessonErrorBoundary t={t} resetKey={activeCourseTopic.id + "-" + lessonIndex + "-" + lessonPhase} onRestart={() => startLessonPractice(activeCourseTopic)}>
          <LessonScreen
            topic={activeCourseTopic}
            question={currentLessonQuestion}
            questionNumber={currentLessonNumber}
            totalQuestions={LESSON_TOTAL_QUESTIONS}
            correctCount={lessonCorrect}
            audioPlaying={audioPlaying}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onPlay={(tones, isChordExercise, isComparison) => handleAudioPlayback(() => isComparison ? playChordComparison(tones?.[0], tones?.[1]) : playExerciseTones(tones || [], isChordExercise))}
            onReference={() => handleAudioPlayback(playCurrentReferenceScale)}
            onPlayExamples={(phase) => handleAudioPlayback(() => playGuidedLessonExamples(activeCourseTopic, phase))}
            onStartQuestions={advanceGuidedLesson}
            phase={lessonPhase}
            feedback={lessonFeedback}
            onAnswer={answerLessonQuestion}
            onNext={continueLesson}
            onRestart={() => startLessonPractice(activeCourseTopic)}
            t={t}
            onBack={() => setScreen(screens.topic)}
          />
        </LessonErrorBoundary>
      )}
      {screen === screens.lessonResult && lessonResult && <LessonResultScreen topic={activeCourseTopic} result={lessonResult} t={t} onTryAgain={() => startLessonPractice(activeCourseTopic)} onBackCourse={() => goBack(screens.course)} />}

      {screen === screens.levels && (
        <section className="page-stack">
          <PageTitle title={t.levelsPage.title} text={t.levelsPage.text} t={t} onHome={() => goBack(screens.home)} />
          <div className="level-grid">
            {levels.map((level, index) => (
              <button className="level-card" key={level.id} onClick={() => startLevel(level)} style={{ "--accent": level.color }}>
                <span className="level-number">0{index + 1}</span><h2>{getLevelText(level, t).title}</h2><p>{getLevelText(level, t).subtitle}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {screen === screens.training && (
        <section className="training-layout">
          <button className="back-button" onClick={() => goBack(screens.levels)}><ArrowLeft size={18} />{navigationStack.length ? t.homeJourney.backToMap : t.training.levelsBack}</button>
          <div className="training-card">
            <div className="training-header"><span className="training-badge">{getLevelText(selectedLevel, t).title}</span><h1>{t.training.listenTitle}</h1><p>{t.training.listenText}</p></div>
            <PlayerPanel t={t} onPlay={() => handleAudioPlayback(() => playExerciseTones(question.tones, selectedLevel.id === "chords"))} onReference={() => handleAudioPlayback(playCurrentReferenceScale)} disabled={audioPlaying} volume={volume} onVolumeChange={handleVolumeChange} />
            <p className="answer-label">{t.training.chooseAnswer}</p>
            <AnswerGrid options={question.options} t={t} onAnswer={checkAnswer} />
          </div>
        </section>
      )}

      {screen === screens.result && lastResult && (
        <section className="result-layout">
          <ResultCard result={lastResult} selectedAnswer={selectedAnswer} level={selectedLevel} t={t} onPrimary={tryAgain} primaryLabel={t.result.tryAnother} onSecondary={() => goBack(screens.levels)} secondaryLabel={navigationStack.length ? t.homeJourney.backToMap : t.result.changeLevel} />
        </section>
      )}

      {screen === screens.blitz && (
        <section className="training-layout">
          <button className="back-button" onClick={exitBlitz}><ArrowLeft size={18} />{t.blitz.exit}</button>
          <div className="training-card blitz-card">
            {blitzPhase === "start" && <BlitzStart levels={levels} blitzLevel={blitzLevel} t={t} chooseBlitzLevel={chooseBlitzLevel} getBlitzTimeLimit={getBlitzTimeLimit} startBlitzRound={startBlitzRound} />}
            {blitzPhase === "ready" && <div className="blitz-countdown-screen"><span>{t.blitz.ready}</span><strong>{blitzReadyCount}</strong></div>}
            {blitzPhase === "question" && (
              <>
                <div className="training-header blitz-question-header"><span className="training-badge">{t.blitz.round}</span><p className="blitz-progress-label">{t.blitz.progress(blitzQuestionNumber, BLITZ_ROUND_TOTAL)}</p><h1>{t.blitz.answerQuickly}</h1><p>{t.blitz.questionText}</p></div>
                <div className={`countdown-timer blitz-timer ${blitzTimeLeft <= 3 ? "urgent" : ""}`}><span>{t.blitz.time}</span><strong>{t.blitz.secondsShort(blitzTimeLeft)}</strong></div>
                <PlayerPanel t={t} onPlay={() => handleAudioPlayback(() => playExerciseTones(blitzQuestion.tones, blitzLevel.id === "chords"))} onReference={() => handleAudioPlayback(playCurrentBlitzReferenceScale)} disabled={audioPlaying} volume={volume} onVolumeChange={handleVolumeChange} />
                <p className="answer-label">{t.training.chooseAnswer}</p>
                <AnswerGrid options={blitzQuestion.options} t={t} onAnswer={checkBlitzAnswer} />
              </>
            )}
            {blitzPhase === "result" && blitzResult && <ResultCard result={blitzResult} selectedAnswer={blitzResult.answer} level={blitzLevel} t={t} onPrimary={nextBlitzQuestion} primaryLabel={t.blitz.nextQuestion} onSecondary={exitBlitz} secondaryLabel={t.blitz.exit} />}
            {blitzPhase === "summary" && <BlitzSummary correct={blitzCorrectCount} total={BLITZ_ROUND_TOTAL} accuracy={getBlitzAccuracy()} t={t} onTryAgain={startBlitzRound} onBackHome={exitBlitz} />}
          </div>
        </section>
      )}

      {screen === screens.progress && (
        <ProgressScreen
          progress={progress}
          courseProgress={courseProgress}
          accuracy={accuracy}
          t={t}
          onHome={() => setScreen(screens.home)}
          onResetProgress={() => {
            if (!window.confirm(t.progress.resetConfirm)) return;
            resetDemoProgress();
            setProgress(loadProgress());
            setCourseProgress(loadCourseProgress());
            setLessonQuestions(buildLessonQuestions(courseTopics[0]));
            setActiveCourseTopic(courseTopics[0]);
            setShowIntro(true);
            setIntroSlide(0);
            setNavigationStack([]);
            setScreen(screens.home);
          }}
        />
      )}
    </main>
  );
}






function getMelodyFeedbackText(mode, feedback, t) {
  if (!feedback) return "";

  if (mode === "choose") {
    return t.melody.feedback.choose(
      feedback.selectedLabel,
      formatMelodyPattern(feedback.selectedPattern || [], t),
      feedback.correctLabel,
      formatMelodyPattern(feedback.correctPattern || [], t)
    );
  }

  if (mode === "complete") {
    return t.melody.feedback.complete(translateAnswer(feedback.selectedNote, t), translateAnswer(feedback.correctNote, t));
  }

  return t.melody.feedback.repeat(formatMelodyPattern(feedback.userPattern || [], t), formatMelodyPattern(feedback.correctPattern || [], t));
}

function getWorldLevelId(worldId) {
  if (["notes", "intervals", "chords", "scalesModes"].includes(worldId)) {
    return worldId === "scalesModes" ? "scales" : worldId;
  }
  if (worldId === "seventhChords") return "chords";
  return null;
}

function isWorldReady(worldId, melodyUnlocked = false) {
  return ["notes", "intervals", "chords", "seventhChords", "scalesModes"].includes(worldId) || (worldId === "melody" && melodyUnlocked);
}

function getWorldTopics(worldId) {
  if (worldId === "seventhChords") {
    return courseTopics.filter((topic) => topic.id.includes("seventh"));
  }

  if (worldId === "chords") {
    return courseTopics.filter((topic) => topic.levelId === "chords" && !topic.id.includes("seventh"));
  }

  const levelId = getWorldLevelId(worldId);
  if (!levelId) return [];
  return courseTopics.filter((topic) => topic.levelId === levelId);
}

function CinematicIntro({ t, slide, onNext, onSkip }) {
  const currentSlide = t.intro.slides[slide] || t.intro.slides[0];
  const isLastSlide = slide >= t.intro.slides.length - 1;

  return (
    <div className="cinematic-intro onboarding-intro" role="dialog" aria-label={t.intro.label}>
      <div className="intro-notes" aria-hidden="true"><span>♪</span><span>♬</span><span>♩</span><span>♫</span></div>
      <div className="intro-piano-glow" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <div className="intro-wave-field" aria-hidden="true"><span /><span /><span /></div>
      <div className="onboarding-slide" key={slide}>
        <span className="training-badge">{t.intro.step(slide + 1, t.intro.slides.length)}</span>
        <h1>{currentSlide.title}</h1>
        {currentSlide.text && <p>{currentSlide.text}</p>}
        {slide === 0 && <small>{t.intro.author}</small>}
      </div>
      <div className="onboarding-dots" aria-hidden="true">
        {t.intro.slides.map((_, index) => <span className={index === slide ? "active" : ""} key={index} />)}
      </div>
      <div className="onboarding-actions">
        <button className="intro-skip" onClick={onSkip}>{t.intro.skip}</button>
        <button className="primary-button" onClick={isLastSlide ? onSkip : onNext}>{isLastSlide ? t.intro.start : t.intro.next}</button>
      </div>
    </div>
  );
}

function WorldTransitionOverlay({ world, t, onEnter, onBack }) {
  return (
    <div className={"world-transition-overlay readable-transition transition-" + (world.id || "journey")} aria-live="polite">
      <div className="transition-wave" aria-hidden="true"><span /><span /><span /></div>
      <span className="training-badge">{t.homeJourney.transitionBadge}</span>
      <h2>{world.title}</h2>
      <p>{world.story || world.description}</p>
      <div className="transition-actions">
        <button className="primary-button" onClick={onEnter}>{t.homeJourney.enterWorld}</button>
        <button className="secondary-button" onClick={onBack}>{t.homeJourney.backToMap}</button>
      </div>
    </div>
  );
}

function WorldUnlockNotice({ notice, t, onClose }) {
  const NoticeIcon = notice.icon || Music2;
  return (
    <div className="unlock-overlay" role="status" aria-live="polite" onClick={onClose}>
      <div className="unlock-modal" onClick={(event) => event.stopPropagation()}>
        <div className="unlock-sound-lines" aria-hidden="true"><span /><span /><span /></div>
        <span className="unlock-icon"><NoticeIcon size={28} /></span>
        <span className="training-badge">{t.homeJourney.unlockNotice.badge}</span>
        <h2>{t.homeJourney.unlockNotice.title}</h2>
        <strong>{notice.title}</strong>
        <p>{notice.story}</p>
        <button className="secondary-button" onClick={onClose}>{t.homeJourney.unlockNotice.continue}</button>
      </div>
    </div>
  );
}

function HomeStartScreen({ t, continueWorld, onContinue, onMap, onProgress, onReplayIntro }) {
  return (
    <section className="home-start-screen">
      <div className="home-start-visual" aria-hidden="true"><span>♪</span><span>♬</span><span>♫</span></div>
      <div className="home-start-card">
        <span className="training-badge">{t.homeJourney.badge}</span>
        <h1>{t.appName}</h1>
        <p>{t.homeJourney.startSubtitle}</p>
        <div className="home-next-world">
          <small>{t.homeJourney.nextWorld}</small>
          <strong>{continueWorld?.title}</strong>
        </div>
        <div className="home-start-actions">
          <button className="primary-button" onClick={onContinue}><Play size={20} />{t.homeJourney.continueJourney}</button>
          <button className="secondary-button" onClick={onMap}><Music2 size={18} />{t.homeJourney.openMap}</button>
        </div>
        <div className="home-mini-actions">
          <button onClick={onProgress}><BarChart3 size={16} />{t.homeJourney.actions.progress}</button>
          <button onClick={onReplayIntro}><Play size={16} />{t.intro.replay}</button>
        </div>
      </div>
    </section>
  );
}

function JourneyMapScreen({ t, steps, onOpenWorld, onHome, unlockNoticeId, melodyUnlocked }) {
  return (
    <section className="home-journey journey-map-screen">
      <button className="back-button" onClick={onHome}><ArrowLeft size={18} />{t.labels.home}</button>
      <div className="journey-section-heading map-heading">
        <span className="training-badge">{t.homeJourney.mapBadge}</span>
        <h1>{t.homeJourney.mapTitle}</h1>
        <p>{t.homeJourney.mapText}</p>
      </div>
      <div className="journey-path world-map">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const ready = isWorldReady(step.id, melodyUnlocked);
          return (
            <button className={`journey-step world-step world-${step.id} ${step.unlocked ? "unlocked" : "locked"} ${step.completed ? "completed" : ""} ${unlockNoticeId === step.id ? "newly-unlocked" : ""}`} key={step.id} onClick={() => onOpenWorld(step)} disabled={!step.unlocked}>
              <span className="journey-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="journey-icon">{step.unlocked ? <StepIcon size={24} /> : <Lock size={24} />}</span>
              <span><strong>{step.title}</strong><em>{step.description}</em></span>
              <p>{step.story}</p>
              <small>{!step.unlocked ? step.lockedText : ready ? t.homeJourney.readyWorld : t.homeJourney.previewWorld}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WorldDetailScreen({ world, t, courseProgress, melodyUnlocked, blitzUnlocked, onBack, onHome, onOpenTopic, onCourse, onPractice, onTheory, onBlitz, onMelody }) {
  const topics = getWorldTopics(world.id);
  const levelId = getWorldLevelId(world.id);
  const ready = isWorldReady(world.id, melodyUnlocked);
  const isPreview = !ready;
  const completedCount = topics.filter((topic) => courseProgress.completedTopicIds.includes(topic.id)).length;

  return (
    <section className={"world-detail-screen world-" + world.id}>
      <div className="world-detail-nav">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} />{t.homeJourney.backToMap}</button>
        <button className="secondary-button" onClick={onHome}><Home size={18} />{t.labels.home}</button>
      </div>
      <div className="world-detail-hero">
        <span className="training-badge">{isPreview ? t.homeJourney.previewWorld : t.homeJourney.readyWorld}</span>
        <h1>{world.title}</h1>
        <p>{world.story || world.description}</p>
        {topics.length > 0 && <small>{t.homeJourney.worldProgress(completedCount, topics.length)}</small>}
        {isPreview && <div className="world-preview-note"><strong>{t.homeJourney.comingLater}</strong><p>{world.lockedText}</p></div>}
      </div>
      <div className="world-action-grid">
        <button className="world-action-card" onClick={onCourse} disabled={isPreview || topics.length === 0}><BookOpen size={22} /><strong>{t.homeJourney.worldActions.lessons}</strong><span>{topics.length ? t.homeJourney.worldActions.lessonsText : t.homeJourney.worldActions.noLessons}</span></button>
        <button className="world-action-card" onClick={() => world.id === "melody" ? onMelody() : onPractice(levelId)} disabled={isPreview || (!levelId && world.id !== "melody")}><Headphones size={22} /><strong>{t.homeJourney.worldActions.practice}</strong><span>{t.homeJourney.worldActions.practiceText}</span></button>
        <button className="world-action-card" onClick={onTheory} disabled={!world.unlocked}><Library size={22} /><strong>{t.homeJourney.worldActions.theory}</strong><span>{t.homeJourney.worldActions.theoryText}</span></button>
        <button className="world-action-card" onClick={onBlitz} disabled={isPreview || !blitzUnlocked || !levelId}><Timer size={22} /><strong>{t.homeJourney.worldActions.blitz}</strong><span>{blitzUnlocked ? t.homeJourney.worldActions.blitzText : t.homeJourney.worldActions.blitzLocked}</span></button>
      </div>
      {topics.length > 0 && (
        <div className="world-topic-list">
          <h2>{t.homeJourney.relatedTopics}</h2>
          {topics.map((topic) => {
            const completed = courseProgress.completedTopicIds.includes(topic.id);
            return <button key={topic.id} onClick={() => onOpenTopic(topic)}><span>{completed ? <CheckCircle2 size={18} /> : <Music2 size={18} />}</span><strong>{getTopicText(topic, t).title}</strong><small>{getTopicText(topic, t).description}</small></button>;
          })}
        </div>
      )}
    </section>
  );
}

function MelodyScreen({ t, mode, question, input, feedback, audioPlaying, volume, onVolumeChange, onChooseMode, onPlay, onAddNote, onClear, onCheck, onChooseOption, onComplete, onNext, onHome }) {
  const canCheckRepeat = mode === "repeat" && input.length === question.sequence.length && !feedback;

  return (
    <section className="page-stack melody-screen">
      <PageTitle title={t.melody.title} text={t.melody.text} t={t} onHome={onHome} />

      <div className="melody-card training-card">
        <div className="melody-mode-tabs">
          {melodyModes.map((melodyModeOption) => (
            <button className={mode === melodyModeOption ? "active" : ""} key={melodyModeOption} onClick={() => onChooseMode(melodyModeOption)}>
              {t.melody.modes[melodyModeOption]}
            </button>
          ))}
        </div>

        <div className="training-header">
          <span className="training-badge">{t.melody.badge}</span>
          <h1>{t.melody.modeTitles[mode]}</h1>
          <p>{t.melody.instructions[mode]}</p>
        </div>

        <MelodyPlayerPanel t={t} onPlay={onPlay} disabled={audioPlaying} volume={volume} onVolumeChange={onVolumeChange} />

        {mode === "repeat" && (
          <div className="melody-practice-area">
            <div className="melody-input-display">
              {question.sequence.map((_, index) => <span key={index}>{input[index] ? translateAnswer(input[index].name, t) : "-"}</span>)}
            </div>
            <div className="melody-note-grid">
              {melodyNoteButtons.map((note) => <button className="answer-button" key={note.name} onClick={() => onAddNote(note)} disabled={Boolean(feedback)}><strong>{translateAnswer(note.name, t)}</strong></button>)}
            </div>
            <div className="result-actions"><button className="secondary-button" onClick={onClear}>{t.melody.clear}</button><button className="primary-button" onClick={onCheck} disabled={!canCheckRepeat}>{t.melody.check}</button></div>
          </div>
        )}

        {mode === "choose" && (
          <div className="melody-option-grid">
            {question.options.map((option) => <button className="answer-button" key={option.label} onClick={() => onChooseOption(option)} disabled={Boolean(feedback)}><span>{option.label}</span><strong>{formatMelodyPattern(option.sequence, t)}</strong></button>)}
          </div>
        )}

        {mode === "complete" && (
          <div className="melody-practice-area">
            <div className="melody-input-display phrase">
              {question.promptSequence.map((degree, index) => <span key={index}>{translateAnswer(melodyNoteButtons.find((note) => note.degree === degree)?.name || "C", t)}</span>)}
              <span>?</span>
            </div>
            <div className="melody-note-grid short">
              {melodyNoteButtons.map((note) => <button className="answer-button" key={note.name} onClick={() => onComplete(note)} disabled={Boolean(feedback)}><strong>{translateAnswer(note.name, t)}</strong></button>)}
            </div>
          </div>
        )}

        {feedback && (
          <div className={"lesson-feedback " + (feedback.isCorrect ? "correct" : "wrong")}>
            {feedback.isCorrect ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
            <h2>{feedback.isCorrect ? t.melody.correct : t.melody.incorrect}</h2>
            <p>{getMelodyFeedbackText(mode, feedback, t)}</p>
            <button className="primary-button" onClick={onNext}>{t.melody.next}</button>
          </div>
        )}
      </div>
    </section>
  );
}

class LessonErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[lesson] Render failed", error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="training-layout lesson-layout">
          <div className="training-card lesson-card lesson-feedback wrong">
            <XCircle size={42} />
            <h2>{this.props.t.lesson.errorTitle}</h2>
            <button className="primary-button" onClick={this.props.onRestart}>{this.props.t.lesson.restartLesson}</button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

function TheoryReferenceScreen({ t, onHome }) {
  const reference = t.reference;

  return (
    <section className="page-stack reference-screen">
      <PageTitle title={reference.title} text={reference.text} t={t} onHome={onHome} />

      <div className="reference-grid">
        <ReferenceSection title={reference.sections.intervals}>
          <div className="reference-list">
            {reference.intervals.map((item) => (
              <ReferenceCard key={item.name} title={item.name} badge={item.semitones + " " + reference.labels.semitones}>
                <ReferenceDetail label={reference.labels.description} value={item.description} />
                <ReferenceDetail label={reference.labels.sound} value={item.sound} />
                <ReferenceDetail label={reference.labels.tip} value={item.tip} />
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.chords}>
          <div className="reference-list compact">
            {reference.chords.map((item) => (
              <ReferenceCard key={item.name} title={item.name}>
                <ReferenceDetail label={reference.labels.formula} value={item.formula} />
                <ReferenceDetail label={reference.labels.sound} value={item.sound} />
                <ReferenceDetail label={reference.labels.listenFor} value={item.listenFor} />
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.seventhChords}>
          <div className="reference-note"><p>{reference.seventhChords.intro}</p><p>{reference.seventhChords.tension}</p></div>
          <div className="reference-list compact">
            {reference.seventhChords.types.map((item) => (
              <ReferenceCard key={item.name} title={item.name}>
                <ReferenceDetail label={reference.labels.formula} value={item.formula} />
                <ReferenceDetail label={reference.labels.sound} value={item.sound} />
                <ReferenceDetail label={reference.labels.listenFor} value={item.listenFor} />
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.scales}>
          <div className="reference-list">
            {reference.scales.map((item) => (
              <ReferenceCard key={item.name} title={item.name}>
                <ReferenceDetail label={reference.labels.structure} value={item.structure} />
                <ReferenceDetail label={reference.labels.character} value={item.character} />
                <ReferenceDetail label={reference.labels.unique} value={item.unique} />
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.tension}>
          <div className="reference-list compact">
            {reference.tension.map((item) => (
              <ReferenceCard key={item.title} title={item.title}>
                <p>{item.text}</p>
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.melody}>
          <div className="reference-list compact">
            {reference.melody.map((item) => (
              <ReferenceCard key={item.title} title={item.title}>
                <p>{item.text}</p>
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>

        <ReferenceSection title={reference.sections.songHarmony}>
          <div className="reference-list compact">
            {reference.songHarmony.map((item) => (
              <ReferenceCard key={item.title} title={item.title}>
                <p>{item.text}</p>
              </ReferenceCard>
            ))}
          </div>
        </ReferenceSection>
      </div>
    </section>
  );
}

function ReferenceSection({ title, children }) {
  return <section className="reference-section"><h2>{title}</h2>{children}</section>;
}

function ReferenceCard({ title, badge, children }) {
  return <article className="reference-card"><div className="reference-card-title"><h3>{title}</h3>{badge && <span>{badge}</span>}</div>{children}</article>;
}

function ReferenceDetail({ label, value }) {
  return <p><strong>{label}</strong>{value}</p>;
}

function ProgressScreen({ progress, courseProgress, accuracy, t, onHome, onResetProgress }) {
  const totalTopics = courseTopics.length;
  const completedTopics = courseProgress.completedTopicIds.length;
  const coursePercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const needsPracticeTopics = courseTopics.filter((topic) => getTopicStatus(topic, courseProgress) === "attempted");
  const blitzStats = progress.blitzStats || {};

  return (
    <section className="page-stack progress-dashboard">
      <PageTitle title={t.progress.title} text={t.progress.text} t={t} onHome={onHome} />

      <div className="dashboard-grid simplified-dashboard">
        <ProgressPanel title={t.progress.courseTitle}>
          <StatCard label={t.progress.completedTopics} value={completedTopics + " / " + totalTopics} />
          <ProgressBar value={coursePercent} label={t.progress.coursePercent} />
          <div className="needs-practice-list">
            <strong>{t.progress.needsPracticeTopics}</strong>
            {needsPracticeTopics.length > 0 ? (
              needsPracticeTopics.map((topic) => <span key={topic.id}>{getTopicText(topic, t).title}</span>)
            ) : (
              <span>{t.progress.noNeedsPractice}</span>
            )}
          </div>
        </ProgressPanel>

        <ProgressPanel title={t.progress.practiceTitle}>
          <StatCard label={t.progress.accuracy} value={accuracy + "%"} />
          <ProgressBar value={accuracy} label={t.progress.accuracy} />
        </ProgressPanel>

        <ProgressPanel title={t.progress.blitzTitle}>
          <div className="dashboard-stats two">
            <StatCard label={t.progress.bestBlitz} value={(blitzStats.bestCorrect || 0) + " / " + BLITZ_ROUND_TOTAL} />
            <StatCard label={t.progress.lastBlitz} value={(blitzStats.lastTotal ? blitzStats.lastCorrect : 0) + " / " + (blitzStats.lastTotal || BLITZ_ROUND_TOTAL)} />
          </div>
        </ProgressPanel>
      </div>
      <button className="reset-demo-button" onClick={onResetProgress}>{t.progress.resetDemo}</button>
    </section>
  );
}

function ProgressPanel({ title, children }) {
  return <section className="dashboard-panel"><h2>{title}</h2>{children}</section>;
}

function ProgressBar({ value, label }) {
  return <div className="dashboard-progress" aria-label={label}><span style={{ width: Math.min(100, Math.max(0, value)) + "%" }} /></div>;
}

function getTopicStatus(topic, courseProgress) {
  if (courseProgress.completedTopicIds.includes(topic.id)) return "completed";
  const stats = courseProgress.lessonStats?.[topic.id];
  if (stats && !stats.passed) return "attempted";
  const topicIndex = courseTopics.findIndex((item) => item.id === topic.id);
  const previousTopic = courseTopics[topicIndex - 1];
  if (!previousTopic || courseProgress.completedTopicIds.includes(previousTopic.id)) return "available";
  return "locked";
}

function getTopicStatusLabel(status, t) {
  return t.course.status[status] || status;
}

function getTopicProgressWidth(status) {
  if (status === "completed") return "100%";
  if (status === "attempted") return "65%";
  if (status === "available") return "40%";
  return "0%";
}

function CourseScreen({ courseProgress, t, onOpenTopic, onHome }) {
  const completedCount = courseProgress.completedTopicIds.length;
  const totalTopics = courseTopics.length;

  return (
    <section className="page-stack course-layout course-map-layout">
      <PageTitle title={t.course.title} text={t.course.progressText(completedCount, totalTopics)} t={t} onHome={onHome} />
      <div className="course-progress-bar" aria-hidden="true"><span style={{ width: Math.round((completedCount / totalTopics) * 100) + "%" }} /></div>
      <div className="course-map">
        {courseSections.map((section) => (
          <section className="course-section" key={section.id}>
            <h2>{getSectionTitle(section, t)}</h2>
            <div className="topic-list map-list">
              {section.topics.map((topic, index) => {
                const fullTopic = { ...topic, sectionId: section.id, sectionTitle: section.title, levelId: section.levelId };
                const topicText = getTopicText(fullTopic, t);
                const status = getTopicStatus(fullTopic, courseProgress);
                return (
                  <button className={"topic-card map-topic " + status} key={topic.id} onClick={() => status !== "locked" && onOpenTopic(fullTopic)}>
                    <span className="map-step">{index + 1}</span>
                    <div><strong>{topicText.title}</strong><p>{topicText.description}</p></div>
                    <span className="topic-status">{status === "completed" && <CheckCircle2 size={18} />}{status === "attempted" && <Timer size={18} />}{status === "locked" && <Lock size={18} />}{getTopicStatusLabel(status, t)}</span>
                    <div className="topic-progress" aria-hidden="true"><span style={{ width: getTopicProgressWidth(status) }} /></div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function TopicScreen({ topic, courseProgress, t, onBack, onStartPractice }) {
  const status = getTopicStatus(topic, courseProgress);
  const stats = courseProgress.lessonStats?.[topic.id];
  const topicText = getTopicText(topic, t);

  return (
    <section className="training-layout topic-screen">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} />{t.course.backToCourse}</button>
      <div className="training-card topic-detail-card">
        <div className="training-header"><span className={"topic-status large " + status}>{getTopicStatusLabel(status, t)}</span><h1>{topicText.title}</h1><p>{topicText.description}</p></div>
        {stats && <div className="lesson-last-score"><strong>{t.course.lastLesson}</strong><span>{stats.correct}/{stats.total} {t.course.correctShort} · {stats.accuracy}%</span></div>}
        <div className="topic-theory-grid">
          <TheoryLine label={t.course.theory} text={topicText.explanation} />
          <TheoryLine label={t.course.listenFor} text={topicText.listenFor} />
          <TheoryLine label={t.course.tip} text={topicText.tip} />
        </div>
        <div className="result-actions"><button className="primary-button" disabled={status === "locked"} onClick={onStartPractice}>{t.course.startPractice}</button><button className="secondary-button" onClick={onBack}>{t.course.backToCourse}</button></div>
      </div>
    </section>
  );
}

function LessonScreen({ topic, question, questionNumber, totalQuestions, correctCount, phase, feedback, audioPlaying, volume, onVolumeChange, onPlay, onReference, onPlayExamples, onStartQuestions, onAnswer, onNext, onRestart, onBack, t }) {
  const isFeedback = phase === "feedback" && feedback;
  const level = getLevelById(topic.levelId);
  const topicText = getTopicText(topic, t);

  const safeOptions = getDisplayUniqueOptions(question?.options || [], t, question?.answer);
  const guidedExamples = getGuidedLessonExamplesForPhase(topic, phase);

  if (["intro", "difference", "focus", "challenge", "summary"].includes(phase)) {
    const flow = getGuidedLessonText(topic, phase, t);
    return (
      <section className="training-layout lesson-layout">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} />{t.lesson.backToTopic}</button>
        <div className="training-card lesson-card">
          <div className="training-header"><span className="training-badge">{flow.badge}</span><h1>{flow.title}</h1><p>{flow.text}</p></div>
          <PlayerPanel t={t} onPlay={() => onPlayExamples(phase)} disabled={audioPlaying} volume={volume} onVolumeChange={onVolumeChange} />
          <div className="topic-theory-grid">
            <TheoryLine label={flow.examplesLabel} text={guidedExamples.map((example) => translateAnswer(example.answer, t)).join(" · ")} />
            <TheoryLine label={flow.focusLabel} text={flow.focus} />
            {phase === "summary" && <TheoryLine label={t.course.tip} text={topicText.tip} />}
          </div>
          <button className="primary-button" onClick={onStartQuestions} disabled={audioPlaying}>{phase === "summary" ? t.lesson.startQuestions : t.lesson.continueLesson}</button>
        </div>
      </section>
    );
  }

  if (!isValidLessonQuestion(question) || safeOptions.length < getMinimumLessonOptionCount(question)) {
    console.warn("[lesson] Rendering fallback for invalid question", question);
    return (
      <section className="training-layout lesson-layout">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} />{t.lesson.backToTopic}</button>
        <div className="training-card lesson-card lesson-feedback wrong">
          <XCircle size={42} />
          <h2>{t.lesson.errorTitle}</h2>
          <button className="primary-button" onClick={onRestart}>{t.lesson.restartLesson}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="training-layout lesson-layout">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} />{t.lesson.backToTopic}</button>
      <div className="training-card lesson-card">
        <div className="training-header"><span className="training-badge">{t.lesson.badge}</span><p className="blitz-progress-label">{t.lesson.progress(questionNumber, totalQuestions, correctCount)}</p><h1>{topicText.title}</h1><p>{getLessonPrompt(question, level, t)}</p></div>
        {(question.tones || question.chordPair) && <PlayerPanel t={t} onPlay={() => question.type === "compare" ? onPlay(question.chordPair, true, true) : onPlay(question.tones, level.id === "chords")} onReference={onReference} disabled={audioPlaying || isFeedback} volume={volume} onVolumeChange={onVolumeChange} />}

        {isFeedback ? (
          <div className={"lesson-feedback " + (feedback.isCorrect ? "correct" : "wrong")}>
            {feedback.isCorrect ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
            <h2>{getLessonFeedbackTitle(feedback, level, t)}</h2>
            <p>{t.lesson.yourAnswer}: <strong>{translateAnswer(feedback.userAnswer, t)}</strong></p>
            {!feedback.isCorrect && <p>{t.lesson.correctAnswer}: <strong>{translateAnswer(feedback.correctAnswer, t)}</strong></p>}
            <p>{getLessonMicroFeedback(feedback, level, t)}</p>
            <p>{getLessonExplanation(level, feedback.theoryAnswer || feedback.correctAnswer, t)}</p>
            <button className="primary-button" onClick={onNext}>{questionNumber >= totalQuestions ? t.lesson.showResult : t.lesson.nextQuestion}</button>
          </div>
        ) : (
          <>
            <p className="answer-label">{t.training.chooseAnswer}</p>
            <AnswerGrid options={safeOptions} t={t} onAnswer={onAnswer} />
          </>
        )}
      </div>
    </section>
  );
}

function LessonResultScreen({ topic, result, t, onTryAgain, onBackCourse }) {
  const accuracy = Math.round((result.correct / result.total) * 100);
  const topicText = getTopicText(topic, t);
  const level = getLevelById(topic.levelId);

  return (
    <section className="result-layout lesson-result-layout">
      <div className={"result-card " + (result.passed ? "correct" : "wrong")}>
        {result.passed ? <CheckCircle2 size={54} /> : <XCircle size={54} />}
        <h1>{result.passed ? t.lesson.completed : t.lesson.needsPractice}</h1>
        <p>{topicText.title}</p>
        <div className="summary-grid"><StatCard label={t.blitz.correct} value={result.correct} /><StatCard label={t.lesson.total} value={result.total} /><StatCard label={t.progress.accuracy} value={accuracy + "%"} /></div>
        <div className="theory-box"><h2>{result.passed ? t.lesson.niceWork : t.lesson.almostThere}</h2><p>{result.passed ? t.lesson.passedText : t.lesson.retryText}</p></div>
        <div className="lesson-review">
          <h2>{t.lesson.review}</h2>
          {result.answers.map((answer, index) => (
            <div className={"review-row " + (answer.isCorrect ? "correct" : "wrong")} key={index}>
              <span>{index + 1}</span>
              <div><strong>{getLessonPrompt({ type: answer.type, promptVariant: answer.promptVariant, conceptAnswer: answer.conceptAnswer, correctAnswer: answer.theoryAnswer || answer.correctAnswer }, level, t)}</strong><p>{t.lesson.yourAnswer}: {translateAnswer(answer.userAnswer, t)}</p><p>{t.lesson.correctAnswer}: {translateAnswer(answer.correctAnswer, t)}</p></div>
              <em>{answer.isCorrect ? t.lesson.correct : t.lesson.incorrect}</em>
            </div>
          ))}
        </div>
        <div className="result-actions"><button className="primary-button" onClick={onTryAgain}>{t.lesson.tryAgain}</button><button className="secondary-button" onClick={onBackCourse}>{t.course.backToCourse}</button></div>
      </div>
    </section>
  );
}

function BlitzStart({ levels, blitzLevel, t, chooseBlitzLevel, getBlitzTimeLimit, startBlitzRound }) {
  return <><div className="training-header"><span className="training-badge">{t.blitz.startBadge}</span><h1>{t.blitz.title}</h1><p>{t.blitz.description}</p></div><div className="blitz-level-grid">{levels.map((level) => <button className={"blitz-level-button " + (blitzLevel.id === level.id ? "active" : "")} key={level.id} onClick={() => chooseBlitzLevel(level)}><strong>{getLevelText(level, t).title}</strong><span>{t.blitz.secondsEach(getBlitzTimeLimit(level))}</span></button>)}</div><button className="primary-button" onClick={startBlitzRound}><Timer size={20} />{t.blitz.start}</button></>;
}

function BlitzSummary({ correct, total, accuracy, t, onTryAgain, onBackHome }) {
  return <div className="blitz-summary"><span className="training-badge">{t.blitz.summaryBadge}</span><h1>{t.blitz.roundComplete}</h1><div className="summary-grid"><StatCard label={t.blitz.correct} value={correct} /><StatCard label={t.blitz.total} value={total} /><StatCard label={t.progress.accuracy} value={accuracy + "%"} /></div><div className="result-actions"><button className="primary-button" onClick={onTryAgain}>{t.blitz.tryAgain}</button><button className="secondary-button" onClick={onBackHome}>{t.blitz.backHome}</button></div></div>;
}


function MelodyPlayerPanel({ t, onPlay, disabled, volume, onVolumeChange }) {
  return <div className="player-panel melody-player-panel"><div className="wave-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div><button className="play-button" onClick={onPlay} disabled={disabled}><Play size={40} fill="currentColor" />{t.training.playSound}</button><label className="volume-control"><span>{t.training.volume}</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange} aria-label={t.training.volume} /><strong>{Math.round(volume * 100)}%</strong></label></div>;
}

function PlayerPanel({ t, onPlay, onReference, disabled, volume, onVolumeChange }) {
  return <div className="player-panel"><div className="wave-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div><button className="play-button" onClick={onPlay} disabled={disabled}><Play size={40} fill="currentColor" />{t.training.playSound}</button><button className="reference-button" onClick={onReference} disabled={disabled}><Music2 size={20} />{t.training.playReference}</button><label className="volume-control"><span>{t.training.volume}</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolumeChange} aria-label={t.training.volume} /><strong>{Math.round(volume * 100)}%</strong></label></div>;
}

function AnswerGrid({ options, t, onAnswer }) {
  const safeOptions = getDisplayUniqueOptions(options, t);
  return <div className="answer-grid">{safeOptions.map((option, index) => <button className="answer-button" key={option} onClick={() => onAnswer(option)}><span>{String.fromCharCode(65 + index)}</span><strong>{translateAnswer(option, t)}</strong></button>)}</div>;
}

function ResultCard({ result, selectedAnswer, level, t, onPrimary, primaryLabel, onSecondary, secondaryLabel }) {
  const correctTheory = getTheory(level, result.correctAnswer, t);
  return <div className={"result-card " + (result.isCorrect ? "correct" : "wrong")}>{result.isCorrect ? <CheckCircle2 size={54} /> : <XCircle size={54} />}<h1>{result.timedOut ? t.result.timedOut : result.isCorrect ? t.result.correct : t.result.wrong}</h1>{result.timedOut ? <p>{t.result.noAnswer}</p> : <p>{t.result.yourAnswer}: <strong>{translateAnswer(selectedAnswer, t)}</strong></p>}{!result.isCorrect && <p>{t.result.correctAnswer}: <strong>{translateAnswer(result.correctAnswer, t)}</strong></p>}<div className="theory-box"><h2>{t.result.why} {translateAnswer(result.correctAnswer, t)}</h2><TheoryLine label={t.result.whatItIs} text={correctTheory.definition} /><TheoryLine label={t.result.howItSounds} text={correctTheory.sound} /><TheoryLine label={t.result.earTip} text={correctTheory.tip} />{!result.isCorrect && !result.timedOut && <div className="comparison-box"><strong>{t.result.comparison}</strong><p>{getComparison(level, selectedAnswer, result.correctAnswer, t)}</p></div>}</div><div className="result-actions"><button className="primary-button" onClick={onPrimary}>{primaryLabel}</button><button className="secondary-button" onClick={onSecondary}>{secondaryLabel}</button></div></div>;
}

function PageTitle({ title, text, t, onHome }) {
  return <div className="page-title"><button className="icon-button" onClick={onHome} aria-label={t.labels.home}><Home size={20} /></button><div><h1>{title}</h1><p>{text}</p></div></div>;
}

function LanguageSwitcher({ language, label, onChange }) {
  return <div className="language-switcher" aria-label={label}><button className={language === "ua" ? "active" : ""} onClick={() => onChange("ua")}>UA</button><button className={language === "en" ? "active" : ""} onClick={() => onChange("en")}>EN</button></div>;
}

function TheoryLine({ label, text }) {
  return <div className="theory-line"><strong>{label}</strong><p>{text}</p></div>;
}

function StatCard({ label, value }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div>;
}
