const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index"); // Ensure this points to your entry file (e.g., index.js)
const Publication = require("../models/Publication"); // Ensure this points to your publication model

// Run setup tasks before all tests
beforeAll(async () => {
  // Connect to the test database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test-db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  // Clear the collection before seeding
  await Publication.deleteMany({});

  // Seed the database with initial data
  await Publication.create([
    {
      _id: mongoose.Types.ObjectId("67d997ab5b650d8024ad7844"), // Fixed ObjectId reference
      title: "Sample Publication",
      authors: ["Author One", "Author Two"],
      category: "Science",
      year: 2022,
      openAccess: true,
      impactFactor: 8.0,
      downloadLinks: {
        pdf: "https://example.com/sample.pdf",
      },
    },
  ]);
});

// Clean up tasks after all tests
afterAll(async () => {
  await Publication.deleteMany({}); // Clear the collection
  await mongoose.connection.close(); // Close the database connection
});

// Test suite for Publications API
describe("Publications API", () => {
  it("should fetch all publications", async () => {
    const res = await request(app).get("/publications");
    expect(res.statusCode).toBe(200); // Ensure the request was successful
    expect(Array.isArray(res.body)).toBe(true); // Validate response is an array
    expect(res.body.length).toBe(1); // Ensure the seeded data is fetched correctly
    expect(res.body[0].title).toBe("Sample Publication"); // Validate title
  });

  it("should add a new publication", async () => {
    const newPublication = {
      _id: "67d997ab5b650d8024ad7844",
      title: "Test Publication",
      authors: ["Test Author"],
      category: "Test Category",
      year: 2022,
      openAccess: true,
      impactFactor: 8.0,
      downloadLinks: { pdf: "https://example.com/pdf" },
    };

    const res = await request(app).post("/publications/add").send(newPublication);
    expect(res.statusCode).toBe(201); // Ensure the POST request was successful
    expect(res.body.title).toBe("Test Publication"); // Validate the response data
    expect(res.body.authors).toContain("Test Author"); // Check if authors match
  });

  it("should return a 404 for a non-existent route", async () => {
    const res = await request(app).get("/invalid-route");
    expect(res.statusCode).toBe(404); // Ensure the route returns 404
  });
});
