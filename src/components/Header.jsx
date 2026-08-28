export default function Header({ onChangeBirthday, onHome }) {
  return (
    <header className="site-header">
      <button type="button" className="brand" onClick={onHome} aria-label="Lifeline — back to top">
        <span className="dot" aria-hidden="true" />
        Lifeline
      </button>
      {onChangeBirthday && (
        <button type="button" className="btn-ghost" onClick={onChangeBirthday}>
          Change birthday
        </button>
      )}
    </header>
  );
}
