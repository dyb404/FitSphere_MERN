import '../cssfiles/footer.css'
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <img className ="logo" src="/logo.png" alt="logo" />
        <p>&copy; 2024 FitSphere. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

