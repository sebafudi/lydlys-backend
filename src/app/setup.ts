import { fastify } from "fastify";
import { setupRoutes } from "../router/router";

function setupAndRunApp() {
  const server = fastify();
  setupRoutes(server);
  const PORT = process.env.PORT || 3030;
  server.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });

  return server;
}

export { setupAndRunApp };
