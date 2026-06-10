import express from 'express'
import DietPlan from '../models/dietPlanModel.js'
import User from '../models/userModel.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

// GET /api/diet-plans — trainer/admin sees all their plans; client sees their own
router.get('/', protect, async (req, res) => {
  let plans

  if (req.user.role === 'client') {
    plans = await DietPlan.find({ client_id: req.user._id })
      .populate('trainer_id', 'name')
      .lean()
  } else {
    // trainer or admin
    plans = await DietPlan.find({ trainer_id: req.user._id })
      .populate('client_id', 'name email')
      .lean()
  }

  res.json(plans.map(p => ({
    id: p._id,
    title: p.title,
    description: p.description,
    meals: p.meals,
    trainer_id: p.trainer_id?._id,
    trainer_name: p.trainer_id?.name,
    client_id: p.client_id?._id,
    client_name: p.client_id?.name,
    client_email: p.client_id?.email,
    createdAt: p.createdAt,
  })))
})

// POST /api/diet-plans — trainer/admin creates a plan for a client
router.post('/', protect, authorize('trainer', 'admin'), async (req, res) => {
  const { client_id, title, description, meals = [] } = req.body

  if (!client_id || !title) {
    return res.status(400).json({ message: 'client_id and title are required' })
  }

  const client = await User.findById(client_id)
  if (!client || client.role !== 'client') {
    return res.status(400).json({ message: 'Target user is not a client' })
  }

  const plan = await DietPlan.create({
    trainer_id: req.user._id,
    client_id,
    title,
    description,
    meals,
  })

  res.status(201).json({
    id: plan._id,
    title: plan.title,
    description: plan.description,
    meals: plan.meals,
    trainer_id: plan.trainer_id,
    client_id: plan.client_id,
    client_name: client.name,
    createdAt: plan.createdAt,
  })
})

// PUT /api/diet-plans/:id — update a plan
router.put('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const plan = await DietPlan.findById(req.params.id)
  if (!plan) return res.status(404).json({ message: 'Diet plan not found' })

  if (req.user.role !== 'admin' && plan.trainer_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this plan' })
  }

  plan.title = req.body.title ?? plan.title
  plan.description = req.body.description ?? plan.description
  plan.meals = req.body.meals ?? plan.meals
  await plan.save()

  res.json({
    id: plan._id,
    title: plan.title,
    description: plan.description,
    meals: plan.meals,
    trainer_id: plan.trainer_id,
    client_id: plan.client_id,
    createdAt: plan.createdAt,
  })
})

// DELETE /api/diet-plans/:id
router.delete('/:id', protect, authorize('trainer', 'admin'), async (req, res) => {
  const plan = await DietPlan.findById(req.params.id)
  if (!plan) return res.status(404).json({ message: 'Diet plan not found' })

  if (req.user.role !== 'admin' && plan.trainer_id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this plan' })
  }

  await plan.deleteOne()
  res.json({ message: 'Diet plan deleted successfully' })
})

export default router