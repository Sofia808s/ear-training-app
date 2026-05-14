let audioContext;
let masterGain;
let safetyLimiter;
let audioBusy = false;
let playbackVersion = 0;
const pendingWaits = new Set();

const VOLUME_STORAGE_KEY = "ear-training-volume";
const DEFAULT_VOLUME = 0.85;
let currentVolume = loadSavedVolume();

export function loadSavedVolume() {
  const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
  const parsedVolume = savedVolume ? Number(savedVolume) : DEFAULT_VOLUME;

  if (Number.isNaN(parsedVolume)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, parsedVolume));
}

export function setAudioVolume(volume) {
  currentVolume = Math.min(1, Math.max(0, Number(volume)));
  localStorage.setItem(VOLUME_STORAGE_KEY, String(currentVolume));

  if (masterGain) {
    masterGain.gain.setTargetAtTime(currentVolume, audioContext.currentTime, 0.02);
  }
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    safetyLimiter = audioContext.createDynamicsCompressor();

    masterGain.gain.value = currentVolume;
    safetyLimiter.threshold.value = -8;
    safetyLimiter.knee.value = 8;
    safetyLimiter.ratio.value = 10;
    safetyLimiter.attack.value = 0.003;
    safetyLimiter.release.value = 0.18;

    masterGain.connect(safetyLimiter);
    safetyLimiter.connect(audioContext.destination);
  }
  return audioContext;
}

function wait(seconds) {
  return new Promise((resolve) => {
    const waitHandle = { timeoutId: 0, resolve: null };
    waitHandle.resolve = () => {
      pendingWaits.delete(waitHandle);
      resolve();
    };
    waitHandle.timeoutId = window.setTimeout(waitHandle.resolve, seconds * 1000);
    pendingWaits.add(waitHandle);
  });
}

export function getAudioPlaybackVersion() {
  return playbackVersion;
}

export function stopAllAudio() {
  pendingWaits.forEach((waitHandle) => {
    window.clearTimeout(waitHandle.timeoutId);
    waitHandle.resolve();
  });
  pendingWaits.clear();
  audioBusy = false;
  playbackVersion += 1;

  if (audioContext) {
    const contextToClose = audioContext;
    audioContext = undefined;
    masterGain = undefined;
    safetyLimiter = undefined;

    if (contextToClose.state !== "closed") {
      contextToClose.close().catch((error) => {
        console.error("[audio] Failed to stop audio context", error);
      });
    }
  }
}

async function runExclusivePlayback(totalDuration, schedulePlayback) {
  if (audioBusy) return false;

  audioBusy = true;
  const playbackId = playbackVersion;

  try {
    const context = await prepareAudioContext();
    if (playbackId !== playbackVersion || context.state === "closed") return false;

    const startTime = context.currentTime + 0.05;
    schedulePlayback(context, startTime);
    await wait(totalDuration + 0.12);
    return true;
  } finally {
    audioBusy = false;
  }
}

function playTone(context, frequency, startTime, duration) {
  const toneGain = context.createGain();
  const filter = context.createBiquadFilter();
  const partials = [
    { ratio: 1, gain: 0.66, type: "triangle" },
    { ratio: 2, gain: 0.24, type: "sine" },
    { ratio: 3, gain: 0.1, type: "sine" },
    { ratio: 4, gain: 0.035, type: "sine" }
  ];

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3200, startTime);
  filter.frequency.exponentialRampToValueAtTime(1450, startTime + duration);
  filter.Q.value = 0.55;

  toneGain.gain.setValueAtTime(0.0001, startTime);
  toneGain.gain.exponentialRampToValueAtTime(0.78, startTime + 0.04);
  toneGain.gain.exponentialRampToValueAtTime(0.34, startTime + 0.22);
  toneGain.gain.setValueAtTime(0.34, startTime + Math.max(0.22, duration - 0.22));
  toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.08);

  partials.forEach((partial) => {
    const oscillator = context.createOscillator();
    const partialGain = context.createGain();

    oscillator.type = partial.type;
    oscillator.frequency.setValueAtTime(frequency * partial.ratio, startTime);
    partialGain.gain.setValueAtTime(partial.gain, startTime);

    oscillator.connect(partialGain);
    partialGain.connect(filter);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.16);
  });

  filter.connect(toneGain);
  toneGain.connect(masterGain);
}

