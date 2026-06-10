import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/userModel.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' })
    }
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}
