import { getPipelineById, updateJobPayload, markJobCompleted, markJobFailed, incrementJobAttempts } from "./db/pipelines.js";
import { job } from "./types.js";
import { ProcessorFactory } from "./processors/factory.js";

export async function processJob(currentJob: job) {
  const pipeline = await getPipelineById(currentJob.pipelineId);
  if (!pipeline) {
    console.log("Pipeline not found for job(id):", currentJob.id);
    return;
  }

  const processor = ProcessorFactory.getProcessor(pipeline.actionType);
  if (!processor) {
    console.log("No processor registered for actionType:", pipeline.actionType);
    return;
  }

  try {
    const updatedPayload = await processor.process(currentJob.payload, pipeline.actionConfig);//like filterPrice.process()

    await updateJobPayload(currentJob.id, updatedPayload);
    await markJobCompleted(currentJob.id);

    return { ...currentJob, payload: updatedPayload };
  } catch (err) {
    console.error(`Error processing job ${currentJob.id}:`, err);

    await incrementJobAttempts(currentJob.id);

    if (currentJob.attempts + 1 >= 5) {
      await markJobFailed(currentJob.id);
      console.log("Job marked as failed after max attempts:", currentJob.id);
    }
  }
}