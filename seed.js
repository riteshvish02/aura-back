const mongoose = require('mongoose');
const Branch = require('./models/branch');
const Section = require('./models/section');
const Year = require('./models/year');
const User = require('./models/user');

async function seed() {
  // ...existing code...

  // ...existing code...
  // ...existing code...
  // ...existing code...
  await mongoose.connect('mongodb+srv://rv504263_db_user:aura@cluster0.x7rwvku.mongodb.net/');

  // Delete all existing data
  const Subject = require('./models/subject');
  const Student = require('./models/student');
  const WeeklySchedule = require('./models/weeklySchedule');
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Section.deleteMany({}),
    Year.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    WeeklySchedule.deleteMany({})
    // Do NOT delete ClassSession or Attendance
  ]);

  // Create Year
  const year = await Year.create({ name: '2025' });

  // Create Branch
  const branch = await Branch.create({ name: 'CSE', year: year._id });

  // Create Section
  const section = await Section.create({ name: 'A', branch: branch._id });

  // Create Subjects
  const subjectDSA = await Subject.create({ name: 'DSA' });
  const subjectMaths = await Subject.create({ name: 'Maths' });
  const subjectOS = await Subject.create({ name: 'OS' });

  // Create Teacher
  const teacher = await User.create({
    userName: 'teacher2',
    email: 'teacher2@example.com',
    password: 'password123',
    role: 'teacher',
    branch: branch._id,
    section: section._id,
    year: year._id
  });

  // Create Students
  // ...existing code...

  // Do NOT seed ClassSession or Attendance here
  const student1 = await Student.create({
    name: 'Student One',
    rollNo: 'CSE2025001',
    branch: branch._id,
    section: section._id,
    year: year._id
  });
  const student2 = await Student.create({
    name: 'Student Two',
    rollNo: 'CSE2025002',
    branch: branch._id,
    section: section._id,
    year: year._id
  });
  const student3 = await Student.create({
    name: 'Student Three',
    rollNo: 'CSE2025003',
    branch: branch._id,
    section: section._id,
    year: year._id
  });

  // Create Weekly Schedule
  const week = [
    {
      day: 'Monday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'DSA', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'Maths', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'OS', teacher: teacher._id }
      ]
    },
    {
      day: 'Tuesday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'Maths', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'DSA', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'OS', teacher: teacher._id }
      ]
    },
    {
      day: 'Wednesday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'OS', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'DSA', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'Maths', teacher: teacher._id }
      ]
    },
    {
      day: 'Thursday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'DSA', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'Maths', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'OS', teacher: teacher._id }
      ]
    },
    {
      day: 'Friday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'Maths', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'DSA', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'OS', teacher: teacher._id }
      ]
    },
    {
      day: 'Saturday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'OS', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'DSA', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'Maths', teacher: teacher._id }
      ]
    },
    {
      day: 'Sunday',
      classes: [
        { startTime: '09:00', endTime: '10:00', subject: 'OS', teacher: teacher._id },
        { startTime: '10:15', endTime: '11:15', subject: 'DSA', teacher: teacher._id },
        { startTime: '11:30', endTime: '12:30', subject: 'Maths', teacher: teacher._id }
      ]
    }
  ];
  await WeeklySchedule.create({ year: year._id, branch: branch._id, section: section._id, week });

  console.log('Seeded:', { year, branch, section, subjects: [subjectDSA, subjectMaths, subjectOS], teacher, students: [student1, student2, student3] });
  mongoose.disconnect();
}

seed();
