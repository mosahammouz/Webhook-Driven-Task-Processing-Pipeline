import { promises } from "node:dns";
import {ActionType, pipeline , job, Subscriber}from "../types.js"
import { db } from "./index.js"
import { pipelines as pipelinesTable  , jobs as jobsTable , subscribers as subscribersTable , deliveryAttempts as deliveryAttemptsTable , idempotencyKeys as idempotencyKeysTable} from "./schema.js";
import { eq ,sql} from "drizzle-orm";

export async function createPipeline(newPipeline: pipeline): Promise<pipeline> {

 await db
    .insert(pipelinesTable)
    .values({
      id: newPipeline.id,
      webhookPath: newPipeline.webhookPath,
      actionType: newPipeline.actionType,
      actionConfig: newPipeline.actionConfig,
      createdAt: newPipeline.createdAt,
    });

  return newPipeline;
}

export async function getPipelineByPath(path: string){
  const [pipelineRow] = await db.select().from(pipelinesTable).where(eq(pipelinesTable.webhookPath,path)).limit(1);
  return pipelineRow;
}

export async function createJob(newJob: job):Promise<job>{
   await db.insert(jobsTable).values({
    id: newJob.id,
    pipelineId: newJob.pipelineId,
    payload: newJob.payload,
    status: newJob.status,
    attempts: newJob.attempts,
    createdAt: newJob.createdAt,
   });
   return newJob;
}
  
export async function getPendingJobs(): Promise<job[]> {
  const rows = await db.select().from(jobsTable).where(eq(jobsTable.status, "pending"));

  // Map DB rows to `job` type
  return rows.map(r => ({
    id: r.id,
    pipelineId: r.pipelineId,
    payload: r.payload as Record<string, any>, // cast unknown → Record<string, any>
    status: r.status,
    attempts: r.attempts,
    createdAt: r.createdAt ?? new Date(),
  }));
}

export async function markJobCompleted(id: string) {
  await db.update(jobsTable).set({status: "completed",}).where(eq(jobsTable.id, id));
}
export async function markJobFailed(id: string) {
  await db.update(jobsTable).set({status: "failed",}).where(eq(jobsTable.id, id));
}

export async function getPipelineById(id: string): Promise<pipeline | null> {
  const [row] = await db.select().from(pipelinesTable).where(eq(pipelinesTable.id, id));
  if (!row) return null;
  return {
    ...row,
    actionConfig: row.actionConfig as Record<string, any>, // casting due to unknow
    createdAt: row.createdAt ? new Date(row.createdAt) : null,
  } as pipeline;
}
export async function incrementJobAttempts(id: string) {
  await db.update(jobsTable).set({attempts: sql`${jobsTable.attempts} + 1`,status: "pending",}).where(eq(jobsTable.id, id));
}
export async function updateJobPayload(jobId: string, payload: Record<string, any>) {
  try {
    const result = await db.update(jobsTable).set({ payload }).where(eq(jobsTable.id, jobId));

    return result; //  number of rows updated
  } catch (err) {
    console.error("Failed to update job payload for jobId:", jobId, err);
    throw err;
  }
}

export async function createSubscriber(newSub: Subscriber){
   const ins = await db.insert(subscribersTable).values({
    pipelineId: newSub.pipelineId,
    url: newSub.url,
    status: newSub.status
  }).returning();
  return ins[0];
}

export async function getSubscriperByPipelineId(pipelineId: string){
  return await db.select().from(subscribersTable).where(eq( subscribersTable.pipelineId, pipelineId));
}
export async function putInDeliveryAttemptsTable(jobId: string , subId: number , attempts: number , status: "success" | "failed"){
  await db.insert(deliveryAttemptsTable).values({
    jobId: jobId,
    subscriberId: subId,
    attemptsNumber: attempts,
    status: status,
  })
}

export async function hasIdempotenctyKey(key: string) {
 const result = await db
    .select()
    .from(idempotencyKeysTable)
    .where(eq(idempotencyKeysTable.key, key))
    .execute();

  return result[0]; // return the first row or undefined
  }

export async function saveIdempotencyKey(key: string, jobId: string) {
  return db.insert(idempotencyKeysTable).values({ key, jobId, status: "processing" }); 
}

export async function updateIdempotencyKeyStatus(key: string, status: "processing" | "completed" | "failed") {
  return db
    .update(idempotencyKeysTable)
    .set({ status })
    .where(eq(idempotencyKeysTable.key, key));
}