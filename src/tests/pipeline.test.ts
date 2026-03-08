
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "../db/pipelines.js";
import { proccessJob } from "../processjob.js";
import type { job } from "../types.js";

vi.mock("../db/pipelines.js"); 

describe("proccessJob", () => {
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

    // Mock DB calls  // in other words you can control what it returns from database (fake returning)
    (db.getPipelineById as any).mockResolvedValue({
      actionType: "toUbberCase",
      actionConfig: { field: "text" },
    });
    (db.updateJobPayload as any).mockResolvedValue(true);
    (db.markJobCompleted as any).mockResolvedValue(true);

    const result = await proccessJob(jobTest);

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

    // Mock DB calls
    (db.getPipelineById as any).mockResolvedValue({
      actionType: "addTimesTamp",
      actionConfig: { field: "SentAT" },
    });
    (db.updateJobPayload as any).mockResolvedValue(true);
    (db.markJobCompleted as any).mockResolvedValue(true);

    const result = await proccessJob(jobTest);

    expect(result?.payload.SentAT).toBeDefined();
    expect(db.updateJobPayload).toHaveBeenCalledWith(jobTest.id, expect.objectContaining({ SentAT: expect.any(String) }));
    expect(db.markJobCompleted).toHaveBeenCalledWith(jobTest.id);
  });

  it("filterPrice fails job if price < min", async () => {
    const jobTest: job = {
      id: "job3",
      pipelineId: "pipe3",
      payload: { price: 50 },
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
    };

    (db.getPipelineById as any).mockResolvedValue({
      actionType: "filterPrice",
      actionConfig: { field: "price", min: 100 },
    });
    (db.markJobFailed as any).mockResolvedValue(true);

    const result = await proccessJob(jobTest);

    expect(result).toBeUndefined();
    expect(db.markJobFailed).toHaveBeenCalledWith(jobTest.id);
  });
});