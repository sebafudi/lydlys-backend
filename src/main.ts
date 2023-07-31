import { setupAndRunApp } from "./app/setup";
var process = require("process");
process.on("SIGINT", () => {
  console.info("Interruptedx");
  process.exit(0);
});

setupAndRunApp();
