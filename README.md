# Ear Training: тренажер музичного слуху

Ear Training is a React + Vite app for practicing musical hearing step by step:

1. Notes
2. Intervals
3. Chords
4. Scales / modes

## Features

- Choose a training level.
- Press Play to hear generated tones.
- Choose an answer.
- See if the answer is correct.
- Read a short theory explanation.
- View progress on the Progress screen.

## How to run

First install Node.js from `https://nodejs.org` if it is not installed yet.

Then run these commands in this app folder:

```bash
npm install
npm run dev
```

Open the local link shown in the terminal. It is usually:

```text
http://localhost:5173
```

To make a production build:

```bash
npm run build
```

## Simple app structure

```text
src/
  App.jsx                    Main app and screens
  styles.css                 Dark neon UI styles
  data/trainingLevels.js     Levels, answers, tones, theory text
  utils/audio.js             Generated browser tones
  utils/progress.js          Local progress saving
```

## How sounds work

The app does not use audio files. It uses the browser Web Audio API to generate clear training tones.

Later, the data in `src/data/trainingLevels.js` can be replaced with smarter programmatic note, interval, chord, and scale generation.
