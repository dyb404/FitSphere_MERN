import express from 'express'
import User from '../models/userModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

// All admin routes require auth + admin role
router.use(protect, authorize('admin'))

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-passwordHash').lean()
  res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })))
})

// POST /api/admin/users — create a user with any role
router.post('/users', async (req, res) => {
  const { name, email, password, role = 'client' } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  const normalizedRole = ['admin', 'trainer', 'client'].includes(role) ? role : 'client'
  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.default.hash(password, 10)
  const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role: normalizedRole })
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
})

// PATCH /api/admin/users/:id/role — change a user's role
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body
  if (!['admin', 'trainer', 'client'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role })
})

// DELETE /api/admin/users/:id — remove a user
router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete your own account' })
  }
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'User deleted successfully' })
})

// GET /api/admin/stats — summary counts
router.get('/stats', async (req, res) => {
  const [totalUsers, totalAdmins, totalTrainers, totalClients] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'trainer' }),
    User.countDocuments({ role: 'client' }),
  ])
  res.json({ totalUsers, totalAdmins, totalTrainers, totalClients })
})

export default router