// fake-subscriber.ts
import express from "express";
const app = express();
app.use(express.json());

app.post("/receive", (req, res) => {
  console.log("Received payload:", req.body);
  res.status(200).send("OK");
});

app.listen(5000, () => console.log("Subscriber server running on port 5000"));