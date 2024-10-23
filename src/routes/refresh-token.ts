import { Hono } from "hono";

import database from "src/lib/database.ts";
import type { IService } from "src/lib/interface.ts";

import {
    RefreshTokenCreateDTO,
    type RefreshTokenResponseDTOType,
} from "src/dto/refresh-token.dto.ts";

import UserRepository, {
    type IUserRepository,
} from "src/repositories/user.repository.ts";
import RefreshTokenRepository, {
    type IRefreshTokenRepository,
} from "src/repositories/refresh-token.repository.ts";

import RefreshTokenService, {
    type IRefreshTokenService,
} from "src/services/refresh-token.service.ts";

const app = new Hono();

const userRepository: IUserRepository = new UserRepository(database);
const refreshTokenRepository: IRefreshTokenRepository =
    new RefreshTokenRepository(
        database,
    );

const refreshTokenService: IRefreshTokenService = new RefreshTokenService(
    refreshTokenRepository,
    userRepository,
);

app.get("/", async(c) => {
    const token = c.req.query('token')
    if (!token) {
        return c.json({ data: null, error: "Token is required" }, 400);
    }

    const { response, code }: IService<RefreshTokenResponseDTOType> =
        await refreshTokenService.getByToken(token);
    return c.json(response, code);
});

app.post("/", async (c) => {
    const body = await c.req.json();
    const validate = RefreshTokenCreateDTO.safeParse(body);
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<RefreshTokenResponseDTOType> =
        await refreshTokenService.add(validate.data);
    return c.json(response, code);
});

export default app;
