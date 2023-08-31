import { FastifyReply, FastifyRequest } from "fastify";
import { spotifyApi } from "../app/setupSpotify";
import prisma from "../database/client";

type SpotifyAuthResponse = {
  code: string;
  state: string;
};

async function handleSpotifyCallback(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.query) {
    reply.type("text/html").code(200);
    return "No query provided";
  }
  let query = request.query as SpotifyAuthResponse;
  if (!query.code || !query.state) {
    reply.type("text/html").code(200);
    return "No code or state provided";
  }
  let { code, state } = query;
  if (state !== "some-state-of-my-choice") {
    reply.type("text/html").code(200);
    return "State does not match";
  }
  let data = await spotifyApi.authorizationCodeGrant(code);
  let { access_token, refresh_token } = data.body;
  spotifyApi.setAccessToken(access_token);
  spotifyApi.setRefreshToken(refresh_token);
  let user = await spotifyApi.getMe();
  let email = user.body.email;
  let doesUserExist = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!doesUserExist) {
    let newUser = await prisma.user.create({
      data: {
        email: email,
        spotify: {
          create: {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + data.body.expires_in * 1000),
            scope: data.body.scope,
          },
        },
      },
    });
  } else {
    let updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        spotify: {
          update: {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + data.body.expires_in * 1000),
            scope: data.body.scope,
          },
        },
      },
    });
  }
  reply.type("text/html").code(200);
  return "Success <br /> <a href='/'>Go back</a>";
}

export { handleSpotifyCallback };