function playBeepTone(context, startTime) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.18);
}

function playSoftUiTone(context, startTime, frequency = 660, gainPeak = 0.04) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.24);
}

function playRhythmClickTone(context, startTime) {
  const oscillator = context.createOscillator();
  const noise = context.createBufferSource();
  const clickGain = context.createGain();
  const toneGain = context.createGain();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.045), context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1120, startTime);
  toneGain.gain.setValueAtTime(0.0001, startTime);
  toneGain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.006);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

  noise.buffer = buffer;
  clickGain.gain.setValueAtTime(0.0001, startTime);
  clickGain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.004);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.055);

  oscillator.connect(toneGain);
  noise.connect(clickGain);
  toneGain.connect(masterGain);
  clickGain.connect(masterGain);
  oscillator.start(startTime);
  noise.start(startTime);
  oscillator.stop(startTime + 0.11);
  noise.stop(startTime + 0.06);
}

export async function playUiClickSound() {
  return runExclusivePlayback(0.18, (context, startTime) => {
    playSoftUiTone(context, startTime, 620, 0.025);
  });
}

export async function playUnlockSound() {
  return runExclusivePlayback(0.5, (context, startTime) => {
    playSoftUiTone(context, startTime, 523.25, 0.03);
    playSoftUiTone(context, startTime + 0.12, 659.25, 0.03);
    playSoftUiTone(context, startTime + 0.24, 783.99, 0.026);
  });
}

const referenceScales = {
  major: [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25],
  naturalMinor: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440]
};

async function prepareAudioContext() {
  const context = getAudioContext();

  if (context.state === "suspended") {
    await context.resume();
  }

  return context;
}

export async function playCountdownBeep() {
  return runExclusivePlayback(0.22, (context, startTime) => {
    playBeepTone(context, startTime);
  });
}

export async function playReferenceScale(scaleName = "major") {
  const scale = referenceScales[scaleName] || referenceScales.major;
  const noteSpacing = 0.42;
  const noteDuration = 0.34;
  const totalDuration = (scale.length - 1) * noteSpacing + noteDuration + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    scale.forEach((tone, index) => {
      playTone(context, tone, startTime + index * noteSpacing, noteDuration);
    });
  });
}

function playHarmonicThenMelodic(context, tones, startTime, settings = {}) {
  const sortedTones = [...tones].filter((tone) => Number.isFinite(tone)).sort((a, b) => a - b);
  const harmonicDuration = settings.harmonicDuration ?? 1.05;
  const pauseAfterHarmonic = settings.pauseAfterHarmonic ?? 0.45;
  const melodicSpacing = settings.melodicSpacing ?? 0.62;
  const melodicDuration = settings.melodicDuration ?? 0.48;

  sortedTones.forEach((tone) => {
    playTone(context, tone, startTime, harmonicDuration);
  });

  const melodicStart = startTime + harmonicDuration + pauseAfterHarmonic;
  sortedTones.forEach((tone, index) => {
    playTone(context, tone, melodicStart + index * melodicSpacing, melodicDuration);
  });
}

function getHarmonicThenMelodicDuration(tones, settings = {}) {
  const noteCount = Math.max(1, tones.length);
  const harmonicDuration = settings.harmonicDuration ?? 1.05;
  const pauseAfterHarmonic = settings.pauseAfterHarmonic ?? 0.45;
  const melodicSpacing = settings.melodicSpacing ?? 0.62;
  const melodicDuration = settings.melodicDuration ?? 0.48;

  return harmonicDuration + pauseAfterHarmonic + Math.max(0, noteCount - 1) * melodicSpacing + melodicDuration + 0.08;
}

function playChordExercise(context, tones, startTime) {
  const sortedTones = [...tones].sort((a, b) => a - b);
  const harmonicDuration = 1.38;
  const pauseAfterChord = 0.5;
  const arpeggioSpacing = 0.54;
  const arpeggioDuration = 0.46;

  sortedTones.forEach((tone) => {
    playTone(context, tone, startTime, harmonicDuration);
  });

  const arpeggioStart = startTime + harmonicDuration + pauseAfterChord;

  sortedTones.forEach((tone, index) => {
    playTone(context, tone, arpeggioStart + index * arpeggioSpacing, arpeggioDuration);
  });
}

