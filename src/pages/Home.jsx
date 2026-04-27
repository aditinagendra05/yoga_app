import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../api/client.js';

function Home() {
  const [popularClasses, setPopularClasses] = useState([]);
  const [popularInstructors, setPopularInstructors] = useState([]);

  useEffect(() => {
    fetchJson('/classes/popular').then(setPopularClasses).catch(console.error);
    fetchJson('/instructors/popular').then(setPopularInstructors).catch(console.error);
  }, []);

  return (
    <section className="page-panel home-panel">
      <div className="hero-block">
        <div>
          <span className="eyebrow">Ayurveda-inspired wellness</span>
          <h1>Yoga classes rooted in nature, breath, and balance.</h1>
          <p>Explore mindful movement, sacred instruction, and expert guidance from authentic instructors.</p>
          <div className="hero-actions">
            <Link to="/classes" className="button button-primary">Browse classes</Link>
            <Link to="/instructors" className="button button-secondary">Meet instructors</Link>
          </div>
        </div>
        <div className="hero-image" />
      </div>

      <div className="section-grid">
        <article className="feature-card">
          <h2>Calm, curated courses</h2>
          <p>From beginner alignment to advanced vinyasa, every class is designed with sustainable growth in mind.</p>
        </article>
        <article className="feature-card">
          <h2>Secure checkout</h2>
          <p>Stripe-powered payment flow means cart and enrollment stay safe from first tap to final pose.</p>
        </article>
        <article className="feature-card">
          <h2>Community dashboard</h2>
          <p>Students, instructors, and admins all see an intuitive workspace tailored for their role.</p>
        </article>
      </div>

      <div className="featured-section">
        <h2>Popular classes</h2>
        <div className="card-grid">
          {popularClasses.map((cls) => (
            <article key={cls._id} className="class-card">
              <h3>{cls.name}</h3>
              <p>{cls.description}</p>
              <div className="card-meta">
                <span>{cls.instructorName || cls.instructorEmail}</span>
                <span>${cls.price.toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="featured-section">
        <h2>Popular instructors</h2>
        <div className="card-grid">
          {popularInstructors.map((item) => (
            <article key={item.instructor?.email || item._id} className="instructor-card">
              <h3>{item.instructor?.name || item.instructor?.email || item._id}</h3>
              <p>{item.instructor?.about || 'Guiding students with calm clarity.'}</p>
              <span className="stat-pill">{item.totalEnrolled ?? 0} enrolled</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
