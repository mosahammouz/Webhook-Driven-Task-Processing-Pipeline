import { getChannel, connectRabbitMQ } from "./rabbitmq";
import { processJob } from "./processjob";
import { deliverToSubscribers } from "./delivery";
import { hasIdempotenctyKey , updateIdempotencyKeyStatus } from "./db/pipelines";
import "./processors/registerProcessors.js"
async function startWorker() {
  const channel = await connectRabbitMQ();

  // Prefetch one job at a time for simplicity
  channel.prefetch(1);

  console.log("RabbitMQ Worker started, waiting for jobs...");

channel.consume("jobs_queue", async (msg) => {
  if (!msg) return;

  try {
    const job = JSON.parse(msg.content.toString());
    console.log("Processing job id:", job.id);

    // ===== Idempotency check =====
    const existing = await hasIdempotenctyKey(job.idempotencyKey);
    if (existing?.status === "completed") {
      console.log("Job already processed, skipping:", job.id);
      channel.ack(msg);
      return;
    }

    const updatedJob = await processJob(job);
    await deliverToSubscribers(updatedJob!);

    await updateIdempotencyKeyStatus(job.idempotencyKey, "completed");

   

    channel.ack(msg);
    console.log("Job completed:", job.id);

  } catch (err) {
    console.error("Error processing job:", err);
    channel.nack(msg, false, true); // requeue for retry
  }
});
}

startWorker().catch(console.error);