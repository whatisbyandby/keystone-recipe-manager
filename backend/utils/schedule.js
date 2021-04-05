const cron = require('node-cron');
const createSchedule = require('./createSchedule');

const schedule = (keystone) => {
  console.log('Scheduling Tasks');
  cron.schedule('* * * * *', () => {
    createSchedule(keystone);
  });
};

module.exports = schedule;
