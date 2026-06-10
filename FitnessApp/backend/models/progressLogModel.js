import mongoose from 'mongoose'

const progressLogSchema = new mongoose.Schema(
  {
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weight: { type: Number },
    calories: { type: Number },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

const ProgressLog = mongoose.models.ProgressLog || mongoose.model('ProgressLog', progressLogSchema)
export default ProgressLog
