import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyWorkouts, getMyProgressLogs, addProgressLog, deleteProgressLog, getDietPlans } from '../api/api'
import "../cssfiles/ClientDashboard.css";
import Modal from '../components/Modal'

function ClientDashboard() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [progressLogs, setProgressLogs] = useState([])
  const [dietPlans, setDietPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddLogModal, setShowAddLogModal] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    calories: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const [workoutsData, logsData, dietPlansData] = await Promise.all([
        getMyWorkouts(user.id),
        getMyProgressLogs(user.id),
        getDietPlans(),
      ])
      setWorkouts(workoutsData)
      setProgressLogs(logsData)
      setDietPlans(dietPlansData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLog = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const logData = {
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        calories: formData.calories ? parseInt(formData.calories) : null,
        notes: formData.notes || null,
        client_id: user.id
      }

      await addProgressLog(logData, user.id)
      await fetchData()
      setShowAddLogModal(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        calories: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error adding progress log:', error)
      alert('Failed to add progress log. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this progress log?')) {
      return
    }

    try {
      await deleteProgressLog(id)
      await fetchData()
    } catch (error) {
      console.error('Error deleting progress log:', error)
      alert('Failed to delete progress log. Please try again.')
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

  return (
  <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Track your fitness journey and view your assigned workouts</p>
        </div>

        <div className="dashboard-div">
          <section className="dashboard-section-client">
            <h2>Assigned Workouts</h2>
            {workouts.length === 0 ? (
              <div className="empty-state">
                <p>No workouts assigned yet. Your trainer will assign workouts to you soon.</p>
              </div>
            ) : (
              <div className="workouts-list">
                {workouts.map((workout) => (
                  <div key={workout.id} className="workout-card">
                    <h3>{workout.title}</h3>
                    {workout.trainer_name && (
                      <p className="trainer-name">By {workout.trainer_name}</p>
                    )}
                    {workout.description && (
                      <p className="workout-description">{workout.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          

          <section className="dashboard-section-client">
            <h2>Personal Information</h2>
            <div className="info-card">
              <div className="info-item">
                <strong>Name:</strong> {user?.name}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {user?.role}
              </div>
            </div>
          </section>
        </div>
        <section className="progress-log">
            <div className="section-header">
              <h2>My Diet Plans</h2>
            </div>
            {dietPlans.length === 0 ? (
              <div className="empty-state"><p>No diet plans assigned yet. Your trainer will add one soon.</p></div>
            ) : (
              <div className="workouts-list">
                {dietPlans.map(plan => (
                  <div key={plan.id} className="workout-card">
                    <h3>{plan.title}</h3>
                    {plan.trainer_name && <p className="trainer-name">By {plan.trainer_name}</p>}
                    {plan.description && <p className="workout-description">{plan.description}</p>}
                    {plan.meals?.length > 0 && (
                      <table className="progress-table" style={{marginTop:'0.75rem'}}>
                        <thead>
                          <tr><th>Meal</th><th>Time</th><th>Foods</th><th>Calories</th><th>Notes</th></tr>
                        </thead>
                        <tbody>
                          {plan.meals.map((meal, i) => (
                            <tr key={i}>
                              <td>{meal.mealName}</td>
                              <td>{meal.time || '—'}</td>
                              <td>{meal.foods}</td>
                              <td>{meal.calories || '—'}</td>
                              <td>{meal.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        <section className="progress-log">
            <div className="section-header">
              <h2>Progress Logs</h2>
              <button
                className="addbtn"
                onClick={() => setShowAddLogModal(true)}
              >
                Add Progress Log
              </button>
            </div>

            {progressLogs.length === 0 ? (
              <div className="empty-state">
                <p>No progress logs yet. Start tracking your progress!</p>
              </div>
            ) : (
              <div className="progress-table-container">
                <table className="progress-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight (kg)</th>
                      <th>Calories</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.date).toLocaleDateString()}</td>
                        <td>{log.weight || '-'}</td>
                        <td>{log.calories || '-'}</td>
                        <td>{log.notes || '-'}</td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteLog(log.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
      </div>

      <Modal
        isOpen={showAddLogModal}
        onClose={() => setShowAddLogModal(false)}
        title="Add Progress Log"
      >
        <form onSubmit={handleAddLog} className="form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="Enter weight"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="calories">Calories</label>
            <input
              type="number"
              id="calories"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="Enter calories consumed"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about your progress"
              rows="4"
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddLogModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ClientDashboard