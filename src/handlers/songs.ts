import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../database/client";
import { Prisma, PrismaClient } from "@prisma/client";

const handleGetSongs = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = request.params as { id: string };
  const songId = params.id;
  if (!songId) {
    const shows = await getAllSongs();
    reply.send(shows);
    return;
  }
  const show = await getSongById(songId);
  reply.send(show);
};

const getAllSongs = async () => {
  return await prisma.song.findMany();
};

const getSongById = async (id: string) => {
  return await prisma.song.findUnique({ where: { id } });
};

const handlePostSongs = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const body = request.body as Prisma.SongCreateInput;
  if (!body) {
    reply.status(400).send({ error: "No body provided" });
    return;
  }

  const song = await prisma.song.create({
    data: body,
  });
  reply.status(200).send(song);
};

const handleDeleteSongs = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const params = request.params as { id: string };
  const songId = params.id;
  if (!songId) {
    reply.status(400).send({ error: "No song ID provided" });
    return;
  }
  try {
    const song = await prisma.song.delete({
      where: {
        id: songId,
      },
    });
    reply.send({ id: song.id });
  } catch (e) {
    reply.status(404).send({ error: "Song not found" });
  }
  return;
};

export { handleGetSongs, handlePostSongs, handleDeleteSongs };
