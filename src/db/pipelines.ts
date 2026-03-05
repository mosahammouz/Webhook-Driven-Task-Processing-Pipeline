import {ActionType, pipeline}from "../types.js"
import { db } from "./index.js"
import { pipelines as pipelinesTable } from "./schema.js";
import { eq } from "drizzle-orm";
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