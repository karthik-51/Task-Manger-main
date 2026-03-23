

// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const agenda = require("../src/config/agenda");

// let mongo;

// beforeAll(async () => {
//   // Start in-memory MongoDB
//   mongo = await MongoMemoryServer.create();
//   const uri = mongo.getUri();

//   // Connect mongoose
//   await mongoose.connect(uri);
// });

// afterEach(async () => {
//   const collections = mongoose.connection.collections;

//   for (const key in collections) {
//     await collections[key].deleteMany();
//   }
// });

// afterAll(async () => {
//   // Close DB
//   await mongoose.connection.close();

//   // Stop Mongo memory server
//   if (mongo) {
//     await mongo.stop();
//   }

//   // Stop agenda (VERY IMPORTANT)
//   if (agenda) {
//     await agenda.stop();
//   }
// });
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;
let agenda;

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
  process.env.ACCESS_EXPIRE = process.env.ACCESS_EXPIRE || "1h";
  process.env.REFRESH_EXPIRE = process.env.REFRESH_EXPIRE || "7d";

  await mongoose.connect(uri);

  agenda = require("../src/config/agenda");
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (agenda && agenda.stop) {
    await agenda.stop();
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  if (mongo) {
    await mongo.stop();
  }
});