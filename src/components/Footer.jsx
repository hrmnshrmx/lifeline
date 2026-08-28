export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span className="footer-brand">LIFELINE</span>
        <p className="footer-tag">Your life, measured in time.</p>
        <p className="footer-by">
          Built by Harman Sharma ·{' '}
          <a href="https://harmansharma.in" target="_blank" rel="noopener noreferrer">
            harmansharma.in
          </a>
        </p>
        <p className="note" style={{ marginTop: '0.6rem', maxWidth: '52ch' }}>
          Everything is calculated on your device. Your birthday never leaves this browser.
        </p>
      </div>
    </footer>
  );
}
