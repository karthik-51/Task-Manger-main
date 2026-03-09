require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/database");
const agenda = require("./config/agenda");
require("./jobs/taskNotification.job"); 

connectDB();

agenda.on("ready", () => {
  agenda.start();
  console.log("Agenda job scheduler started");
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
