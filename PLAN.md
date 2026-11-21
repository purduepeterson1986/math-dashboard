# Lumen Math Lab — Architecture & Component Plan

iPad-first homeschool math + STEM dashboard. React 18 + Vite + Tailwind CSS v4 + Lucide icons.
Static build, deployed to GitHub Pages (relative `base`, no client-side routes, GitHub Actions workflow).

## Folder structure

```
index.html                  iPad meta (no zoom, standalone web-app, safe areas)
vite.config.js              base: './' for GitHub Pages
.github/workflows/deploy.yml  build + publish to Pages on push to main
scripts/test-generators.mjs   stress-tests every generator (validity, dedupe, NaN)
public/icon.svg
src/
  main.jsx, App.jsx, index.css
  curriculum/
    index.js        registry {3: age3, 5: age5, 7: age7, 12: age12}, age metadata, mode list
    age3.js         Age 3 topics + generators (all 5 modes)
    age5.js         Age 5 (Kindergarten) topics + generators
    age7.js         Age 7 (2nd grade) topics + generators
    age12.js        Age 12 topics + generators (all 5 modes)
    shared.js       choice builders, names, emoji banks
  lib/
    rng.js          random helpers (rand, pick, shuffle, gcd)
    answer.js       parse/check answers (fractions = decimals, negatives, tolerance)
    session.js      randomized question builder with per-session duplicate prevention
    diagnostics.js  per-topic stats, What Went Well / Needs Work, mastery, weak topics
    storage.js      safe localStorage (sessions, settings), JSON export/import
    audio.js        Web Audio sound effects + speech (read-aloud for Age 3)
  components/
    Header.jsx, AgeSlider.jsx, ModeCard.jsx, FilterDrawer.jsx, ComingSoon.jsx
    Visual.jsx      SVG/emoji renderer: objects, shapes, patterns, ten-frames, balance
                    scales, coordinate grids, marbles, tape diagrams, number lines…
    MathKeypad.jsx  Age 12 keypad (0–9 . − / ⌫ Clear Submit) + hardware keys
    KidPad.jsx      Age 3 giant 0–10 buttons with dot counters
    ChoiceGrid.jsx  tap-selection cards (visual or text)
    AnswerDisplay.jsx, Feedback.jsx, Confetti.jsx, PlayShell.jsx
  modes/
    FlashCards.jsx  timed rapid-fire, streaks, time bar
    Worksheet.jsx   N-problem set, navigator, flag, review, submit, graded review
    Runner.jsx      Story Problems / STEM Lab / Daily Mix (hints, explanations)
  screens/
    Home.jsx, SetupSheet.jsx, Summary.jsx, ParentGate.jsx, ParentPortal.jsx
```

## Curriculum contract (plug-and-play ages)

Each `src/curriculum/ageN.js` default-exports:

```js
{ age, title, tagline, accent, topics: [{ id, label, group, modes:[...] }],
  difficulties?: [{ id, label, detail }], defaults: { flash:{seconds,maxCards}, worksheet:{count}, ... },
  expectedMs: { flash, worksheet, story, stem, mix }, allowRetry,
  generate(mode, topicId, difficulty) -> Question }
```

Flags per age: `bigInput` (large tap cards, celebrations), `readAloud` (voice + voice toggle),
`allowRetry` (second try before the answer is shown), `keypad: 'simple' | 'full'` (whole numbers only vs. fractions/decimals/negatives).

Question: `{ key, topic, prompt, display?, story?, visual?, input: 'keypad'|'kidpad'|'choice',
choices?, answer, answerLabel, hints?, explanation, speak?, mustSimplify? }`.
Adding Age 7 = write `age7.js` and add one line to the registry.

## Modes
1. Flash Cards — timed, streak + best streak, time bar, instant feedback
2. Worksheets — 8–20 problems, jump between problems, flag, review, submit, graded review
3. Story Problems — illustrated scenes, step-by-step hints, worked explanation
4. STEM Lab — logic, patterns, spatial, estimation, balance scales, coordinates, probability, rates
5. Daily Mix (extra) — mixed review drawn from every mode

## Data
Sessions saved with per-question records `{topic, prompt, answer, given, correct, ms, hints}`
→ summary diagnostics, Parent Portal mastery, targeted practice.
