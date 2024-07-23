import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 5,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Custom validator function to check for @ symbol in the email
          return /\S+@\S+\.\S+/.test(value); // This regex checks for @ in the email
        },
        message: 'Please enter a valid email address', // Validation error message
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: [1, 2], // 1 = user, 2 = admin
      default: 1,
    },
    resetPasswordToken: {
      type: String,
      // required: true,
    },
    resetPasswordExpires: {
      type: Date,
    },
    hasReturnedCars: {
      type: Boolean,
      default: true,
    },
    hasPenalties: {
      type: Boolean,
      default: false,
    },
    penalties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Penalty' }],
  },
  {
    timestamps: true,
    versionKey: false, // Ensure versionKey is set to false
  }
);
userSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.EXPIRES_IN, // You can adjust the expiration time
    }
  );
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;
