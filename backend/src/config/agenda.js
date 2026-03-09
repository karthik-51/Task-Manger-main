
const Agenda = require('agenda');

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: "jobs",
  },
  processEvery: "30 seconds",
  maxConcurrency: 20,
});

module.exports = agenda;
