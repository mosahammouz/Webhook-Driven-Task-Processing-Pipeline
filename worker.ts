
import { getPendingJobs } from "./src/db/pipelines.js";
import { proccessJob } from "./processjob.js";
import { job } from "./src/types.js";
import { jobs } from "./src/db/schema.js";

const POLL_INTERVAL = 2000;

async function workerLoop() {
  console.log("Worker started, polling for jobs...");

  while (true) {
    try {
      const jobsPending: job[] = await getPendingJobs();
      for (const currentJob of jobsPending) {
        console.log("Processing job id:", currentJob.id);
        await proccessJob(currentJob);
      }
      if(jobsPending.length > 0) console.log("Finished background task");
    } catch (err) {
      console.error("Worker error:", err);
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL)); //r is resolve() "means it is completed successfully"
      
  }
}

workerLoop();