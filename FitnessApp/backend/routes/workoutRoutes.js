import express from 'express'
import mongoose from 'mongoose'
import Workout from '../models/workoutModel.js'
import Assignment from '../models/assignmentModel.js'
import User from '../models/userModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

const toObjectId = (value) => {
  if (!value) return null
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null
}

router.get('/', protect, async (req, res) => {
  const { user_id } = req.query
  let workouts = []

  if (user_id) {
    const user = await User.findById(toObjectId(user_id))
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'trainer' || user.role === 'admin') {
      workouts = await Workout.find({ trainer_id: user._id }).populate('trainer_id', 'name').lean()
    } else {
      const assignments = await Assignment.find({ client_id: user._id })
      const workoutIds = assignments.map((assignment) => assignment.workout_id)
      workouts = await Workout.find({ _id: { $in: workoutIds } }).populate('trainer_id', 'name').lean()
    }
  } else {
    workouts = await Workout.find().populate('trainer_id', 'name').lean()
  }

  const result = workouts.map((workout) => ({
    id: workout._id,
    trainer_id: workout.trainer_id?._id,
    title: workout.title,
    description: workout.description,
    trainer_name: workout.trainer_id?.name || null,
  }))
  res.json(result)
})

router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  const { title, description } = req.body
  const trainerId = toObjectId(req.query.trainer_id)

  if (!trainerId) {
    return res.status(400).json({ message: 'Trainer ID is required' })
  }

  const trainer = await User.findById(trainerId)
  if (!trainer || (trainer.role !== 'trainer' && trainer.role !== 'admin')) {
    return res.status(403).json({ message: 'Only trainers or admins may create workouts' })
  }

  if (req.user.role !== 'admin' && req.user._id.toString() !== trainerId.toString()) {
    return res.status(403).json({ message: 'Not authorized to create workouts for this trainer' })
  }

  const workout = await Workout.create({ trainer_id: trainerId, title, description })
  res.status(201).json({
    id: workout._id,
    trainer_id: workout.trainer_id,
    title: workout.title,
    description: workout.description,
    trainer_name: trainer.name,
  })
})

router.get('/:id', protect, async (req, res) => {
  const workout = await Workout.findById(req.params.id).populate('trainer_id', 'name').lean()
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' })
  }
  res.json({
    id: workout._id,
    trainer_id: workout.trainer_id?._id,
    title: workout.title,
    description: workout.description,
    trainer_name: workout.trainer_id?.name || null,
  })
})

router.put('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const workout = await Workout.findById(req.params.id)
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' })
  }

  const trainerId = toObjectId(req.query.trainer_id)
  if (!trainerId) {
    return res.status(400).json({ message: 'Trainer ID is required' })
  }

  const trainer = await User.findById(trainerId)
  if (!trainer) {
    return res.status(404).json({ message: 'Trainer not found' })
  }

  if (req.user.role !== 'admin' && workout.trainer_id.toString() !== trainerId.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this workout' })
  }

  workout.title = req.body.title ?? workout.title
  workout.description = req.body.description ?? workout.description
  await workout.save()

  res.json({
    id: workout._id,
    trainer_id: workout.trainer_id,
    title: workout.title,
    description: workout.description,
    trainer_name: trainer.name,
  })
})

router.delete('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const workout = await Workout.findById(req.params.id)
  if (!workout) {
    return res.status(404).json({ message: 'Workout not found' })
  }

  const trainerId = toObjectId(req.query.trainer_id)
  if (!trainerId) {
    return res.status(400).json({ message: 'Trainer ID is required' })
  }

  if (req.user.role !== 'admin' && workout.trainer_id.toString() !== trainerId.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this workout' })
  }

  await workout.deleteOne()
  res.json({ message: 'Workout deleted successfully' })
})

export default router