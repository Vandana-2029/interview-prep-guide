import mongoose from 'mongoose';

// One document per (user, problem) that the user has touched.
//   solvedOn = "YYYY-MM-DD" in the user's own time zone, or null if not solved
//   revise   = the user starred it to revise later
// A problem the user never touched has no document at all, which keeps the collection small.
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true }, // stable id of the problem, e.g. "two-sum|faqs-medium"
    solvedOn: { type: String, default: null, match: /^\d{4}-\d{2}-\d{2}$/ },
    revise: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user can have only one document per problem, and "all progress of user X" is a fast lookup.
progressSchema.index({ user: 1, key: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
