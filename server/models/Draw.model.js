const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  month: { type: String, required: true },
  drawnNumbers: [{ type: Number, min: 1, max: 45 }],
  drawType: { type: String, enum: ['random', 'algorithmic'] },
  status: { type: String, enum: ['draft', 'simulated', 'published'] },
  prizePool: {
    total: { type: Number, default: 0 },
    fiveMatch: { type: Number, default: 0 },
    fourMatch: { type: Number, default: 0 },
    threeMatch: { type: Number, default: 0 }
  },
  jackpotRolledOver: { type: Number, default: 0 },
  winners: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchCount: { type: Number },
    prizeAmount: { type: Number },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    proofUrl: { type: String }
  }],
  participantCount: { type: Number },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Draw', drawSchema);
