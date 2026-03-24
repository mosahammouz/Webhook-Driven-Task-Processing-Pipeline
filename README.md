# WEBHOOK PROCESSING SERVICE
A backend service that receives webhooks, queues jobs for background processing, and delivers results to registered subscribers.  
The system follows an event-driven architecture similar to automation platforms like Zapier.

------

## Features & Tech Stack
- Webhook ingestion API (POST "/webhooks/:path") to receive the incoming data.
- Use **RabbitMQ** message broker to decouple the webhook API from background workers and if the worker crashes or the server restarts, messages aren’t lost(**Reliability**)
- Use **Drizzle ORM** to write TypeScript queries for PostgreSQL.
- Action types (to uppeer case , filter price , add timestamp ) one of them will be performed in the job according to what we have in the pipeline.
- Result delivery to subscriber URL(s). Personally, I used **Axios** API, cuz i'm comfortable with.
- Dockerfile to let the full service runs via docker-compose.yml (3 images and 4 containers)so my code is **DRY**.
- I designed 5 tables to solve this project.
- Designed a fake-server on port 5000 to check that the reuslt delivered to the subscribers and log the payload so you can notice that the action type is performed like toUpperCase.
- Use **vitest** for testing in CI.
- Applied : authentication, webhook signature verification, rate limiting to my project. 
- Workers can be **horizontally scaled** by adding new rabbitWorkers.
- Used **Postman** to test API endpoints.
----
## Architecture and job lifecycle

- **Architecture** : External Client → POST webhook/:path → AuthMiddleware → API Server (Express + Postgres) → RabbitMQ → Worker Service (Process Action) → Delivery Layer (Axios) → Subscriber Endpoints.

- **Job lifecycle** : Received (API) → Queued (RabbitMQ) → Processing (Worker) → Completed (Delivered) OR Failed (Max Retries) OR Skipped(edge case: duplicate request with the same idempotency key).

----
## Creativity
---- 

- Reduced **API latency** by ~83% (from ~1200 ms to ~200 ms) by creatively using RabbitMQ
- Handled the **Edge Case** of duplicate webhook requests using an **Idempotency Key**, ensuring each webhook is processed exactly once.

----

## **the Design of RabbitMQ**

![image alt](https://github.com/mosahammouz/Webhook-Driven-Task-Processing-Pipeline/blob/4979cbb1bf271e334746d0d95b9cb1b223a0f6d2/RabbitMQ%20cluster.png)
----

### The intricate details will be discussed in the demo
--------------------------------------------------------------------------------------
## Installation

```bash
# 1. Clone the repository
git clone https://github.com/mosahammouz/Webhook-Driven-Task-Processing-Pipeline.git

# 2. Navigate into the project folder
cd Webhook-Driven-Task-Processing-Pipeline

# 3. Build and start the service using Docker Compose
docker-compose up --build

#4. To stope Docker Compose
docker-compose down 