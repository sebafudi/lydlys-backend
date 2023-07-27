import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../database/prisma";

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;

if (!TEST_USER_EMAIL) {
  console.error("Missing env variables");
  process.exit(1);
}

async function handleRegisterDevice(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.body) {
    reply.type("text/html").code(200);
    return "No body provided";
  }
  let body = request.body as { pub_key: string; serial: string };
  if (!body.pub_key || !body.serial) {
    reply.type("text/html").code(200);
    return "No pub_key or serial provided";
  }
  let { pub_key, serial } = body;
  let device = await prisma.device.findUnique({
    where: {
      serial: serial,
    },
  });
  if (!device) {
    let updatedUser = await prisma.user.update({
      where: {
        email: TEST_USER_EMAIL,
      },
      data: {
        devices: {
          create: {
            serial: serial,
            pub_key: pub_key,
          },
        },
      },
    });
  }
  reply.type("text/html").code(200);
  return "Success<br /><a href='/'>Go back</a>";
}

export { handleRegisterDevice };
