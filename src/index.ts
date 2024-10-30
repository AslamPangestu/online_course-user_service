import { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

import user from "src/routes/user.ts";
import refreshToken from "src/routes/refresh-token.ts";
import type { Env } from "src/env.type.ts";

const app = new Hono<{ Bindings: Env; Variables: JwtVariables }>();

app.use((c, next) => {
  const PATHS = [
    c.req.path === "/login",
    c.req.path === "/refresh-token"
  ]
  if (PATHS.includes(true)) {
    return next();
  }
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  });
  return jwtMiddleware(c, next);
});

app.get("/ping", (c) => {
  return c.text("pong-pong");
});

app.route("/", user);
app.route("/refresh-token", refreshToken);

Deno.serve({ port: parseInt(Deno.env.get("PORT") || "8000") }, app.fetch);
