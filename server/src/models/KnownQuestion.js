import mongoose from 'mongoose';

// One document per interview question a user ticked "I can explain this".
// qid looks like "04_react:2:5" (topic : section index : question index).
const knownSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qid: { type: String, required: true, maxlength: 80 },
  },
  { timestamps: true }
);

knownSchema.index({ user: 1, qid: 1 }, { unique: true });

export const KnownQuestion = mongoose.model('KnownQuestion', knownSchema);
