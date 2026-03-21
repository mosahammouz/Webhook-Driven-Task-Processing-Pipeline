import amqp from "amqplib";

// infer the real Promise return type
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export async function connectRabbitMQ(): Promise<AmqpChannel> {
  if (channel) return channel; // reuse if already connected

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();

  await channel.assertExchange("jobs_exchange", "direct", { durable: true });
  await channel.assertQueue("jobs_queue", { durable: true });
  await channel.bindQueue("jobs_queue", "jobs_exchange", "jobs_routing");

  console.log("RabbitMQ connection and channel ready");
  return channel;
}

export function getChannel(): AmqpChannel {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}

export async function closeRabbitMQ() {
  if (channel) await channel.close();
  if (connection) await connection.close();
  channel = null;
  connection = null;
  console.log("RabbitMQ connection closed");
}