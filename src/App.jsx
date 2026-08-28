import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Starfield from './components/Starfield.jsx';
import BirthdayInput from './components/BirthdayInput.jsx';
import LifeCounter from './components/LifeCounter.jsx';
import BirthdayRarity from './components/BirthdayRarity.jsx';
import OnThisDay from './components/OnThisDay.jsx';
import LifeStats from './components/LifeStats.jsx';
import LifeProgress from './components/LifeProgress.jsx';
import { useBirthday } from './hooks/useBirthday.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';

export default function App() {
  const { birthday, ready, save, clear } = useBirthday();
  const reducedMotion = useReducedMotion();
  const [editing, setEditing] = useState(false);

  const handleSubmit = useCallback(
    (date, time) => {
      save(date, time);
      setEditing(false);
      // Return to the top for the reveal of the experience.
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [save, reducedMotion],
  );

  const handleChange = useCallback(() => {
    setEditing(true);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleStartOver = useCallback(() => {
    clear();
    setEditing(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [clear]);

  // Keep the document title stable but meaningful once a birthday is set.
  useEffect(() => {
    document.title = 'Lifeline — Your Life, Measured in Time';
  }, []);

  const showInput = !ready ? false : !birthday || editing;

  return (
    <>
      <div className="bg-cosmos" aria-hidden="true" />
      <Starfield reducedMotion={reducedMotion} />

      {/* Avoid a flash before LocalStorage is read. */}
      {!ready && <div style={{ minHeight: '100svh' }} aria-hidden="true" />}

      {ready && showInput && (
        <main>
          <BirthdayInput
            onSubmit={handleSubmit}
            initialDate={birthday?.date || ''}
            initialTime={birthday?.time || ''}
          />
        </main>
      )}

      {ready && !showInput && birthday && (
        <>
          <Header onChangeBirthday={handleChange} />
          <main id="main">
            <LifeCounter
              birthDate={birthday.birthDate}
              hasTime={birthday.hasTime}
              reducedMotion={reducedMotion}
            />
            <BirthdayRarity birthDate={birthday.birthDate} />
            <OnThisDay birthDate={birthday.birthDate} />
            <LifeStats birthDate={birthday.birthDate} />
            <LifeProgress birthDate={birthday.birthDate} />

            <section className="section manage-section" aria-label="Manage your birthday">
              <div className="container">
                <div className="manage glass">
                  <p className="manage-title">This is your Lifeline.</p>
                  <p className="manage-sub">Saved on this device — come back anytime.</p>
                  <div className="manage-actions">
                    <button type="button" className="manage-btn primary" onClick={handleChange}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="4.5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      Change birthday
                    </button>
                    <button type="button" className="manage-btn" onClick={handleStartOver}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v3.4h3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Start over
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
