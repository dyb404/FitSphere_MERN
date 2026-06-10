import express from 'express'
import mongoose from 'mongoose'
import Assignment from '../models/assignmentModel.js'
import User from '../models/userModel.js'
import Workout from '../models/workoutModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()
const toObjectId = (value) => {
  if (!value) return null
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null
}

router.get('/', protect, async (req, res) => {
  const { user_id } = req.query
  let assignments = []

  if (user_id) {
    const user = await User.findById(toObjectId(user_id))
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'trainer' || user.role === 'admin') {
      assignments = await Assignment.find().populate('client_id', 'name').populate('workout_id', 'title').lean()
    } else {
      assignments = await Assignment.find({ client_id: user._id }).populate('client_id', 'name').populate('workout_id', 'title').lean()
    }
  } else {
    assignments = await Assignment.find().populate('client_id', 'name').populate('workout_id', 'title').lean()
  }

  res.json(assignments.map((assignment) => ({
    id: assignment._id,
    client_id: assignment.client_id?._id,
    workout_id: assignment.workout_id?._id,
    client_name: assignment.client_id?.name || null,
    workout_title: assignment.workout_id?.title || null,
  })))
})

router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  const { client_id, workout_id } = req.body
  const clientId = toObjectId(client_id)
  const workoutId = toObjectId(workout_id)

  if (!clientId || !workoutId) {
    return res.status(400).json({ message: 'client_id and workout_id are required' })
  }

  const client = await User.findById(clientId)
  if (!client || client.role !== 'client') {
    return res.status(400).json({ message: 'User is not a client' })
  }

  const workout = await Workout.findById(workoutId)
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' })
  }

  const existing = await Assignment.findOne({ client_id: clientId, workout_id: workoutId })
  if (existing) {
    return res.status(409).json({ message: 'Workout already assigned to this client' })
  }

  const assignment = await Assignment.create({ client_id: clientId, workout_id: workoutId })
  res.status(201).json({
    id: assignment._id,
    client_id: assignment.client_id,
    workout_id: assignment.workout_id,
    client_name: client.name,
    workout_title: workout.title,
  })
})

router.delete('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' })
  }

  await assignment.deleteOne()
  res.json({ message: 'Assignment removed successfully' })
})

export default router