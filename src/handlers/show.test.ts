import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import { FastifyRequest, FastifyReply } from "fastify";
import { postShow } from "./show";
import { PrismaClient } from "@prisma/client";

const mockPrisma = {
  show: {
    create: jest.fn((x: any) => {
      return { id: 1, ...x.data };
    }),
  },
} as unknown as PrismaClient;

const mockReply = {
  status: jest.fn(() => mockReply),
  send: jest.fn(),
} as unknown as FastifyReply;

const mockRequest = {
  body: { events: "test" },
} as unknown as FastifyRequest;

describe("handlePostShow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no body is provided", async () => {
    const request = { body: null };
    await postShow(request as FastifyRequest, mockReply, mockPrisma);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: "No body provided" });
  });

  it("should return 400 if no events are provided", async () => {
    const request = { body: {} };
    await postShow(request as FastifyRequest, mockReply, mockPrisma);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "No events provided",
    });
  });

  it("should return the show if it is created", async () => {
    await postShow(mockRequest, mockReply, mockPrisma);
    expect(mockReply.send).toHaveBeenCalledWith({
      id: 1,
      events: "test",
    });
  });
});
