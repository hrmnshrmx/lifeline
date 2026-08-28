import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
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
      <div className="bg-grain" aria-hidden="true" />

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

            <section className="section" aria-label="Manage your birthday">
              <div className="container control-row">
                <button type="button" className="btn-ghost" onClick={handleChange}>
                  Change birthday
                </button>
                <button type="button" className="btn-ghost" onClick={handleStartOver}>
                  Start over
                </button>
              </div>
            </section>
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
