
// const Agenda = require('agenda');

// const agenda = new Agenda({
//   db: {
//     address: process.env.MONGO_URI,
//     collection: "jobs",
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//   },
//   processEvery: "30 seconds",
//   maxConcurrency: 20,
// });

// module.exports = agenda;
const Agenda = require("agenda");

const mockAgenda = {
  define: () => {},
  every: async () => {},
  schedule: async () => ({ attrs: { _id: "mock-job-id" } }),
  cancel: async () => 0,
  start: async () => {},
  stop: async () => {},
  now: async () => ({ attrs: { _id: "mock-job-id" } }),
};

let agenda;

if (process.env.NODE_ENV === "test") {
  agenda = mockAgenda;
} else {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is required for Agenda");
  }

  agenda = new Agenda({
    db: {
      address: mongoUri,
      collection: "jobs",
    },
    processEvery: "30 seconds",
    maxConcurrency: 20,
  });
}

module.exports = agenda;