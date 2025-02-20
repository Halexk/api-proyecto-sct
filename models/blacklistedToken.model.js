const { model, Schema }= require('mongoose');

const blacklistSchema = new Schema({
    token: {
      type: String,
      required: true,
      unique: true, // Ensures only one token can be blacklisted with the same value
    },
    revokedAt: {
      type: Date,
      default: Date.now, // Timestamp of token revocation
    },
  });
  
  module.exports = model('BlacklistedToken', blacklistSchema);