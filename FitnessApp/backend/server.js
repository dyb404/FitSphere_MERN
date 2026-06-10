import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import 'express-async-errors'

dotenv.config({ path: './secrets.env' })
import { connectDB } from './db/mongo.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import assignmentRoutes from './routes/assignmentRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import healthTipRoutes from './routes/healthTipRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import dietPlanRoutes from './routes/dietPlanRoutes.js'
import classRoutes from './routes/classRoutes.js'


const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'FitSphere API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      workouts: '/api/workouts',
      assignments: '/api/assignments',
      progress: '/api/progress',
      'health-tips': '/api/health-tips',
    },
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/health-tips', healthTipRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/diet-plans', dietPlanRoutes)
app.use('/api/classes', classRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({ message: err.message || 'Server Error' })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
})