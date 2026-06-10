import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import "../cssfiles/TrainerDashboard.css";

import {
  getClients,
  getMyCreatedWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getAssignments,
  assignWorkout,
  removeAssignment,
  getAllProgressLogs,
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
} from '../api/api'

import Modal from '../components/Modal'

function TrainerDashboard() {
  const { user } = useAuth()

  const [clients, setClients] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [assignments, setAssignments] = useState([])
  const [progressLogs, setProgressLogs] = useState([])
  const [dietPlans, setDietPlans] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDietModal, setShowDietModal] = useState(false)

  const [editingWorkout, setEditingWorkout] = useState(null)
  const [editingDiet, setEditingDiet] = useState(null)

  const [workoutForm, setWorkoutForm] = useState({ title: '', description: '' })
  const [assignForm, setAssignForm] = useState({ clientId: '', workoutId: '' })
  const [dietForm, setDietForm] = useState({ client_id: '', title: '', description: '', meals: [] })

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      const [
        clientsData,
        workoutsData,
        assignmentsData,
        logsData,
        dietPlansData,
      ] = await Promise.all([
        getClients(),
        getMyCreatedWorkouts(user.id),
        getAssignments(user.id),
        getAllProgressLogs(),
        getDietPlans(),
      ])

      setClients(clientsData)
      setWorkouts(workoutsData)
      setAssignments(assignmentsData)
      setProgressLogs(logsData)
      setDietPlans(dietPlansData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ================= WORKOUT =================

  const handleCreateWorkout = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, workoutForm, user.id)
      } else {
        await createWorkout(workoutForm, user.id)
      }

      await fetchData()
      setShowWorkoutModal(false)
      setEditingWorkout(null)
      setWorkoutForm({ title: '', description: '' })
    } catch (err) {
      alert("Failed to save workout")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditWorkout = (w) => {
    setEditingWorkout(w)
    setWorkoutForm({ title: w.title, description: w.description || '' })
    setShowWorkoutModal(true)
  }

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Delete workout?")) return
    await deleteWorkout(id, user.id)
    await fetchData()
  }

  // ================= ASSIGN =================

  const handleAssignWorkout = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await assignWorkout(assignForm.clientId, assignForm.workoutId)
      await fetchData()

      setShowAssignModal(false)
      setAssignForm({ clientId: '', workoutId: '' })
    } catch (err) {
      alert("Failed to assign workout")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveAssignment = async (id) => {
    if (!window.confirm("Remove assignment?")) return
    await removeAssignment(id)
    await fetchData()
  }

  // ================= DIET =================

  const openDietModal = (plan = null) => {
    setEditingDiet(plan)

    setDietForm(
      plan
        ? { ...plan }
        : { client_id: '', title: '', description: '', meals: [] }
    )

    setShowDietModal(true)
  }

  const addMealRow = () =>
    setDietForm(f => ({
      ...f,
      meals: [...f.meals, { mealName: '', time: '', foods: '', calories: '', notes: '' }]
    }))

  const updateMeal = (i, field, value) =>
    setDietForm(f => {
      const meals = [...f.meals]
      meals[i][field] = value
      return { ...f, meals }
    })

  const removeMealRow = (i) =>
    setDietForm(f => ({
      ...f,
      meals: f.meals.filter((_, idx) => idx !== i)
    }))

  const handleSaveDiet = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        ...dietForm,
        meals: dietForm.meals.map(m => ({
          ...m,
          calories: m.calories ? Number(m.calories) : undefined
        }))
      }

      if (editingDiet) {
        await updateDietPlan(editingDiet.id, payload)
      } else {
        await createDietPlan(payload)
      }

      await fetchData()
      setShowDietModal(false)
      setEditingDiet(null)
    } catch (err) {
      alert("Failed to save diet plan")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDiet = async (id) => {
    if (!window.confirm("Delete diet plan?")) return
    await deleteDietPlan(id)
    await fetchData()
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="dashboard-page">
      <div className="container">

        <h1>Welcome {user?.name}</h1>

        {/* WORKOUT MODAL */}
        <Modal
          isOpen={showWorkoutModal}
          onClose={() => {
            setShowWorkoutModal(false)
            setEditingWorkout(null)
          }}
          title={editingWorkout ? "Edit Workout" : "Create Workout"}
        >
          <form onSubmit={handleCreateWorkout}>
            <input
              value={workoutForm.title}
              onChange={(e) =>
                setWorkoutForm({ ...workoutForm, title: e.target.value })
              }
              placeholder="Title"
            />

            <textarea
              value={workoutForm.description}
              onChange={(e) =>
                setWorkoutForm({ ...workoutForm, description: e.target.value })
              }
              placeholder="Description"
            />

            <button type="submit" disabled={submitting}>
              {editingWorkout ? "Update" : "Create"}
            </button>
          </form>
        </Modal>

        {/* ASSIGN MODAL */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Workout"
        >
          <form onSubmit={handleAssignWorkout}>
            <select
              value={assignForm.clientId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, clientId: e.target.value })
              }
            >
              <option value="">Client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={assignForm.workoutId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, workoutId: e.target.value })
              }
            >
              <option value="">Workout</option>
              {workouts.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>

            <button type="submit">Assign</button>
          </form>
        </Modal>

        {/* DIET MODAL */}
        <Modal
          isOpen={showDietModal}
          onClose={() => setShowDietModal(false)}
          title="Diet Plan"
        >
          <form onSubmit={handleSaveDiet}>
            <input
              value={dietForm.title}
              onChange={(e) =>
                setDietForm({ ...dietForm, title: e.target.value })
              }
              placeholder="Title"
            />

            <button type="button" onClick={addMealRow}>
              Add Meal
            </button>

            {dietForm.meals.map((m, i) => (
              <div key={i}>
                <input
                  placeholder="Meal"
                  value={m.mealName}
                  onChange={(e) =>
                    updateMeal(i, 'mealName', e.target.value)
                  }
                />

                <button type="button" onClick={() => removeMealRow(i)}>
                  Remove
                </button>
              </div>
            ))}

            <button type="submit">
              {editingDiet ? "Update" : "Create"}
            </button>
          </form>
        </Modal>

      </div>
    </div>
  )
}

export default TrainerDashboard