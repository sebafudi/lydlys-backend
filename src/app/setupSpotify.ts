import SpotifyWebApi from "spotify-web-api-node";
require("dotenv").config();

const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const STATE = process.env.STATE;
const SCOPES = process.env.SCOPES?.split(" ");

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

export { authorizeURL, spotifyApi };
