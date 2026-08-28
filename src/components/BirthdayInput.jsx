import { useRef, useState } from 'react';
import { parseBirthday, isFuture } from '../utils/dateCalculations.js';

const TODAY_ISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/**
 * The opening experience: wordmark → prompt → date picker → Begin.
 * Uses a native date input (mobile-friendly) plus an optional time field.
 */
export default function BirthdayInput({ onSubmit, initialDate = '', initialTime = '' }) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [error, setError] = useState('');
  const dateRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setError('Please choose your date of birth.');
      dateRef.current?.focus();
      return;
    }
    const result = parseBirthday(date, time);
    if (!result) {
      setError("That date doesn't look right. Please check and try again.");
      return;
    }
    if (isFuture(result.date)) {
      setError("That date hasn't arrived yet. Choose a date in the past.");
      return;
    }
    setError('');
    onSubmit(date, result.hasTime ? time : '');
  };

  return (
    <section className="intro" aria-labelledby="intro-heading">
      <div className="intro-inner stagger">
        <h1 className="wordmark" id="intro-heading">LIFELINE</h1>
        <p className="tagline">Your life, measured in time.</p>

        <p className="prompt">When did your story begin?</p>

        <form className="dob-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                ref={dateRef}
                className="input"
                type="date"
                value={date}
                max={TODAY_ISO()}
                onChange={(e) => setDate(e.target.value)}
                required
                aria-describedby="privacy-note"
                autoComplete="bday"
              />
            </div>
            <div className="field time">
              <label htmlFor="tob">
                Time <span className="hint-optional">(optional)</span>
              </label>
              <input
                id="tob"
                className="input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <p className="form-error" role="alert">{error}</p>

          <button type="submit" className="btn">Begin</button>

          <span className="privacy" id="privacy-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your birthday stays on this device.
          </span>
        </form>
      </div>
    </section>
  );
}