export async function playChordComparison(firstChord, secondChord) {
  const chordDuration = 1.38 + 0.5 + Math.max(0, firstChord.length - 1) * 0.54 + 0.46;
  const secondChordOffset = chordDuration + 0.7;
  const totalDuration = secondChordOffset + 1.38 + 0.5 + Math.max(0, secondChord.length - 1) * 0.54 + 0.46 + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    playChordExercise(context, firstChord, startTime);
    playChordExercise(context, secondChord, startTime + secondChordOffset);
  });
}

export async function playEducationalExamples(examples, forceChordPlayback = false) {
  const safeExamples = Array.isArray(examples)
    ? examples.map((example) => Array.isArray(example?.tones) ? example.tones.filter((tone) => Number.isFinite(tone)) : []).filter((tones) => tones.length >= 1)
    : [];

  if (safeExamples.length === 0) return false;

  const settings = { harmonicDuration: 1.45, pauseAfterHarmonic: 0.78, melodicSpacing: forceChordPlayback ? 0.72 : 0.9, melodicDuration: forceChordPlayback ? 0.56 : 0.66 };
  const exampleGap = 1.15;
  const getMelodicScaleDuration = (tones) => Math.max(0, tones.length - 1) * 0.52 + 0.42 + 0.08;
  const getExampleDuration = (tones) => {
    if (tones.length === 1) return 1.06;
    if (!forceChordPlayback && tones.length > 3) return getMelodicScaleDuration(tones);
    return getHarmonicThenMelodicDuration(tones, settings);
  };
  const totalDuration = safeExamples.reduce((sum, tones) => sum + getExampleDuration(tones), 0) + Math.max(0, safeExamples.length - 1) * exampleGap;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    let offset = 0;

    safeExamples.forEach((tones) => {
      if (tones.length === 1) {
        playTone(context, tones[0], startTime + offset, 0.92);
      } else if (!forceChordPlayback && tones.length > 3) {
        tones.forEach((tone, index) => {
          playTone(context, tone, startTime + offset + index * 0.52, 0.42);
        });
      } else {
        playHarmonicThenMelodic(context, tones, startTime + offset, settings);
      }
      offset += getExampleDuration(tones) + exampleGap;
    });
  });
}

export async function playIntervalLearningExamples(examples) {
  const safeExamples = Array.isArray(examples)
    ? examples.map((example) => Array.isArray(example?.tones) ? example.tones.filter((tone) => Number.isFinite(tone)) : []).filter((tones) => tones.length >= 2)
    : [];

  if (safeExamples.length === 0) return false;

  const melodicSpacing = 1.18;
  const melodicDuration = 0.78;
  const pauseBeforeHarmonic = 0.78;
  const harmonicDuration = 1.45;
  const exampleGap = 1.15;
  const singleExampleDuration = melodicSpacing + melodicDuration + pauseBeforeHarmonic + harmonicDuration;
  const totalDuration = safeExamples.length * singleExampleDuration + Math.max(0, safeExamples.length - 1) * exampleGap + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    let offset = 0;

    safeExamples.forEach((tones) => {
      const lower = tones[0];
      const upper = tones[1];
      const harmonicStart = startTime + offset;
      playTone(context, lower, harmonicStart, harmonicDuration);
      playTone(context, upper, harmonicStart, harmonicDuration);

      const melodicStart = harmonicStart + harmonicDuration + pauseBeforeHarmonic;
      playTone(context, lower, melodicStart, melodicDuration);
      playTone(context, upper, melodicStart + melodicSpacing, melodicDuration);
      offset += singleExampleDuration + exampleGap;
    });
  });
}

