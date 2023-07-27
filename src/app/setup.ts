import { fastify } from "fastify";
import { setupRoutes } from "../router/router";

function setupAndRunApp() {
  const server = fastify();
  setupRoutes(server);
  const PORT = process.env.PORT || 3000;
  server.listen({ port: Number(PORT) }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });

  return server;
}

export { setupAndRunApp };
