import express, { type Request, type Response } from "express";
import { pipeline,ActionType } from "./types";
import { createPipeline ,getPipelineByPath , createJob} from "./db/pipelines";
const app = express(); 
const PORT = 3000;
app.use(express.json());

const validActions: ActionType[] = ["toUbberCase", "filterPrice", "addTimesTamp"];

function handlerHello(req: Request, res: Response) {
  res.send("Hello World!");
}


async function handlerPipelines(req: Request , resp: Response){
  
  const {webhookPath, actionType: rawActionType ,actionConfig} =req.body;
   if (!webhookPath || typeof webhookPath !== "string") {return resp.status(400).json({ error: "webhookPath is required and must be a string" });}
  if (!validActions.includes(rawActionType)) {return resp.status(400).json({ error: `actionType must be one of ${validActions.join(", ")}` });}
   const actionType = rawActionType as ActionType;
  const newPipeline: pipeline ={
    id: Date.now().toString(),
    webhookPath,
    actionType,
    actionConfig,
    createdAt: new Date
  }
  const savedPipeline = await createPipeline(newPipeline);
  resp.status(201).json(savedPipeline);
}


async function handlerWebhook(req: Request, res: Response) {
    const path = req.params.path as string;
    const data = req.body;
    const pipelineRow = await getPipelineByPath(path);
    if(!pipelineRow){return res.status(404).json({err : "pipelineRow not found"});}
     //process
     console.log("Webhook received for pipeline:", pipelineRow, "with payload:", data);
    const newJob = {
    id: Date.now().toString(),
    pipelineId: pipelineRow.id,
    payload: data,
    status: "pending",
    attempts: 0,
    createdAt: new Date(),
  };
  const savedJob = await createJob(newJob);
  if(!savedJob){return res.status(404).json({err : "savedjob not found"});}
  console.log("Job queued:", savedJob);
  return res.status(202).json({ message: "Webhook accepted",  jobId: savedJob.id,});

  }



app.get("/", handlerHello);
app.post("/pipelines",handlerPipelines);
app.post("/webhooks/:path",handlerWebhook);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));