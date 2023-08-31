import { FastifyReply, FastifyRequest } from "fastify";
import { spotifyApi } from "../app/setupSpotify";
import prisma from "../database/client";
import crypto from "crypto";

async function handleGetUserToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.query) {
    reply.type("text/html").code(200);
    return "No query provided";
  }
  let query = request.query as { email: string; serial: string };
  if (!query.email || !query.serial) {
    reply.type("text/html").code(200);
    return "No email or serial provided";
  }
  let { email, serial } = query;
  let user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      spotify: true,
    },
  });
  if (!user) {
    reply.type("text/html").code(200);
    return "User not found";
  }
  if (!user.spotify) {
    reply.type("text/html").code(200);
    return "User does not have spotify object";
  }
  let device = await prisma.device.findUnique({
    where: {
      serial: serial,
    },
  });
  if (!device) {
    reply.type("text/html").code(200);
    return "Device not found";
  }
  if (!device.pub_key) {
    reply.type("text/html").code(200);
    return "Device does not have public key";
  }
  let pub_key = device.pub_key;
  let { accessToken, refreshToken, expiresAt } = user.spotify;
  let now = new Date();
  if (now > expiresAt) {
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    let data = await spotifyApi.refreshAccessToken();
    spotifyApi.resetAccessToken();
    spotifyApi.resetRefreshToken();
    accessToken = data.body.access_token;
    refreshToken = data.body.refresh_token || refreshToken;
    expiresAt = new Date(Date.now() + data.body.expires_in * 1000);
    let updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        spotify: {
          update: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
          },
        },
      },
    });
  }
  reply.type("text/html").code(200);
  return encrypt(pub_key, accessToken);
}

function encrypt(pub_key: string, text: string) {
  pub_key = `-----BEGIN PUBLIC KEY-----\n${pub_key}\n-----END PUBLIC KEY-----`;
  let buffer = Buffer.from(text);
  let encrypted = crypto.publicEncrypt(
    {
      key: pub_key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  );
  console.log(encrypted);

  return encrypted.toString("base64");
}

export { handleGetUserToken };
