import {
    PoolClient,
    type QueryObjectResult,
} from "https://deno.land/x/postgres@v0.19.3/mod.ts";

import {
    type UserCreateDTOType,
    UserSchema,
    type UserSchemaType,
    type UserUpdateSchemaType,
} from "../dto/user.dto.ts";

import type { IRepository } from "src/lib/interface.ts";

export interface IUserRepository {
    create(
        payload: UserCreateDTOType,
    ): Promise<IRepository<UserSchemaType>>;
    update(
        payload: UserUpdateSchemaType,
    ): Promise<IRepository<UserSchemaType>>;

    findByEmail(email: string): Promise<IRepository<UserSchemaType>>;
    findByID(id: string): Promise<IRepository<UserSchemaType>>;
    find(): Promise<IRepository<Array<UserSchemaType | null>>>;
}

export default class UserRepository implements IUserRepository {
    #db: PoolClient;

    constructor(db: PoolClient) {
        this.#db = db;
    }

    async create(
        payload: UserCreateDTOType,
    ): Promise<IRepository<UserSchemaType>> {
        try {
            const result: QueryObjectResult<UserSchemaType> = await this
                .#db
                .queryObject(
                    `INSERT INTO users (email, name, password, profession, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                    [
                        payload.email,
                        payload.name,
                        payload.password,
                        payload.profession,
                        payload.role_id,
                    ],
                );
            if (result.rowCount === 0) {
                throw Error("User not created");
            }
            const validate = UserSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async update(
        payload: UserUpdateSchemaType,
    ): Promise<IRepository<UserSchemaType>> {
        try {
            let query = "UPDATE users SET ";
            if (payload.email) {
                query += `email = ${payload.email}, `;
            }
            if (payload.name) {
                query += `name = ${payload.name}, `;
            }
            if (payload.new_password) {
                query += `password = ${payload.new_password}, `;
            }
            if (payload.profession) {
                query += `profession = ${payload.profession}, `;
            }
            if (payload.avatar_id) {
                query += `avatar_id = ${payload.avatar_id}, `;
            }
            query = query.substring(0, query.length - 2);
            query +=
                `updated_at = NOW() WHERE id = ${payload.xata_id} RETURNING *`;
            const result: QueryObjectResult<UserSchemaType> = await this
                .#db
                .queryObject(query);
            if (result.rowCount === 0) {
                throw Error("User not updated");
            }
            const validate = UserSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async findByEmail(
        email: string,
    ): Promise<IRepository<UserSchemaType>> {
        try {
            const result: QueryObjectResult<UserSchemaType> = await this
                .#db
                .queryObject(
                    "SELECT * FROM users WHERE email = $1",
                    [email],
                );
            if (result.rowCount === 0) {
                throw Error("User not found");
            }
            const validate = UserSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async findByID(
        id: string,
    ): Promise<IRepository<UserSchemaType>> {
        try {
            const result: QueryObjectResult<UserSchemaType> = await this
                .#db
                .queryObject(
                    "SELECT * FROM users WHERE xata_id = $1",
                    [id],
                );
            if (result.rowCount === 0) {
                throw Error("User not found");
            }
            const validate = UserSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }

    async find(): Promise<IRepository<Array<UserSchemaType | null>>> {
        try {
            const result: QueryObjectResult<UserSchemaType> = await this
                .#db
                .queryObject("SELECT * FROM users");
            if (result.rowCount === 0) {
                throw Error("User not found");
            }
            const validate = UserSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return {
                data: result.rows.map((row) => {
                    const validate = UserSchema.safeParse(row);
                    if (!validate.success) {
                        return null;
                    }
                    return validate.data;
                }),
                error: null,
            };
        } catch (error) {
            return { data: null, error: error };
        }
    }
}
