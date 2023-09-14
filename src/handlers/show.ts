import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../database/client";
import { Prisma } from "@prisma/client";

const handleGetShow = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const showId = params.id;
  if (!showId) {
    const shows = await getAllShows();
    reply.send(shows);
    return;
  }
  const show = await getShowById(showId);
  reply.send(show);
};

const getAllShows = async () => {
  const shows = await prisma.show.findMany();
  return shows;
};

const getShowById = async (id: string) => {
  return await prisma.show.findUnique({ where: { id } });
};

const handlePostShow = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as Prisma.ShowCreateInput;
  if (!body) {
    reply.status(400).send({ error: "No body provided" });
    return;
  }
  const events = body.events;
  if (!events) {
    reply.status(400).send({ error: "No events provided" });
    return;
  }
  const show = await prisma.show.create({
    data: { events },
  });
  reply.status(200).send(show);
};

const handleDeleteShow = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const params = request.params as { id: string };
  const showId = params.id;
  if (!showId) {
    reply.status(400).send({ error: "No show ID provided" });
    return;
  }
  try {
    const show = await prisma.show.delete({
      where: {
        id: showId,
      },
    });
    reply.send({ id: show.id });
  } catch (e) {
    reply.status(404).send({ error: "Show not found" });
  }
  return;
};

export { handleGetShow, handlePostShow, handleDeleteShow };
