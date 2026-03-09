// require("dotenv").config();
// const app = require("./app");
// const { connectDB } = require("./config/database");

// connectDB(process.env.MONGO_URI);

// app.listen(process.env.PORT, () =>
//   console.log(`Server running on port ${process.env.PORT}`)
// );

require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/database");

connectDB(); // no parameter needed

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);  
// require("dotenv").config();
// console.log("MONGO_URI =", process.env.MONGO_URI);

// const app = require("./app");
// const { connectDB } = require("./config/database");

// connectDB();

// app.listen(process.env.PORT || 5000, () =>
//   console.log(`Server running on port ${process.env.PORT || 5000}`)
// );