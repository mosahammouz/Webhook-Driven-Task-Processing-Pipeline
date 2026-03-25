import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../db/pipelines.js";
import { processJob } from "../processjob.js";
import type { job } from "../types.js";
import "./../processors/registerProcessors.js"; // register processors first

vi.mock("../db/pipelines.js");

describe("processJob", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("toUbberCase converts text to uppercase", async () => {
    const jobTest: job = {
      id: "job1",
      pipelineId: "pipe1",
      payload: { text: "hello" },
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
    };

    (db.getPipelineById as any).mockResolvedValue({
      actionType: "toUbberCase",
      actionConfig: { field: "text" },
    });
    (db.updateJobPayload as any).mockResolvedValue(true);
    (db.markJobCompleted as any).mockResolvedValue(true);

    const result = await processJob(jobTest);

    expect(result?.payload.text).toBe("HELLO");
    expect(db.updateJobPayload).toHaveBeenCalledWith(jobTest.id, { text: "HELLO" });
    expect(db.markJobCompleted).toHaveBeenCalledWith(jobTest.id);
  });

  it("addTimesTamp adds timestamp field", async () => {
    const jobTest: job = {
      id: "job2",
      pipelineId: "pipe2",
      payload: { message: "hi" },
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
    };

    (db.getPipelineById as any).mockResolvedValue({
      actionType: "addTimesTamp",
      actionConfig: { field: "SentAT" },
    });
    (db.updateJobPayload as any).mockResolvedValue(true);
    (db.markJobCompleted as any).mockResolvedValue(true);

    const result = await processJob(jobTest);

    expect(result?.payload.SentAT).toBeDefined();
    expect(db.updateJobPayload).toHaveBeenCalledWith(
      jobTest.id,
      expect.objectContaining({ SentAT: expect.any(String) })
    );
    expect(db.markJobCompleted).toHaveBeenCalledWith(jobTest.id);
  });

 

  it("reverseString reverses the text field", async () => {
    const jobTest: job = {
      id: "job4",
      pipelineId: "pipe4",
      payload: { text: "Hello World" },
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
    };

    (db.getPipelineById as any).mockResolvedValue({
      actionType: "reverseString",
      actionConfig: { field: "text" },
    });
    (db.updateJobPayload as any).mockResolvedValue(true);
    (db.markJobCompleted as any).mockResolvedValue(true);

    const result = await processJob(jobTest);

    expect(result?.payload.text).toBe("dlroW olleH");
    expect(db.updateJobPayload).toHaveBeenCalledWith(jobTest.id, { text: "dlroW olleH" });
    expect(db.markJobCompleted).toHaveBeenCalledWith(jobTest.id);
  });
});