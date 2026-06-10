import mongoose from 'mongoose'

const healthTipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

const HealthTip = mongoose.models.HealthTip || mongoose.model('HealthTip', healthTipSchema)
export default HealthTip
