import React from 'react';
import MathKeypad from './MathKeypad.jsx';
import AnswerDisplay from './AnswerDisplay.jsx';
import KidPad from './KidPad.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';

/**
 * Input side of the play screen. Picks keypad / kid pad / choice cards based on the question.
 *  - value / onChange: current entry (keypad) or selected choice id
 *  - onSubmit(given): commit an answer
 *  - instant: choices & kid pad submit immediately on tap (false in worksheets)
 */
export default function AnswerPanel({ q, value, onChange, onSubmit, state = 'idle', disabled, big, instant = true, submitLabel, compact }) {
  if (!q) return null;
  if (q.input === 'choice') {
    return (
      <ChoiceGrid
        choices={q.choices}
        picked={value}
        answer={q.answer}
        reveal={state === 'correct' || state === 'wrong' ? 'full' : state === 'retry' ? 'picked' : null}
        disabled={disabled}
        big={big}
        onPick={(id) => { onChange(id); if (instant) onSubmit(id); }}
      />
    );
  }
  if (q.input === 'kidpad') {
    return (
      <KidPad
        picked={value === '' || value === null || value === undefined ? null : Number(value)}
        state={state === 'retry' ? 'wrong' : state}
        disabled={disabled}
        onPick={(n) => { onChange(String(n)); if (instant) onSubmit(String(n)); }}
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <AnswerDisplay value={value || ''} state={state === 'retry' ? 'wrong' : state} hint={q.hint || (q.decimalOnly ? 'Answer as a decimal' : null)} />
      <MathKeypad value={value || ''} onChange={onChange} onSubmit={() => onSubmit(value)} disabled={disabled} submitLabel={submitLabel} compact={compact} />
    </div>
  );
}
