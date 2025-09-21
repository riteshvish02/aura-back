require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Year = require('./models/year');
const Branch = require('./models/branch');
const Section = require('./models/section');
const Student = require('./models/student');
const User = require('./models/user');
const WeeklySchedule = require('./models/weeklySchedule');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing data
  await Promise.all([
    Year.deleteMany({}),
    Branch.deleteMany({}),
    Section.deleteMany({}),
    Student.deleteMany({}),
    User.deleteMany({}),
    WeeklySchedule.deleteMany({}),
  ]);

  // Create Year
  const year1 = await Year.create({ name: 'First Year' });
  const year2 = await Year.create({ name: 'Second Year' });

  // Create Branch
  const branch1 = await Branch.create({ name: 'CSE', year: year1._id });
  const branch2 = await Branch.create({ name: 'ECE', year: year2._id });

  // Create Section
  const sectionA = await Section.create({ name: 'A', branch: branch1._id });
  const sectionB = await Section.create({ name: 'B', branch: branch2._id });

  // Create Teacher Users
  const teacher1 = await User.create({
    userName: 'teacher1',
    email: 'teacher1@example.com',
    password: 'password123',
    role: 'teacher',
  });
  const teacher2 = await User.create({
    userName: 'teacher2',
    email: 'teacher2@example.com',
    password: 'password123',
    role: 'teacher',
  });

  // Create Students
  const student1 = await Student.create({
    name: 'Alice',
    rollNo: 'CSE001',
    branch: branch1._id,
    year: year1._id,
    section: sectionA._id,
  });
  const student2 = await Student.create({
    name: 'Bob',
    rollNo: 'ECE001',
    branch: branch2._id,
    year: year2._id,
    section: sectionB._id,
  });

  // Create WeeklySchedule for full week (Monday to Saturday), 5 classes per day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const subjects = ['DSA', 'OOPS', 'ESE', 'DSA', 'OOPS'];
  const week = days.map(day => ({
    day,
    classes: Array.from({ length: 5 }).map((_, idx) => ({
      startTime: `${9 + idx}:00`,
      endTime: `${10 + idx}:00`,
      subject: subjects[idx % subjects.length],
      teacher: idx % 2 === 0 ? teacher1._id : teacher2._id,
    }))
  }));

  await WeeklySchedule.create({
    year: year1._id,
    branch: branch1._id,
    section: sectionA._id,
    week,
  });

  console.log('Seeding completed!');
  mongoose.disconnect();
}

seed();
