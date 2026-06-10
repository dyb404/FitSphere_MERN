import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/userModel.js'

dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'client' } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  // Only allow elevated roles if an admin is making the request
  const requestingUser = req.user || null
  const isAdmin = requestingUser?.role === 'admin'
  const normalizedRole = isAdmin && ['admin', 'trainer', 'client'].includes(role) ? role : 'client'

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: normalizedRole,
  })

  const token = generateToken(user)
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    return res.status(401).json({ message: 'Incorrect email or password' })
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash)
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Incorrect email or password' })
  }

  const token = generateToken(user)
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' })
  }
})

export default router