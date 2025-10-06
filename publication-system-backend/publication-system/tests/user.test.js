const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index"); // Adjust this to your app's entry point
const User = require("../models/usermodel"); // Path to your user model

// Setup before all tests
beforeAll(async () => {
  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  // Clear any existing users
  await User.deleteMany({});

  // Seed initial user data
  await User.create([
    {
      _id: mongoose.Types.ObjectId("67d997ab5b650d8024ad7999"),
      name: "Jane Doe",
      email: "jane@example.com",
      password: "testpassword", // Ideally hashed in real scenarios
      role: "author"
    },
  ]);
});

// Cleanup after all tests
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

// Test suite for User API
describe("Users API", () => {
  it("should fetch all users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].email).toBe("jane@example.com");
  });

  it("should add a new user", async () => {
    const newUser = {
      name: "John Smith",
      email: "john@example.com",
      password: "password123",
      role: "admin"
    };

    const res = await request(app).post("/users/add").send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("John Smith");
    expect(res.body.role).toBe("admin");
  });

  it("should return a 404 for an invalid route", async () => {
    const res = await request(app).get("/invalid-user-route");
    expect(res.statusCode).toBe(404);
  });
});
