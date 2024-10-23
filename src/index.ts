import { Hono } from "hono";

import user from "./routes/user.ts";
import refreshToken from "./routes/refresh-token.ts";

const app = new Hono();

app.get("/ping", (c) => {
  return c.text("pong-pong");
});

app.route("/", user);
app.route("/refresh-token", refreshToken);

Deno.serve({ port: parseInt(Deno.env.get("PORT") || "8000") }, app.fetch);
