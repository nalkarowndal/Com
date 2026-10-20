export default function Footer({
  copyright = "2026 Green Systems Incorporated. All rights reserved.",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!"
}) {
  return (
    <footer className="site-footer">
      <div className="row footer-inner">
        <div className="col">
          <p className="footer-text">{copyright}</p>
          <p className="footer-text">{description}</p>
        </div>
      </div>
    </footer>
  );
}
