import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import '../cssfiles/homepage.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <Carousel />
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose FitSphere?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h3>Personalized Workouts</h3>
              <p>Get custom workout plans designed specifically for your fitness goals and level.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Expert Trainers</h3>
              <p>Work with certified fitness professionals who guide you every step of the way.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your fitness journey with detailed progress logs and analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h3>Health Tips</h3>
              <p>Access expert health and wellness advice to complement your fitness routine.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="second-section">
        <div className="container">
          <h2>Ready to Start Your Fitness Journey?</h2>
          <p>Join thousands of members who are transforming their lives with FitSphere</p>
          <div className="second-buttons">
            <Link to="/pricing" className="first">View Pricing</Link>
            <Link to="/login" className="second">Get Started</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

