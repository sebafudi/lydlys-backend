import { FastifyReply, FastifyRequest } from "fastify";
import { authorizeURL } from "../app/setupSpotify";

function getAuthorizationButtonHTML(authorizeURL: string) {
  return `<a href="${authorizeURL}"><img width=500 src="https://images.squarespace-cdn.com/content/v1/59a6fd41bebafb8b3f420544/1519917998014-G6SW42V49ZA7JSDOZJN3/image-asset.png" /></a>`;
}

async function handleIndex(request: FastifyRequest, reply: FastifyReply) {
  let res = getAuthorizationButtonHTML(authorizeURL);
  reply.type("text/html").code(200);
  return res;
}

export { handleIndex };
