import { sign } from "hono/jwt";

import type { UserResponseDTOType } from "src/dto/user.dto.ts";

export type Payload = {
    iss: string;
    aud: string;
    sub: string;
    name: string;
    email: string;
    exp: number;
    role: string;
};

export const generateToken = async (user: UserResponseDTOType) => {
    const payload: Payload = {
        iss: Deno.env.get("BACKEND_URL") || "",
        aud: Deno.env.get("FRONTEND_URL") || "",
        sub: user.xata_id,
        name: user.name,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 3600,
        role: user.role_id,
    };
    const secret = Deno.env.get("JWT_SECRET") || "";
    return await sign(payload, secret);
};
