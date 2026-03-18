const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
  },
  env: {
    email: "havmore75@gmail.com",
    password: "Qwerty@786",
  },
});