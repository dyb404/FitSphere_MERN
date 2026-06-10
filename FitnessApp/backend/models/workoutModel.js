import mongoose from 'mongoose'

const workoutSchema = new mongoose.Schema(
  {
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
)

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema)
export default Workout
