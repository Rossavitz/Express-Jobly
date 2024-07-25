"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token,
  jobId,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New Job",
    salary: 100,
    equity: "0.5",
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
      job: {
        title: "New Job",
        salary: 100,
        equity: "0.5",
        companyHandle: "c1",
        id: expect.any(Number),
      },
    });
  });

  test("NOT ok for user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        Salary: "not-an-int",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Test Job",
          salary: 100,
          equity: "0.5",
          companyHandle: "c1",
          companyName: "C1",
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobId[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Test Job",
        salary: 100,
        equity: "0.5",
        companyHandle: "c1",
        company: {
          handle: "c1",
          name: "C1",
          numEmployees: 1,
          description: "Desc1",
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId[0]}`)
      .send({
        title: "Job-new",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Job-new",
        salary: 100,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app).patch(`/jobs/${jobId[0]}`).send({
      name: "Job-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on companyHandle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId[0]}`)
      .send({
        companyHandle: "companyHandle-new",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobId[0]}`)
      .send({
        salary: "not-a-num",
      })
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobId[0]}`)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ deleted: `${jobId[0]}` });
  });
  test("unauth for non-admin", async function () {
    const resp = await request(app).delete(`/jobs/${jobId[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
