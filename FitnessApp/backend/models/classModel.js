import mongoose from 'mongoose'

const classSchema = new mongoose.Schema(
  {
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    datetime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    capacity: { type: Number, default: 20 },
    location: { type: String, trim: true },
    enrolledClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

const GymClass = mongoose.models.GymClass || mongoose.model('GymClass', classSchema)
export default GymClass