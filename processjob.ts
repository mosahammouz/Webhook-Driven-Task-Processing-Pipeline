import { updateJobPayload,getPendingJobs, markJobCompleted ,markJobFailed ,incrementJobAttempts,getPipelineById } from "./src/db/pipelines.js"
import { job } from "./src/types.js"
export async function proccessJob (currentJob: job){
     const pipeline = await getPipelineById(currentJob.pipelineId);
     if(!pipeline){ console.log("Pipeline not found for job(id):", currentJob.id); return;}
     const actionConfig = pipeline.actionConfig as Record<string, any> ;
     let res: Record<string, any> = {...currentJob.payload};
     try{
    if(pipeline.actionType === "toUbberCase"){
        if (!actionConfig?.field) {console.log("no field");}
        const field = actionConfig.field;
        if(field in res)res[field]=String(res[field]).toUpperCase();
    }
     if (pipeline.actionType === "addTimesTamp") {
            const field = actionConfig?.field || "timestamp";
            res[field] = new Date().toISOString();
             console.log("Processed payload (with sentAt):", res);
        }



   if (pipeline.actionType === "filterPrice") {
      const min = actionConfig?.min;
      const priceField = actionConfig?.field || "price"; 
      if (typeof min !== "number") {console.log("No valid 'min' in actionConfig for job:", currentJob.id);
       } else if (typeof res[priceField] !== "number") {
        console.log(`Job payload missing numeric '${priceField}' for job:`, currentJob.id);
      } else if (res[priceField] < min) {
        console.log(`Job filtered due to ${priceField} < ${min}, job id:`, currentJob.id);
        await markJobFailed(currentJob.id);
        return;
      }
    }

    await updateJobPayload(currentJob.id, res);

    await markJobCompleted(currentJob.id);
            return { ...currentJob, payload: res };

     }catch(err){
          await incrementJobAttempts(currentJob.id);
           if (currentJob.attempts + 1 >= 5) {
           await markJobFailed(currentJob.id);
           console.log("Job marked as failed after max attempts:", currentJob.id);
                                              }
     }
    
   
}