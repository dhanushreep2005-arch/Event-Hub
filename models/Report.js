const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },

  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  message: { 
    type: String, 
    default: 'Broken registration link' 
  },

  status: { 
    type: String, 
    enum: ['Pending', 'Resolved'], 
    default: 'Pending' 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  resolvedAt: { 
    type: Date 
  }
});

module.exports = mongoose.model('Report', ReportSchema);
