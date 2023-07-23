import { FastifyReply, FastifyRequest } from "fastify";

const fastify = require("fastify");
const server = fastify();
const PORT = process.env.PORT || 3000;

server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  reply.type("application/json").code(404);
  return { hello: "world" };
});

server.listen({ port: PORT }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
