import {
    PoolClient,
    type QueryObjectResult,
} from "https://deno.land/x/postgres@v0.19.3/mod.ts";

import type { IRepository } from "src/lib/interface.ts";

import {
    type RefreshTokenCreateDTOType,
    RefreshTokenSchema,
    type RefreshTokenSchemaType,
} from "../dto/refresh-token.dto.ts";

export interface IRefreshTokenRepository {
    create(
        payload: RefreshTokenCreateDTOType,
    ): Promise<IRepository<RefreshTokenSchemaType>>;
    delete(userId: string): Promise<IRepository<RefreshTokenSchemaType>>;

    findByToken(
        token: string,
    ): Promise<IRepository<RefreshTokenSchemaType>>;
    findByUserID(
        userId: string,
    ): Promise<IRepository<RefreshTokenSchemaType>>;
}

export default class RefreshTokenRepository implements IRefreshTokenRepository {
    #db: PoolClient;

    constructor(db: PoolClient) {
        this.#db = db;
    }

    async create(
        payload: RefreshTokenCreateDTOType,
    ): Promise<IRepository<RefreshTokenSchemaType>> {
        try {
            const result: QueryObjectResult<RefreshTokenSchemaType> = await this
                .#db
                .queryObject(
                    `INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2) RETURNING *`,
                    [
                        payload.token,
                        payload.user_id,
                    ],
                );
            if (result.rowCount === 0) {
                throw Error("Refresh Token not created");
            }
            const validate = RefreshTokenSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async delete(userId: string): Promise<IRepository<RefreshTokenSchemaType>> {
        try {
            const result: QueryObjectResult<RefreshTokenSchemaType> = await this
                .#db
                .queryObject(
                    `DELETE FROM refresh_tokens WHERE user_id = $1 RETURNING *`,
                    [
                        userId,
                    ],
                );
            if (result.rowCount === 0) {
                throw Error("Refresh Token not deleted");
            }
            const validate = RefreshTokenSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async findByToken(
        token: string,
    ): Promise<IRepository<RefreshTokenSchemaType>> {
        try {
            const result: QueryObjectResult<RefreshTokenSchemaType> = await this
                .#db
                .queryObject(
                    "SELECT * FROM refresh_tokens WHERE token = $1",
                    [token],
                );
            if (result.rowCount === 0) {
                throw Error("Refresh not found");
            }
            const validate = RefreshTokenSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async findByUserID(
        userId: string,
    ): Promise<IRepository<RefreshTokenSchemaType>> {
        try {
            const result: QueryObjectResult<RefreshTokenSchemaType> = await this
                .#db
                .queryObject(
                    "SELECT * FROM refresh_tokens WHERE user_id = $1",
                    [userId],
                );
            if (result.rowCount === 0) {
                throw Error("Refresh not found");
            }
            const validate = RefreshTokenSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }
}
