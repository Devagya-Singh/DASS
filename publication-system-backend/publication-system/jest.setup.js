const mongoose = require("mongoose");

// Close the MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
