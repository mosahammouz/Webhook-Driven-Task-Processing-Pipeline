import dotenv from "dotenv";
dotenv.config(); 
import express, { type Request, type Response } from "express";
import { pipeline,ActionType,Subscriber } from "./types";
import { createPipeline ,getPipelineByPath , createJob, createSubscriber} from "./db/pipelines";
import { authMiddleware, verifyWebhookSignature } from "./auth.js";
const app = express(); 
const PORT = 3000;
app.use(express.json({verify: (req: any, res, buf) => {req.rawBody = buf.toString();},}));

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
  const signature = req.headers["x-webhook-signature"] as string;
      if(!signature){return res.status(401).json({err: "signature is missing !"});}
      const isSignValid = verifyWebhookSignature(req.rawBody!, signature );
      if(!isSignValid)return res.status(401).json({err: "Invalid signature"});

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
  let s=0;
async function handlerSubscribers(req: Request, res: Response){
  try{
  const {pipelineId} = req.params;
  const {url}=req.body;
  if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "url is required and must be a string" });
    }

  s++;
  const newSubscriper: Subscriber = {
   id: s, 
   pipelineId: pipelineId as string,
   url: url,
   status: "active",
  };
    const savedSubscriber = await createSubscriber(newSubscriper);
     return res.status(201).json({message: "Subscriber added",subscriber: savedSubscriber,   });
   }catch(err){console.log("err in handler subscriber")}
}
  


app.get("/", handlerHello);
app.post("/pipelines",authMiddleware,handlerPipelines);
app.post("/webhooks/:path",handlerWebhook);
app.post("/pipelines/:pipelineId/subscribers",authMiddleware,handlerSubscribers);// the body has only 1 url//
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));