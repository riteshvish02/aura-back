const express = require('express');
const router = express.Router();

// Hardcoded daily attendance API
router.get('/daily-attendance', (req, res) => {
  const dailyAttendanceData = [
    {
      day: "Monday",
      classes: [
        { subject: "DSA", time: "09:00 - 10:00", attended: true },
        { subject: "Maths", time: "10:15 - 11:15", attended: false },
        { subject: "OS", time: "11:30 - 12:30", attended: true },
      ],
    },
    {
      day: "Tuesday",
      classes: [
        { subject: "Maths", time: "09:00 - 10:00", attended: true },
        { subject: "DSA", time: "10:15 - 11:15", attended: true },
        { subject: "OS", time: "11:30 - 12:30", attended: false },
      ],
    },
    {
      day: "Wednesday",
      classes: [
        { subject: "OS", time: "09:00 - 10:00", attended: true },
        { subject: "DSA", time: "10:15 - 11:15", attended: false },
        { subject: "Maths", time: "11:30 - 12:30", attended: true },
      ],
    },
    {
      day: "Thursday",
      classes: [
        { subject: "DSA", time: "09:00 - 10:00", attended: true },
        { subject: "Maths", time: "10:15 - 11:15", attended: true },
        { subject: "OS", time: "11:30 - 12:30", attended: false },
      ],
    },
    {
      day: "Friday",
      classes: [
        { subject: "Maths", time: "09:00 - 10:00", attended: false },
        { subject: "DSA", time: "10:15 - 11:15", attended: true },
        { subject: "OS", time: "11:30 - 12:30", attended: true },
      ],
    },
    {
      day: "Saturday",
      classes: [
        { subject: "OS", time: "09:00 - 10:00", attended: true },
        { subject: "DSA", time: "10:15 - 11:15", attended: true },
        { subject: "Maths", time: "11:30 - 12:30", attended: false },
      ],
    },
  ];
  res.json({ data: dailyAttendanceData });
});

module.exports = router;
