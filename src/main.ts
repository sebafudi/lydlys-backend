import { FastifyReply, FastifyRequest } from "fastify";
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import SpotifyWebApi from "spotify-web-api-node";

const prisma = new PrismaClient();

const fastify = require("fastify");
const server = fastify();
const PORT = process.env.PORT || 3000;

const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const STATE = process.env.STATE;
const SCOPES = process.env.SCOPES?.split(" ");

// validate env variables
if (!REDIRECT_URI || !CLIENT_ID || !CLIENT_SECRET || !STATE || !SCOPES) {
  console.error("Missing env variables");
  process.exit(1);
}

var showDialog = true,
  responseType = "code";

let spotifyApi = new SpotifyWebApi({
  redirectUri: REDIRECT_URI,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

let authorizeURL = spotifyApi.createAuthorizeURL(SCOPES, STATE, showDialog);

function getAuthorizationButtonHTML(authorizeURL: string) {
  return `<a href="${authorizeURL}"><img width=500 src="https://images.squarespace-cdn.com/content/v1/59a6fd41bebafb8b3f420544/1519917998014-G6SW42V49ZA7JSDOZJN3/image-asset.png" /></a>`;
}

server.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  let res = getAuthorizationButtonHTML(authorizeURL);
  reply.type("text/html").code(200);
  return res;
});

type SpotifyAuthResponse = {
  code: string;
  state: string;
};

server.get(
  "/callback",
  async (request: FastifyRequest, reply: FastifyReply) => {
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
    console.log(data.body);
    // get user info
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
      // create user object with spotify object inside
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
      // update user object with spotify object inside
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
  },
);

type getUserTokenQuery = {
  email: string;
};

server.get(
  "/getUserToken",
  async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.query) {
      reply.type("text/html").code(200);
      return "No query provided";
    }
    let query = request.query as getUserTokenQuery;
    if (!query.email) {
      reply.type("text/html").code(200);
      return "No email provided";
    }
    let { email } = query;
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
    let { accessToken, refreshToken, expiresAt } = user.spotify;
    let now = new Date();
    if (now > expiresAt) {
      // refresh token
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);
      let data = await spotifyApi.refreshAccessToken();
      spotifyApi.resetAccessToken();
      spotifyApi.resetRefreshToken();
      accessToken = data.body.access_token;
      refreshToken = data.body.refresh_token || refreshToken;
      expiresAt = new Date(Date.now() + data.body.expires_in * 1000);
      // update user object with spotify object inside
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
    return accessToken;
  },
);

server.listen({ port: PORT }, (err: any, address: any) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
