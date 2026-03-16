import axios from "axios";
import { job } from "./src/types";
import { getSubscriperByPipelineId,putInDeliveryAttemptsTable } from "./src/db/pipelines";
import { jobs } from "./src/db/schema";
const   MAX_ATTEMPTS = 5;

export async function deliverToSubscribers(currJob: job) {
  const subscribers = await getSubscriperByPipelineId(currJob.pipelineId);
  for (const sub of subscribers) {
    let attempts = 1;
    let delivered = false;
    while (!delivered && attempts <= MAX_ATTEMPTS) { // retry logic 
      try {
        const resp = await axios.post(sub.url, currJob.payload);
        console.log(`Job ${currJob.id} delivered to subscriber ${sub.id}, status: ${resp.status}`);
        await putInDeliveryAttemptsTable(currJob.id, sub.id, attempts, "success");
        delivered = true;
      } catch (err) {
        console.log(`err in attempt: ${attempts}`);
        await putInDeliveryAttemptsTable(currJob.id, sub.id, attempts, "failed");
        attempts++;
      }

    }
    if (!delivered) {
      console.error(`Job ${currJob.id} failed to deliver to subscriber ${sub.id} after ${MAX_ATTEMPTS} attempts`);
    }

  }
}