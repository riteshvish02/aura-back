// Script to fix all ClassSession dates to IST midnight for the correct day
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const ClassSession = require('../models/classSession');
const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // <-- Change to your DB name

async function fixDates() {
  await mongoose.connect(MONGO_URI);
  const sessions = await ClassSession.find({});
  for (const session of sessions) {
    // Convert session.date to IST midnight
    const istMidnight = dayjs(session.date).tz('Asia/Kolkata').startOf('day').toDate();
    session.date = istMidnight;
    await session.save();
    console.log(`Fixed session ${session._id}: date set to ${istMidnight}`);
  }
  await mongoose.disconnect();
  console.log('All ClassSession dates fixed to IST midnight.');
}

fixDates();
