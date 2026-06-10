// import bcrypt from 'bcryptjs'
// import dotenv from 'dotenv'
// import { connectDB } from './db/mongo.js'
// import User from './models/userModel.js'

// dotenv.config({ path: './secrets.env' })

// const users = [
//   {
//     name: 'Ayesha Khan',
//     email: 'ayesha.khan@example.com',
//     password: 'Ayesha123!',
//     role: 'admin',
//   },
//   {
//     name: 'Bilal Ahmed',
//     email: 'bilal.ahmed@example.com',
//     password: 'Bilal123!',
//     role: 'trainer',
//   },
//   {
//     name: 'Zoya Malik',
//     email: 'zoya.malik@example.com',
//     password: 'Zoya123!',
//     role: 'client',
//   },
//   {
//     name: 'Faisal Ali',
//     email: 'faisal.ali@example.com',
//     password: 'Faisal123!',
//     role: 'client',
//   },
//   {
//     name: 'Sadia Noor',
//     email: 'sadia.noor@example.com',
//     password: 'Sadia123!',
//     role: 'trainer',
//   },
// ]

// const seedUsers = async () => {
//   try {
//     await connectDB()
//     console.log('Clearing existing users...')
//     await User.deleteMany({})

//     const userDocs = []
//     for (const user of users) {
//       const passwordHash = await bcrypt.hash(user.password, 10)
//       userDocs.push({
//         name: user.name,
//         email: user.email,
//         passwordHash,
//         role: user.role,
//       })
//     }

//     await User.insertMany(userDocs)
//     console.log(`Seeded ${userDocs.length} users successfully.`)
//     process.exit(0)
//   } catch (error) {
//     console.error('Seed error:', error)
//     process.exit(1)
//   }
// }

// seedUsers()
