import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getUpcomingClasses, getAllClasses,
  createClass, updateClass, deleteClass,
  enrollClass, unenrollClass
} from '../api/api'
import Modal from '../components/Modal'
import '../cssfiles/classes.css'

const EMPTY_FORM = { title: '', description: '', datetime: '', durationMinutes: 60, capacity: 20, location: '' }

function Classes() {
  const { user, isAuthenticated } = useAuth()
  const isTrainer = user?.role === 'trainer' || user?.role === 'admin'
  const isClient = user?.role === 'client'

  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => { fetchClasses() }, [user])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const data = isTrainer ? await getAllClasses() : await getUpcomingClasses()
      setClasses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (cls = null) => {
    setEditingClass(cls)
    setForm(cls ? {
      title: cls.title,
      description: cls.description || '',
      datetime: cls.datetime ? new Date(cls.datetime).toISOString().slice(0, 16) : '',
      durationMinutes: cls.durationMinutes,
      capacity: cls.capacity,
      location: cls.location || '',
    } : EMPTY_FORM)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingClass) await updateClass(editingClass.id, form)
      else await createClass(form)
      await fetchClasses()
      setShowModal(false)
      setEditingClass(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save class.')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return
    try { await deleteClass(id); await fetchClasses() }
    catch (err) { alert('Failed to delete class.') }
  }

  const handleEnroll = async (id, enrolled) => {
    setActionLoading(prev => ({ ...prev, [id]: true }))
    try {
      if (enrolled) await unenrollClass(id)
      else await enrollClass(id)
      await fetchClasses()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.')
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  if (loading) return (
    <div className="page-container"><div className="loading-container"><div className="spinner"></div></div></div>
  )

  return (
    <div className="classes-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Class Schedule</h1>
          <p>{isTrainer ? 'Manage your classes and view enrollments' : 'Browse and enroll in upcoming classes'}</p>
        </div>

        {isTrainer && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className="addbtn" onClick={() => openModal()}>+ Schedule Class</button>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="empty-state"><p>{isTrainer ? 'No classes scheduled yet.' : 'No upcoming classes. Check back soon!'}</p></div>
        ) : (
          <div className="classes-grid">
            {classes.map(cls => {
              const date = new Date(cls.datetime)
              const isPast = date < new Date()
              return (
                <div key={cls.id} className={`class-card ${isPast ? 'class-card--past' : ''}`}>
                  <div className="class-card__header">
                    <h3>{cls.title}</h3>
                    {isPast && <span className="badge badge--past">Past</span>}
                    {cls.spotsLeft === 0 && !isPast && <span className="badge badge--full">Full</span>}
                  </div>
                  <div className="class-card__meta">
                    <span>📅 {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>⏱ {cls.durationMinutes} min</span>
                    {cls.location && <span>📍 {cls.location}</span>}
                    <span>👤 {cls.trainer_name || 'Trainer'}</span>
                    <span>🪑 {cls.spotsLeft} / {cls.capacity} spots left</span>
                  </div>
                  {cls.description && <p className="class-card__desc">{cls.description}</p>}

                  {isClient && !isPast && (
                    <button
                      className={`btn ${cls.isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleEnroll(cls.id, cls.isEnrolled)}
                      disabled={actionLoading[cls.id] || (!cls.isEnrolled && cls.spotsLeft === 0)}
                    >
                      {actionLoading[cls.id] ? '...' : cls.isEnrolled ? 'Unenroll' : 'Enroll'}
                    </button>
                  )}

                  {isTrainer && (
                    <div className="workout-actions">
                      <button className="btn" onClick={() => openModal(cls)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls.id)}>Delete</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingClass(null) }} title={editingClass ? 'Edit Class' : 'Schedule New Class'}>
        <form onSubmit={handleSave} className="form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={submitting} placeholder="e.g. Morning HIIT" />
          </div>
          <div className="form-group">
            <label>Date & Time</label>
            <input type="datetime-local" value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} required disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} min="15" disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} disabled={submitting} placeholder="e.g. Studio A" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" disabled={submitting} placeholder="Optional details" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingClass(null) }} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingClass ? 'Update' : 'Schedule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Classes