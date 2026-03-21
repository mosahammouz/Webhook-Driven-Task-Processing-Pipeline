import { getChannel, connectRabbitMQ } from "./rabbitmq";
import { proccessJob } from "./processjob";
import { deliverToSubscribers } from "./delivery";

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

      const updatedJob = await proccessJob(job);
      await deliverToSubscribers(updatedJob!);

      // Acknowledge to RabbitMQ that the job is done
      channel.ack(msg);
      console.log("Job completed:", job.id);
    } catch (err) {
      console.error("Error processing job:", err);
      // optionally, reject and requeue
      channel.nack(msg, false, true);
    }
  });
}

startWorker().catch(console.error);