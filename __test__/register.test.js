const request = require("supertest");
const app = require("../src/app");

describe("POST /v1/api/register", () => {
  it("should allow max 5 requests then block with 429", async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post("/v1/api/register")
        .send({
          email: `user${i}@example.com`,
          password: "123456",
        });
      expect(res.statusCode).not.toBe(429);
    }

    const res6 = await request(app).post("/v1/api/register").send({
      email: "user6@example.com",
      password: "123456",
    });
    expect(res6.statusCode).toBe(429);
    expect(res6.body.message).toBe("Too much request, please try later!");
  });
});
const mongoose = require("mongoose");
afterAll(async () => {
  await mongoose.connection.close();
});
