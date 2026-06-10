import express from 'express'
import HealthTip from '../models/healthTipModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const tips = await HealthTip.find().lean()
  res.json(tips.map((tip) => ({
    id: tip._id,
    title: tip.title,
    content: tip.content,
  })))
})

router.post('/', protect, authorize('admin'), async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' })
  }
  const newTip = await HealthTip.create({ title, content })
  res.status(201).json({ id: newTip._id, title: newTip.title, content: newTip.content })
})

router.get('/:id', async (req, res) => {
  const tip = await HealthTip.findById(req.params.id).lean()
  if (!tip) {
    return res.status(404).json({ message: 'Health tip not found' })
  }
  res.json({ id: tip._id, title: tip.title, content: tip.content })
})

export default router
