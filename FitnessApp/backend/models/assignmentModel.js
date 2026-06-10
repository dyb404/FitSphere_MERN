import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema(
  {
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
  },
  { timestamps: true }
)
assignmentSchema.index({ client_id: 1, workout_id: 1 }, { unique: true })

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema)
export default Assignment
