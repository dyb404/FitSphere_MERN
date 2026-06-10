import express from 'express'
import mongoose from 'mongoose'
import ProgressLog from '../models/progressLogModel.js'
import User from '../models/userModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()
const toObjectId = (value) => {
  if (!value) return null
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null
}

router.get('/', protect, async (req, res) => {
  const { client_id } = req.query
  const clientId = toObjectId(client_id)

  if (clientId) {
    const client = await User.findById(clientId)
    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    if (req.user.role === 'client' && req.user._id.toString() !== clientId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this progress data' })
    }

    const logs = await ProgressLog.find({ client_id: clientId }).sort({ date: -1 }).lean()
    return res.json(logs.map((log) => ({
      id: log._id,
      client_id: log.client_id,
      date: log.date,
      weight: log.weight,
      calories: log.calories,
      notes: log.notes,
    })))
  }

  if (req.user.role === 'client') {
    const logs = await ProgressLog.find({ client_id: req.user._id }).sort({ date: -1 }).lean()
    return res.json(logs.map((log) => ({
      id: log._id,
      client_id: log.client_id,
      date: log.date,
      weight: log.weight,
      calories: log.calories,
      notes: log.notes,
    })))
  }

  const logs = await ProgressLog.find().sort({ date: -1 }).lean()
  res.json(logs.map((log) => ({
    id: log._id,
    client_id: log.client_id,
    date: log.date,
    weight: log.weight,
    calories: log.calories,
    notes: log.notes,
  })))
})

router.post('/', protect, async (req, res) => {
  const { client_id, date, weight, calories, notes } = req.body
  const clientId = toObjectId(client_id)

  if (!clientId || !date) {
    return res.status(400).json({ message: 'client_id and date are required' })
  }

  if (req.user.role === 'client' && req.user._id.toString() !== clientId.toString()) {
    return res.status(403).json({ message: 'Not authorized to create progress for this client' })
  }

  const progressLog = await ProgressLog.create({
    client_id: clientId,
    date,
    weight,
    calories,
    notes,
  })

  res.status(201).json({
    id: progressLog._id,
    client_id: progressLog.client_id,
    date: progressLog.date,
    weight: progressLog.weight,
    calories: progressLog.calories,
    notes: progressLog.notes,
  })
})

router.delete('/:id', protect, async (req, res) => {
  const progressLog = await ProgressLog.findById(req.params.id)
  if (!progressLog) {
    return res.status(404).json({ message: 'Progress log not found' })
  }

  if (req.user.role === 'client' && req.user._id.toString() !== progressLog.client_id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this progress log' })
  }

  await progressLog.deleteOne()
  res.json({ message: 'Progress log deleted successfully' })
})

export default router