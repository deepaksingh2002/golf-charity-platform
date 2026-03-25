const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  imageUrl: { type: String },
  galleryImages: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  upcomingEvents: [{
    title: { type: String },
    date: { type: Date },
    description: { type: String }
  }],
  totalReceived: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Charity', charitySchema);
