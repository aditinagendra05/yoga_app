import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="page-panel small-panel">
      <div className="page-heading">
        <span className="eyebrow">Lost in the forest</span>
        <h1>We couldn't find that page.</h1>
        <p>Return to the studio and continue your journey.</p>
        <Link to="/" className="button button-primary">Back to home</Link>
      </div>
    </section>
  );
}

export default NotFound;
