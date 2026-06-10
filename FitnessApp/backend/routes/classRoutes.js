import express from 'express'
import GymClass from '../models/classModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

const formatClass = (c) => ({
  id: c._id,
  title: c.title,
  description: c.description,
  datetime: c.datetime,
  durationMinutes: c.durationMinutes,
  capacity: c.capacity,
  location: c.location,
  spotsLeft: c.capacity - (c.enrolledClients?.length || 0),
  enrolledCount: c.enrolledClients?.length || 0,
  trainer_id: c.trainer_id?._id || c.trainer_id,
  trainer_name: c.trainer_id?.name || null,
  isEnrolled: false, // set per-user below
})

// GET /api/classes — all upcoming classes
router.get('/', protect, async (req, res) => {
  const classes = await GymClass.find({ datetime: { $gte: new Date() } })
    .populate('trainer_id', 'name')
    .sort({ datetime: 1 })
    .lean()

  const userId = req.user._id.toString()
  res.json(classes.map(c => ({
    ...formatClass(c),
    isEnrolled: c.enrolledClients?.map(id => id.toString()).includes(userId),
  })))
})

// GET /api/classes/all — includes past (admin/trainer)
router.get('/all', protect, authorize('trainer', 'admin'), async (req, res) => {
  const filter = req.user.role === 'trainer' ? { trainer_id: req.user._id } : {}
  const classes = await GymClass.find(filter)
    .populate('trainer_id', 'name')
    .sort({ datetime: -1 })
    .lean()
  res.json(classes.map(formatClass))
})

// POST /api/classes — trainer/admin creates a class
router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  const { title, description, datetime, durationMinutes, capacity, location } = req.body
  if (!title || !datetime) return res.status(400).json({ message: 'title and datetime are required' })

  const gymClass = await GymClass.create({
    trainer_id: req.user._id,
    title,
    description,
    datetime,
    durationMinutes: durationMinutes || 60,
    capacity: capacity || 20,
    location,
  })
  res.status(201).json(formatClass(gymClass))
})

// PUT /api/classes/:id — update
router.put('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const gymClass = await GymClass.findById(req.params.id)
  if (!gymClass) return res.status(404).json({ message: 'Class not found' })
  if (req.user.role !== 'admin' && gymClass.trainer_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  gymClass.title = req.body.title ?? gymClass.title
  gymClass.description = req.body.description ?? gymClass.description
  gymClass.datetime = req.body.datetime ?? gymClass.datetime
  gymClass.durationMinutes = req.body.durationMinutes ?? gymClass.durationMinutes
  gymClass.capacity = req.body.capacity ?? gymClass.capacity
  gymClass.location = req.body.location ?? gymClass.location
  await gymClass.save()
  res.json(formatClass(gymClass))
})

// DELETE /api/classes/:id
router.delete('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const gymClass = await GymClass.findById(req.params.id)
  if (!gymClass) return res.status(404).json({ message: 'Class not found' })
  if (req.user.role !== 'admin' && gymClass.trainer_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  await gymClass.deleteOne()
  res.json({ message: 'Class deleted' })
})

// POST /api/classes/:id/enroll — client enrolls
router.post('/:id/enroll', protect, authorize('client'), async (req, res) => {
  const gymClass = await GymClass.findById(req.params.id)
  if (!gymClass) return res.status(404).json({ message: 'Class not found' })

  const alreadyEnrolled = gymClass.enrolledClients.map(id => id.toString()).includes(req.user._id.toString())
  if (alreadyEnrolled) return res.status(409).json({ message: 'Already enrolled' })
  if (gymClass.enrolledClients.length >= gymClass.capacity) return res.status(400).json({ message: 'Class is full' })

  gymClass.enrolledClients.push(req.user._id)
  await gymClass.save()
  res.json({ message: 'Enrolled successfully', spotsLeft: gymClass.capacity - gymClass.enrolledClients.length })
})

// DELETE /api/classes/:id/enroll — client unenrolls
router.delete('/:id/enroll', protect, authorize('client'), async (req, res) => {
  const gymClass = await GymClass.findById(req.params.id)
  if (!gymClass) return res.status(404).json({ message: 'Class not found' })

  gymClass.enrolledClients = gymClass.enrolledClients.filter(id => id.toString() !== req.user._id.toString())
  await gymClass.save()
  res.json({ message: 'Unenrolled successfully' })
})

export default router