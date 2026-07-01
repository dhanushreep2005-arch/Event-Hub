const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  registrationDeadline: {
    type: Date
  },
  type: {
    type: String,
    enum: [
      'Hackathon',
      'Workshop',
      'Seminar',
      'Conference',
      'Meetup',
      'Other'
    ],
    default: 'Other'
  },
  customType: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  registrationLink: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EventSchema.virtual('displayType').get(function () {
  return (this.type === 'Other' && this.customType) ? this.customType : this.type;
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
