require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const bcrypt = require('bcrypt');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Event.deleteMany({});

  const pw = await bcrypt.hash('password123', 10);
  const u = new User({ name: 'Alice', email: 'alice@example.com', password: pw, college: 'ABC College', year: '3' });
  await u.save();

  const e1 = new Event({
    title: 'NextGen Hackathon',
    description: '24-hr hack',
    type: 'Hackathon',
    location: 'Mumbai',
    isOnline: false,
    address: 'Some college',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11),
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
    registrationLink: 'https://example.com/register',
    postedBy: u._id
  });
  await e1.save();

  console.log('Seed complete');
  process.exit();
}

seed().catch(err => console.error(err));
