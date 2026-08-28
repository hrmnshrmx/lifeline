export default function Header({ onChangeBirthday }) {
  return (
    <header className="site-header">
      <span className="brand">
        <span className="dot" aria-hidden="true" />
        Lifeline
      </span>
      {onChangeBirthday && (
        <button type="button" className="btn-ghost" onClick={onChangeBirthday}>
          Change birthday
        </button>
      )}
    </header>
  );
}
