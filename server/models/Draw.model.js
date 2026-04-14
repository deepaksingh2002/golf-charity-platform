import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema({
  month: { 
    type: String, 
    required: true 
    
  },
  drawnNumbers: [{ 
    type: Number, 
    min: 1, 
    max: 45 
    
  }],
  drawType: { 
    type: String, 
    enum: ['random', 'algorithmic'],
    default: 'random'
  },
  status: { 
    type: String, 
    enum: ['draft', 'simulated', 'published'],
    default: 'draft'
  },
  prizePool: {
    total: { 
      type: Number, 
      default: 0 

    },
    threeMatch: {
      type: Number,
      default: 0
    },
    fiveMatch: { 
      type: Number, 
      default: 0 
      
    },
    fourMatch: { 
      type: Number, 
      default: 0 

    }
  },
  jackpotRolledOver: { 
    type: Number, 
    default: 0 
  },

  winners: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 

      },
      matchCount: { 
        type: Number 

      },
      prizeAmount: { 
        type: Number 

      },
      paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid'], 
        default: 'pending' 
      },
      proofUrl: { 
        type: String 
      }
    }
],

  participantCount: { 
    type: Number 
  },

  publishedAt: { 
    type: Date 
  },

  auditProof: {
    url: {
      type: String
    },
    uploadedAt: {
      type: Date
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }

}, {
  timestamps: true
});

export default mongoose.model('Draw', drawSchema);
