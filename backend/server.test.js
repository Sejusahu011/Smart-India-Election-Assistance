const request = require("supertest");
const app = require("./server");

describe("Backend API Tests", () => {
  it("should return a successful health check on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("ElectionVerse Backend Running");
  });

  it("should return 400 if message is missing on POST /api/chat", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ language: "English" });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Message required");
  });
});
