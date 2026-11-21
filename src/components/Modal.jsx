import React from 'react';

export default function Modal({ open, onClose, title, children, actions = [], wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] animate-rise" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-[28px] bg-white p-6 shadow-2xl animate-pop max-h-[90dvh] scroll-y`}>
        {title && <h3 className="text-2xl font-extrabold text-ink mb-2">{title}</h3>}
        <div className="text-ink-soft font-medium">{children}</div>
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            {actions.map((a) => (
              <button key={a.label} type="button" onClick={a.onClick} disabled={a.disabled}
                className={`press min-h-12 px-5 rounded-2xl font-extrabold disabled:opacity-40 ${a.primary ? 'bg-brand-600 text-white' : a.tone === 'bad' ? 'bg-bad-soft text-bad' : 'bg-slate-100 text-ink'}`}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
