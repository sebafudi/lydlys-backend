import { FastifyInstance } from "fastify";
import { handleSpotifyCallback } from "../handlers/callback";
import { handleIndex } from "../handlers/index";
import { handleGetUserToken } from "../handlers/token";
import { handleRegisterDevice } from "../handlers/device";

function setupRoutes(fastify: FastifyInstance) {
  fastify.get("/", handleIndex);
  fastify.get("/callback", handleSpotifyCallback);
  fastify.get("/getUserToken", handleGetUserToken);
  fastify.post("/registerDevice", handleRegisterDevice);
}

export { setupRoutes };
