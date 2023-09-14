import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import { FastifyRequest, FastifyReply } from "fastify";
import { handlePostSongs } from "./songs";
import { prismaMock } from "../database/singleton";

const mockReply = {
  status: jest.fn(() => mockReply),
  send: jest.fn(),
} as unknown as FastifyReply;

const mockRequest = {
  body: {},
} as unknown as FastifyRequest;

describe("handlePostSongs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no body is provided", async () => {
    const request = { body: null };
    await handlePostSongs(request as FastifyRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: "No body provided" });
  });

  it("should return 200 if it is created", async () => {
    const song = { id: "1", compiledId: null, showId: null };
    (
      prismaMock.song.create as jest.MockedFunction<
        typeof prismaMock.song.create
      >
    ).mockResolvedValueOnce(song); // ?????
    await handlePostSongs(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it("should return the song if it is created", async () => {
    const song = { id: "1", compiledId: null, showId: null };
    (
      prismaMock.song.create as jest.MockedFunction<
        typeof prismaMock.song.create
      >
    ).mockResolvedValueOnce(song); // ?????
    await handlePostSongs(mockRequest, mockReply);
    expect(mockReply.send).toHaveBeenCalledWith(song);
  });
});
