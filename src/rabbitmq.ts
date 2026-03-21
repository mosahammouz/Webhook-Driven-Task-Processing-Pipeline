import amqp from "amqplib"
let  channel: amqp.Channel;

export async function connectRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);// i am crazy confident that the uri is included in .env
    channel = await connection.createChannel();
    await channel.assertQueue("jobs", { durable: true }); //{ durable: true }ensures messages survive RabbitMQ restarts. // jobs the name os the queue
   console.log("RabbitMQ connected, queue 'jobs' ready");
} 

export function getChannel() {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}