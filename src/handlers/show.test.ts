import { jest, expect, describe, it, beforeEach } from "@jest/globals";
import { FastifyRequest, FastifyReply } from "fastify";
import { handlePostShow } from "./show";
import { prismaMock } from "../database/singleton";

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
    await handlePostShow(request as FastifyRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: "No body provided" });
  });

  it("should return 400 if no events are provided", async () => {
    const request = { body: {} };
    await handlePostShow(request as FastifyRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "No events provided",
    });
  });

  it("should return 200 if it is created", async () => {
    const show = { id: "1", events: "test" };
    (
      prismaMock.show.create as jest.MockedFunction<
        typeof prismaMock.show.create
      >
    ).mockResolvedValueOnce(show); // ?????
    await handlePostShow(mockRequest, mockReply);
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it("should return the show if it is created", async () => {
    const show = { id: "1", events: "test" };
    (
      prismaMock.show.create as jest.MockedFunction<
        typeof prismaMock.show.create
      >
    ).mockResolvedValueOnce(show); // ?????
    await handlePostShow(mockRequest, mockReply);
    expect(mockReply.send).toHaveBeenCalledWith(show);
  });
});
