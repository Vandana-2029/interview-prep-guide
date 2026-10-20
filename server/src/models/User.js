import mongoose from 'mongoose';

// One document per person who signs up.
// We never store the real password, only a bcrypt hash of it.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // hidden from queries unless asked for
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// What we send to the browser: never the hash.
userSchema.methods.toPublic = function () {
  return { id: this._id.toString(), name: this.name, email: this.email };
};

export const User = mongoose.model('User', userSchema);
