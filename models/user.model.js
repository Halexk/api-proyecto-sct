const { model, Schema }= require('mongoose');

const userSchema = new Schema ({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures unique email addresses
    trim: true,
    lowercase: true, // Ensures emails are stored in lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforces minimum password length for security
  },
  // Add additional fields as needed
  role: {
    type: String,
    enum: ['admin', 'user'], // Defines allowed roles (optional)
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of user creation
  },
  tokens: {
    type: [
      {
        token: {
          type: String,
          required: true,
        },
        // Add additional token-related fields as needed
        // (e.g., expiration time, type, revoked)
      },
    ],
    default: [], // Initialize with an empty array
  },
});

module.exports = model('User', userSchema);