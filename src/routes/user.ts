import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";

import {
    UserLoginDTO,
    UserRegisterDTO,
    type UserResponseDTOType,
    UserUpdateAvatarDTO,
    UserUpdatePasswordDTO,
    UserUpdateProfileDTO,
} from "src/dto/user.dto.ts";

import database from "src/lib/database.ts";
import type { IService } from "src/lib/interface.ts";
import type { Payload } from "src/lib/jwt.ts";

import UserRepository, {
    type IUserRepository,
} from "src/repositories/user.repository.ts";
import RoleRepository, {
    type IRoleRepository,
} from "src/repositories/role.repository.ts";
import RefreshTokenRepository, {
    type IRefreshTokenRepository,
} from "src/repositories/refresh-token.repository.ts";

import UserService, { type IUserService } from "src/services/user.service.ts";

const app = new Hono<{ Variables: JwtVariables }>();

const userRepository: IUserRepository = new UserRepository(database);
const roleRepository: IRoleRepository = new RoleRepository(database);
const refreshTokenRepository: IRefreshTokenRepository =
    new RefreshTokenRepository(database);

const userService: IUserService = new UserService(
    userRepository,
    roleRepository,
    refreshTokenRepository,
);

app.get("/", async (c) => {
    const { response, code }: IService<Array<UserResponseDTOType | null>> =
        await userService
            .getAll();
    return c.json(response, code);
});

app.post("/login", async (c) => {
    const body = await c.req.json();
    const validate = UserLoginDTO.safeParse(body);
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<
        { token: string; user: UserResponseDTOType }
    > = await userService
        .login(validate.data);
    return c.json(response, code);
});

app.post("/register", async (c) => {
    const body = await c.req.json();
    const validate = UserRegisterDTO.safeParse(body);
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<
        { token: string; user: UserResponseDTOType }
    > = await userService
        .register(validate.data);
    return c.json(response, code);
});

app.get("/profile", async (c) => {
    const payload: Payload = c.get("jwtPayload");
    const { response, code }: IService<UserResponseDTOType> = await userService
        .getByID(payload.sub);
    return c.json(response, code);
});

app.patch("/profile", async (c) => {
    const payload: Payload = c.get("jwtPayload");
    const body = await c.req.json();
    const validate = UserUpdateProfileDTO.safeParse({
        ...body,
        xata_id: payload.sub,
    });
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<UserResponseDTOType> = await userService
        .updateProfile(validate.data);
    return c.json(response, code);
});

app.patch("/avatar", async (c) => {
    const payload: Payload = c.get("jwtPayload");
    const body = await c.req.parseBody();
    const validate = UserUpdateAvatarDTO.safeParse({
        ...body,
        xata_id: payload.sub,
    });
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<UserResponseDTOType> = await userService
        .updateAvatar(validate.data);
    return c.json(response, code);
});

app.patch("/password", async (c) => {
    const payload: Payload = c.get("jwtPayload");
    const body = await c.req.json();
    const validate = UserUpdatePasswordDTO.safeParse({
        ...body,
        xata_id: payload.sub,
    });
    if (!validate.success) {
        return c.json({ data: null, error: validate.error }, 400);
    }

    const { response, code }: IService<UserResponseDTOType> = await userService
        .updatePassword(validate.data);
    return c.json(response, code);
});

app.post("/logout", async (c) => {
    const payload: Payload = c.get("jwtPayload");
    const { response, code }: IService<null> = await userService
        .logout(payload.sub);
    return c.json(response, code);
});

export default app;
