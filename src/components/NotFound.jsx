import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="page-panel small-panel">
      <h1>Page not found</h1>
      <p>We couldn't find that page. Return to the home flow.</p>
      <Link to="/" className="button button-primary">Back to Home</Link>
    </section>
  );
}

export default NotFound;
