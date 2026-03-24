Webhook-Driven Task Processing Pipeline
An event-driven backend service that receives webhooks, processes them asynchronously through a job queue, and delivers results to registered subscribers — a simplified version of Zapier.

Webhook → Queue → Worker → Process → Deliver to Subscribers
Tech Stack
Runtime: Node.js + TypeScript
Database: PostgreSQL (via Drizzle ORM)
Message Broker: RabbitMQ
HTTP Framework: Express
Containerization: Docker + Docker Compose
CI/CD: GitHub Actions
Validation: Zod
Testing: Vitest
Architecture
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  API Service │────▶│  RabbitMQ   │────▶│   Worker    │
│  (port 3000) │     │  (port 5672)│     │   Service   │
└─────────────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐                        ┌─────────────┐
│  PostgreSQL  │◀───────────────────────│  Processors │
│  (port 5433) │                        │  + Delivery │
└─────────────┘                        └─────────────┘
How it works
User creates a pipeline with one or more processors
User registers subscribers (URLs that receive processed results)
A webhook hits POST /webhooks/:pipelineId
API saves the job to the database with status queued
API publishes the job to RabbitMQ
Worker consumes the job, runs processors in order
Worker delivers the result to all subscribers via HTTP POST
Failed deliveries are retried up to 3 times with exponential backoff
All attempts are recorded in the database
Getting Started
Prerequisites
Docker + Docker Compose
Node.js
npm
1. Clone the repository
git clone https://github.com/HayaTahboub/Webhook-Driven.git
cd Webhook-Driven
2. Create .env file
PORT=3000
DATABASE_URL=postgres://postgres:password@db:5432/webhook
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
3. Start everything
docker compose up --build
This starts 4 services:

API on http://localhost:3000
Worker (background)
PostgreSQL on localhost:5433
RabbitMQ on localhost:5672 (management UI: http://localhost:15672)
API Reference
Pipelines
Method	Endpoint	Description
POST	/pipelines	Create a pipeline
GET	/pipelines	Get all pipelines
GET	/pipelines/:id	Get pipeline by ID
PUT	/pipelines/:id	Update pipeline
DELETE	/pipelines/:id	Delete pipeline
Create pipeline example:

POST /pipelines
{
  "name": "My Pipeline",
  "processors": [
    {
      "type": "transform",
      "config": {
        "uppercaseFields": ["name"],
        "addTimestamp": true
      }
    }
  ]
}
Subscribers
Method	Endpoint	Description
POST	/subscribers	Register a subscriber
GET	/subscribers	Get all subscribers
GET	/subscribers/:id	Get subscriber by ID
PUT	/subscribers/:id	Update subscriber
DELETE	/subscribers/:id	Delete subscriber
Create subscriber example:

POST /subscribers
{
  "pipelineId": "your-pipeline-uuid",
  "targetUrl": "https://your-endpoint.com/webhook"
}
Webhooks
Method	Endpoint	Description
POST	/webhooks/:pipelineId	Trigger a webhook event
Returns 202 Accepted with a jobId.

Jobs
Method	Endpoint	Description
GET	/jobs	Get all jobs
GET	/jobs/:id	Get job by ID
GET	/jobs/:id/attempts	Get delivery attempts for a job
Job statuses: queued → processing → completed / skipped

Processor Types
1. Transform
Modifies the incoming payload.

{
  "type": "transform",
  "config": {
    "uppercaseFields": ["name", "city"],
    "addTimestamp": true
  }
}
2. Filter
Conditionally allows the job to continue. If the condition fails, the job is marked as skipped and no delivery occurs.

{
  "type": "filter",
  "config": {
    "field": "amount",
    "operator": ">",
    "value": 100
  }
}
Supported operators: >, <, ==

3. HTTP Enrichment
Calls an external API and merges the response into the payload.

{
  "type": "http-enrichment",
  "config": {
    "url": "https://jsonplaceholder.typicode.com/users/1"
  }
}
Chaining Processors
You can chain multiple processors in a single pipeline:

{
  "name": "Enrich then Transform",
  "processors": [
    {
      "type": "http-enrichment",
      "config": { "url": "https://api.example.com/data" }
    },
    {
      "type": "transform",
      "config": { "uppercaseFields": ["name"], "addTimestamp": true }
    }
  ]
}
Retry Logic
For each subscriber, the worker attempts delivery up to 3 times with exponential backoff:

Attempt	Delay
1	immediate
2	2 seconds
3	4 seconds
Every attempt is recorded in delivery_attempts with status, response code, and timestamp.

Database Schema
pipelines         → id, name, processors (JSONB), created_at
subscribers       → id, pipeline_id, target_url, created_at
jobs              → id, pipeline_id, payload, status, result, error_message, created_at, processed_at
delivery_attempts → id, job_id, subscriber_id, attempt_number, status, response_code, created_at
Running Tests
Unit tests (processors):
npm test
Integration tests (requires Docker running):
docker compose up -d
npm run test:integration
Demo Walkthrough
# 1. Create a pipeline
curl -X POST http://localhost:3000/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Pipeline",
    "processors": [{ "type": "transform", "config": { "uppercaseFields": ["name"], "addTimestamp": true } }]
  }'

# 2. Create a subscriber (use https://webhook.site for a real URL)
curl -X POST http://localhost:3000/subscribers \
  -H "Content-Type: application/json" \
  -d '{ "pipelineId": "PIPELINE_ID", "targetUrl": "https://webhook.site/YOUR-ID" }'

# 3. Trigger a webhook
curl -X POST http://localhost:3000/webhooks/PIPELINE_ID \
  -H "Content-Type: application/json" \
  -d '{ "name": "mohamed", "amount": 200 }'

# 4. Check job status
curl http://localhost:3000/jobs/JOB_ID

# 5. Check delivery attempts
curl http://localhost:3000/jobs/JOB_ID/attempts