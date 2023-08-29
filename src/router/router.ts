import { FastifyInstance } from "fastify";
import { handleSpotifyCallback } from "../handlers/callback";
import { handleIndex } from "../handlers/index";
import { handleGetUserToken } from "../handlers/token";
import { handleRegisterDevice } from "../handlers/device";
import {
  handleGetShow,
  handlePostShow,
  handleDeleteShow,
} from "../handlers/show";

function setupRoutes(fastify: FastifyInstance) {
  fastify.get("/", handleIndex);
  fastify.get("/callback", handleSpotifyCallback);
  fastify.get("/getUserToken", handleGetUserToken);
  fastify.post("/registerDevice", handleRegisterDevice);

  fastify.get("/show", handleGetShow);
  fastify.get("/show/:id", handleGetShow);
  fastify.post("/show", handlePostShow);
  fastify.delete("/show/:id", handleDeleteShow);
}

export { setupRoutes };
