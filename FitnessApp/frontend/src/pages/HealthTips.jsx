import { useState, useEffect } from 'react'
import { getHealthTips } from '../api/api'
import '../cssfiles/healthtips.css'

function HealthTips() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTips()
  }, [])

  const fetchTips = async () => {
    try {
      setLoading(true)
      const data = await getHealthTips()
      setTips(data)
      setError(null)
    } catch (err) {
      setError('Failed to load health tips. Please try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="health-tips-page">
      <div className="container">
        <div className="page-header">
          <h1>Health Tips</h1>
          <p>Expert advice to help you achieve your health and fitness goals</p>
        </div>

        <div className="tips-grid">
          {tips.map((tip) => (
            <div key={tip.id} className="tipcard">
              <div className="tip-icon">💡</div>
              <h3>{tip.title}</h3>
              <p>{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HealthTips