export async function playExerciseTones(tones, forceChordPlayback = false) {
  const isSingleNote = tones.length === 1;
  const isInterval = tones.length === 2;
  const isChord = forceChordPlayback || tones.length === 3;
  const isScale = tones.length > 3;

  if (isSingleNote) {
    return runExclusivePlayback(0.66, (context, startTime) => {
      playTone(context, tones[0], startTime, 0.58);
    });
  }

  if (isInterval) {
    const settings = { harmonicDuration: 1.0, pauseAfterHarmonic: 0.5, melodicSpacing: 0.74, melodicDuration: 0.52 };
    const totalDuration = getHarmonicThenMelodicDuration(tones, settings);

    return runExclusivePlayback(totalDuration, (context, startTime) => {
      playHarmonicThenMelodic(context, tones, startTime, settings);
    });
  }

  if (isChord) {
    const totalDuration = 1.38 + 0.5 + Math.max(0, tones.length - 1) * 0.54 + 0.46 + 0.08;
    return runExclusivePlayback(totalDuration, (context, startTime) => {
      playChordExercise(context, tones, startTime);
    });
  }

  const spacing = isScale ? 0.36 : 0.68;
  const duration = isScale ? 0.32 : 0.58;
  const totalDuration = (tones.length - 1) * spacing + duration + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    tones.forEach((tone, index) => {
      playTone(context, tone, startTime + index * spacing, duration);
    });
  });
}


export async function playIntroAmbience(durationSeconds = 9.6) {
  if (audioBusy) return false;

  const progression = [
    [130.81, 196, 261.63, 329.63],
    [146.83, 220, 293.66, 349.23],
    [164.81, 246.94, 329.63, 392],
    [196, 261.63, 329.63, 392]
  ];
  const playbackId = playbackVersion;
  const chordGap = durationSeconds / progression.length;
  const chordDuration = Math.max(1.8, chordGap + 0.5);
  const context = await prepareAudioContext();
  if (playbackId !== playbackVersion || context.state === "closed") return false;

  audioBusy = true;
  const startTime = context.currentTime + 0.05;
  masterGain.gain.cancelScheduledValues(startTime);
  masterGain.gain.setValueAtTime(0.0001, startTime);
  masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, currentVolume), startTime + 1.1);
  masterGain.gain.setValueAtTime(Math.max(0.0001, currentVolume), startTime + Math.max(1.2, durationSeconds - 1.25));
  masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

  progression.forEach((chord, chordIndex) => {
    chord.forEach((tone, toneIndex) => {
      playTone(context, tone, startTime + chordIndex * chordGap + toneIndex * 0.12, chordDuration);
    });
  });

  window.setTimeout(() => {
    if (playbackId === playbackVersion) audioBusy = false;
  }, durationSeconds * 1000 + 160);

  return true;
}

export async function playPianoAmbience() {
  const gentleChords = [
    [261.63, 329.63, 392],
    [220, 261.63, 329.63],
    [196, 246.94, 293.66, 369.99],
    [174.61, 220, 261.63]
  ];
  const chordGap = 1.35;
  const chordDuration = 1.18;
  const totalDuration = gentleChords.length * chordGap + chordDuration;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    gentleChords.forEach((chord, chordIndex) => {
      chord.forEach((tone, toneIndex) => {
        playTone(context, tone, startTime + chordIndex * chordGap + toneIndex * 0.08, chordDuration);
      });
    });
  });
}

export async function playMelodySequence(tones) {
  const safeTones = Array.isArray(tones) ? tones.filter((tone) => Number.isFinite(tone)) : [];
  if (safeTones.length === 0) return false;

  const spacing = 0.5;
  const duration = 0.38;
  const totalDuration = (safeTones.length - 1) * spacing + duration + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    safeTones.forEach((tone, index) => {
      playTone(context, tone, startTime + index * spacing, duration);
    });
  });
}

export async function playMelodyTimeline(steps) {
  const safeSteps = Array.isArray(steps)
    ? steps.map((step) => (Array.isArray(step) ? step : [step]).filter((tone) => Number.isFinite(tone))).filter((step) => step.length > 0)
    : [];
  if (safeSteps.length === 0) return false;

  const spacing = 0.54;
  const duration = 0.42;
  const totalDuration = (safeSteps.length - 1) * spacing + duration + 0.08;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    safeSteps.forEach((step, index) => {
      step.forEach((tone) => {
        playTone(context, tone, startTime + index * spacing, duration);
      });
    });
  });
}

export async function playRhythmPattern(pattern = [0, 0.42, 0.84, 1.26]) {
  const safePattern = Array.isArray(pattern) && pattern.length > 0 ? pattern : [0, 0.42, 0.84, 1.26];
  const totalDuration = Math.max(...safePattern) + 0.22;

  return runExclusivePlayback(totalDuration, (context, startTime) => {
    safePattern.forEach((offset) => {
      playRhythmClickTone(context, startTime + offset);
    });
  });
}
