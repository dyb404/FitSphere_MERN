import mongoose from 'mongoose'

const dietPlanSchema = new mongoose.Schema(
  {
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    meals: [
      {
        mealName: { type: String, required: true, trim: true },
        time: { type: String, trim: true },
        foods: { type: String, required: true, trim: true },
        calories: { type: Number },
        notes: { type: String, trim: true },
      }
    ],
  },
  { timestamps: true }
)

const DietPlan = mongoose.models.DietPlan || mongoose.model('DietPlan', dietPlanSchema)
export default DietPlan