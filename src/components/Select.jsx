import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * A compact, accessible, fully theme-able dropdown — replaces the native
 * <select> (whose OS-drawn popup can't be styled and looked broken on the
 * dark UI). Keyboard: ↑/↓ move, Enter/Space select, Esc close, Home/End,
 * plus type-ahead. Closes on outside click / blur.
 *
 * options: [{ value, label }]
 */
export default function Select({ value, onChange, options, placeholder, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // highlighted index while open
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);
  const typeahead = useRef({ str: '', t: 0 });
  const listId = useId();

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  // Close on outside interaction.
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, [open, close]);

  // When opening, highlight the current selection and scroll to it.
  useEffect(() => {
    if (!open) return;
    const start = selectedIndex >= 0 ? selectedIndex : 0;
    setActive(start);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || active < 0 || !listRef.current) return;
    const el = listRef.current.children[active];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const choose = (idx) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(String(opt.value));
    close();
    btnRef.current?.focus();
  };

  const onButtonKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key) && !open) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    handleListKey(e);
  };

  const handleListKey = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (active >= 0) choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        btnRef.current?.focus();
        break;
      case 'Tab':
        close();
        break;
      default:
        // Type-ahead
        if (e.key.length === 1) {
          const now = Date.now();
          const str = now - typeahead.current.t < 800 ? typeahead.current.str + e.key : e.key;
          typeahead.current = { str, t: now };
          const found = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(str.toLowerCase()),
          );
          if (found >= 0) setActive(found);
        }
        break;
    }
  };

  return (
    <div className={`cs ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        ref={btnRef}
        className="cs-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        <span className={selected ? 'cs-value' : 'cs-value placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="cs-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          className="cs-list"
          role="listbox"
          id={listId}
          aria-label={ariaLabel}
          ref={listRef}
          tabIndex={-1}
          onKeyDown={handleListKey}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={String(o.value) === String(value)}
              className={`cs-opt ${i === active ? 'active' : ''} ${
                String(o.value) === String(value) ? 'selected' : ''
              }`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(i);
              }}
            >
              {o.label}
              {String(o.value) === String(value) && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
