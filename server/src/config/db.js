import mongoose from 'mongoose';

// Connects Mongoose to MongoDB once, when the server starts.
export async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is missing. Copy server/.env.example to server/.env and set it.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
