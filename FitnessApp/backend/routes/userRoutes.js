import express from 'express'
import User from '../models/userModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  const users = await User.find().select('-passwordHash').lean()
  res.json(users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  })))
})

router.get('/clients', protect, authorize('trainer', 'admin'), async (req, res) => {
  const clients = await User.find({ role: 'client' }).select('-passwordHash').lean()
  res.json(clients.map((client) => ({
    id: client._id,
    name: client.name,
    email: client.email,
    role: client.role,
  })))
})

router.get('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash').lean()
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role })
})

export default router
