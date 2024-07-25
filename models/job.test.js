"use strict";
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newJob = {
    title: "new",
    salary: 150,
    equity: "0.75",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      title: "new",
      salary: 150,
      equity: "0.75",
      companyHandle: "c1",
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "TestJob1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
        id: expect.any(Number),
      },
      {
        title: "TestJob2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
        id: expect.any(Number),
      },
    ]);
  });
});

test("works: filter by title", async function () {
  let jobs = await Job.findAll({ title: "TestJob2" });
  expect(jobs).toEqual([
    {
      title: "TestJob2",
      salary: 200,
      equity: "0.2",
      companyHandle: "c2",
      companyName: "C2",
      id: expect.any(Number),
    },
  ]);
});

test("works: filter by minSalary", async function () {
  let jobs = await Job.findAll({ minSalary: 150 });
  expect(jobs).toEqual([
    {
      title: "TestJob2",
      salary: 200,
      equity: "0.2",
      companyHandle: "c2",
      companyName: "C2",
      id: expect.any(Number),
    },
  ]);
});

test("works: filter by hasEquity", async function () {
  let jobs = await Job.findAll({ hasEquity: true });
  expect(jobs).toEqual([
    {
      title: "TestJob1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
      companyName: "C1",
      id: expect.any(Number),
    },
    {
      title: "TestJob2",
      salary: 200,
      equity: "0.2",
      companyHandle: "c2",
      companyName: "C2",
      id: expect.any(Number),
    },
  ]);
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      title: "TestJob1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
      id: expect.any(Number),
      company: {
        description: "Desc1",
        handle: "c1",
        logoUrl: "http://c1.img",
        name: "C1",
        numEmployees: 1,
      },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "NewJob3",
    salary: 300,
    equity: "0.3",
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: expect.any(Number),
      companyHandle: "c1",
      ...updateData,
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query("SELECT id FROM jobs WHERE id=$1", [jobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
