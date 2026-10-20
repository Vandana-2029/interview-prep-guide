import { createApp } from './app.js';
import { connectDB } from './config/db.js';

// Entry point: connect to MongoDB first, then start listening for requests.
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and set it.');
  process.exit(1);
}

try {
  await connectDB(process.env.MONGO_URI);
  createApp().listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Could not start the server:', err.message);
  process.exit(1);
}
