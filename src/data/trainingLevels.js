export const levels = [
  {
    id: "notes",
    title: "Notes",
    subtitle: "Recognize single notes",
    color: "#8b5cf6",
    theory:
      "A note is one musical sound with a specific pitch. Training notes helps you connect what you hear with note names.",
    theoryByAnswer: {
      C: {
        definition: "C is a basic note often used as a starting point in music training.",
        sound: "It can feel steady and centered, especially in C major.",
        tip: "Use the reference scale and listen for the first note: that is C."
      },
      D: {
        definition: "D is the second note in the C major scale.",
        sound: "It sounds slightly lifted from C and wants to move forward.",
        tip: "Compare it with C: D is one step higher."
      },
      E: {
        definition: "E is the third note in the C major scale.",
        sound: "It sounds bright and open in a major key.",
        tip: "In C major, E helps create the happy major sound."
      },
      F: {
        definition: "F is the fourth note in the C major scale.",
        sound: "It can feel a little suspended, like it wants to resolve.",
        tip: "Listen for a note just above E and below G."
      },
      G: {
        definition: "G is the fifth note in the C major scale.",
        sound: "It sounds strong, stable, and easy to sing back.",
        tip: "Think of G as a clear anchor above C."
      },
      A: {
        definition: "A is the sixth note in the C major scale and the starting note of A minor.",
        sound: "It can sound warm and open.",
        tip: "A is the tuning note many musicians use, so try to remember its clear ringing sound."
      },
      B: {
        definition: "B is the seventh note in the C major scale.",
        sound: "It feels tense because it wants to rise to C.",
        tip: "Listen for the note that sounds very close to the top C."
      }
    },
    questions: [
      { answer: "C", tones: [261.63], options: ["C", "D", "E", "G"] },
      { answer: "E", tones: [329.63], options: ["C", "E", "F", "A"] },
      { answer: "G", tones: [392.0], options: ["D", "F", "G", "B"] },
      { answer: "A", tones: [440.0], options: ["A", "B", "C", "F"] }
    ]
  },
  {
    id: "intervals",
    title: "Intervals",
    subtitle: "Hear the distance between notes",
    color: "#38bdf8",
    theory:
      "An interval is the distance between two notes. For example, a perfect fifth sounds open and stable.",
    theoryByAnswer: {
      "Minor 2nd": {
        definition: "A minor 2nd is the smallest common step between two neighboring notes.",
        sound: "Very tense, narrow, and almost clashing.",
        tip: "Listen for two notes that feel squeezed very close together."
      },
      "Major 2nd": {
        definition: "A major 2nd is a whole-step distance between two notes.",
        sound: "Small, moving, and not fully settled.",
        tip: "It sounds like the first two notes of a simple scale: do-re."
      },
      "Major 3rd": {
        definition: "A major 3rd is the distance that helps form a major chord.",
        sound: "Bright, warm, and happy.",
        tip: "Listen for a cheerful jump, bigger than a step but not as wide as a fourth."
      },
      "Perfect 4th": {
        definition: "A perfect 4th is a strong interval found in many melodies.",
        sound: "Open, lifted, and slightly suspended.",
        tip: "It feels like it wants to continue or resolve downward."
      },
      "Perfect 5th": {
        definition: "A perfect 5th is a very stable interval used in chords and tuning.",
        sound: "Open, strong, and balanced.",
        tip: "Listen for a wide but very clean sound, like two notes that fit together easily."
      },
      "Major 6th": {
        definition: "A major 6th is a wider interval often used in expressive melodies.",
        sound: "Warm, open, and slightly romantic.",
        tip: "It is wider than a fifth but not as complete as an octave."
      },
      "Minor 7th": {
        definition: "A minor 7th is a large interval just below an octave.",
        sound: "Wide, bluesy, and unresolved.",
        tip: "Listen for a note that almost reaches the octave but stops short."
      },
      Tritone: {
        definition: "A tritone splits the octave in half.",
        sound: "Tense, unstable, and dramatic.",
        tip: "It often sounds like it urgently needs to resolve."
      },
      Octave: {
        definition: "An octave is the same note name higher or lower.",
        sound: "Very stable, complete, and matching.",
        tip: "The two notes sound like the same note in different registers."
      }
    },
    questions: [
      { answer: "Major 2nd", tones: [261.63, 293.66], options: ["Major 2nd", "Major 3rd", "Perfect 4th", "Perfect 5th"] },
      { answer: "Major 3rd", tones: [261.63, 329.63], options: ["Minor 2nd", "Major 3rd", "Perfect 4th", "Octave"] },
      { answer: "Perfect 5th", tones: [261.63, 392.0], options: ["Major 2nd", "Major 6th", "Perfect 5th", "Minor 7th"] },
      { answer: "Octave", tones: [261.63, 523.25], options: ["Octave", "Perfect 4th", "Major 3rd", "Tritone"] }
    ]
  },
  {
    id: "chords",
    title: "Chords",
    subtitle: "Identify chord quality",
    color: "#a855f7",
    theory:
      "A chord is several notes played together. In beginner ear training, focus first on chord quality: major, minor, diminished, or augmented.",
    theoryByAnswer: {
      "Major triad": {
        definition: "A major triad is built from a root, a major third, and a perfect fifth.",
        sound: "Stable and open; the major third is the key feature that makes it sound brighter.",
        tip: "Listen to the distance between the first and second chord tones. A major third sounds wider and brighter than a minor third."
      },
      "Minor triad": {
        definition: "A minor triad is built from a root, a minor third, and a perfect fifth.",
        sound: "Stable, but darker and narrower than a major triad because the third is lower.",
        tip: "Focus on the third of the chord. If the second chord tone feels closer to the root, it is probably minor."
      },
      "Diminished triad": {
        definition: "A diminished triad is built from a root, a minor third, and a diminished fifth.",
        sound: "Tense and compressed because both the third and fifth are lowered compared with a major triad.",
        tip: "After hearing the minor third, listen for the lowered fifth. That lowered top note makes the chord feel unstable."
      },
      "Augmented triad": {
        definition: "An augmented triad is built from a root, a major third, and an augmented fifth.",
        sound: "Unstable and stretched because the fifth is raised above the normal perfect fifth.",
        tip: "Listen for a major-third start, then notice whether the top note feels raised and unsettled."
      },
      "Dominant 7th": {
        definition: "A dominant seventh chord is a major triad plus a minor seventh above the root.",
        sound: "Full and tense, with a strong pull toward resolution.",
        tip: "Hear the major-triad base first, then listen for the added seventh that creates tension on top."
      },
      "Major 7th": {
        definition: "A major seventh chord is a major triad plus a major seventh above the root.",
        sound: "Smooth and colorful, with a close upper note that adds gentle tension.",
        tip: "Listen for a stable major triad, then the high seventh that sits very close to the octave."
      },
      "Minor 7th chord": {
        definition: "A minor seventh chord is a minor triad plus a minor seventh above the root.",
        sound: "Darker than a dominant seventh, but fuller than a plain minor triad.",
        tip: "Hear the minor third first, then listen for the extra seventh above the triad."
      }
    },
    questions: [
      { answer: "Major triad", tones: [261.63, 329.63, 392.0], options: ["Major triad", "Minor triad"] },
      { answer: "Minor triad", tones: [261.63, 311.13, 392.0], options: ["Major triad", "Minor triad"] },
      { answer: "Major triad", tones: [196.0, 246.94, 293.66], options: ["Major triad", "Minor triad"] },
      { answer: "Minor triad", tones: [220.0, 261.63, 329.63], options: ["Major triad", "Minor triad"] },
      { answer: "Diminished triad", tones: [293.66, 349.23, 415.3], options: ["Diminished triad", "Augmented triad", "Major triad", "Minor triad"] },
      { answer: "Augmented triad", tones: [261.63, 329.63, 415.3], options: ["Diminished triad", "Augmented triad", "Major triad", "Minor triad"] },
      { answer: "Dominant 7th", tones: [196.0, 246.94, 293.66, 349.23], options: ["Dominant 7th", "Major 7th", "Minor 7th chord"] },
      { answer: "Major 7th", tones: [261.63, 329.63, 392.0, 493.88], options: ["Dominant 7th", "Major 7th", "Minor 7th chord"] },
      { answer: "Minor 7th chord", tones: [220.0, 261.63, 329.63, 392.0], options: ["Dominant 7th", "Major 7th", "Minor 7th chord"] }
    ]
  },
  {
    id: "scales",
    title: "Scales / modes",
    subtitle: "Recognize musical patterns",
    color: "#22d3ee",
    theory:
      "A scale is an ordered set of notes. Major scales feel resolved and bright; natural minor scales feel more serious.",
    theoryByAnswer: {
      "Major scale": {
        definition: "A major scale is an eight-note pattern with a bright tonal center.",
        sound: "Clear, happy, and resolved.",
        tip: "Listen for the familiar do-re-mi shape from low to high."
      },
      "Natural minor": {
        definition: "A natural minor scale is an eight-note pattern with a darker color.",
        sound: "Serious, calm, and a little sad.",
        tip: "Compare it with major: the third note sounds lower and darker."
      },
      Dorian: {
        definition: "Dorian is a mode that sounds like minor with a brighter sixth note.",
        sound: "Minor, but more open and hopeful.",
        tip: "Listen for a minor start that does not feel as dark as natural minor."
      },
      Pentatonic: {
        definition: "A pentatonic scale uses five main notes instead of seven.",
        sound: "Simple, open, and easy to sing.",
        tip: "It has fewer steps, so it sounds less tense and very smooth."
      },
      Chromatic: {
        definition: "A chromatic scale moves by the smallest steps.",
        sound: "Tight, sliding, and tense.",
        tip: "Listen for many close notes in a row."
      },
      Lydian: {
        definition: "Lydian is a major-like mode with a raised fourth note.",
        sound: "Bright, floating, and dreamy.",
        tip: "It sounds like major, but with extra lift."
      },
      Locrian: {
        definition: "Locrian is an unstable mode with a lowered fifth.",
        sound: "Dark, tense, and unresolved.",
        tip: "Listen for a scale that never feels fully settled."
      },
      "Blues scale": {
        definition: "A blues scale adds expressive notes to a pentatonic shape.",
        sound: "Gritty, soulful, and tense in a musical way.",
        tip: "Listen for the note that gives it a bluesy bend-like color."
      }
    },
    questions: [
      { answer: "Major scale", tones: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25], options: ["Major scale", "Natural minor", "Dorian", "Pentatonic"] },
      { answer: "Natural minor", tones: [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0], options: ["Major scale", "Natural minor", "Lydian", "Blues scale"] },
      { answer: "Pentatonic", tones: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], options: ["Pentatonic", "Natural minor", "Chromatic", "Dorian"] },
      { answer: "Dorian", tones: [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33], options: ["Dorian", "Major scale", "Locrian", "Pentatonic"] }
    ]
  }
];
