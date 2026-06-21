// nothing special here, just a footer
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">Go Business</span>

        <nav aria-label="Footer" className="footer__nav">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </nav>

        <p className="footer__copyright">© 2024 Go Business, Inc.</p>
      </div>
    </footer>
  );
}
