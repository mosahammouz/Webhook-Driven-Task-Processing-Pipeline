import express, { type Request, type Response } from "express";

const app = express(); 
const PORT = 3000;

function handlerHello(req: Request, res: Response) {
  res.send("Hello World!");
}


app.get("/", handlerHello);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));