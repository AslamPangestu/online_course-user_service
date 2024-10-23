import {
    PoolClient,
    type QueryObjectResult,
} from "https://deno.land/x/postgres@v0.19.3/mod.ts";

import { RoleSchema, type RoleSchemaType } from "../dto/role.dto.ts";

import type { IRepository } from "src/lib/interface.ts";

export interface IRoleRepository {
    findByName(name: string): Promise<IRepository<RoleSchemaType>>;
}

export default class RoleRepository implements IRoleRepository {
    #db: PoolClient;

    constructor(db: PoolClient) {
        this.#db = db;
    }

    async findByName(
        name: string,
    ): Promise<IRepository<RoleSchemaType>> {
        try {
            const result: QueryObjectResult<RoleSchemaType> = await this
                .#db
                .queryObject(
                    "SELECT * FROM roles WHERE name = $1",
                    [name],
                );
            if (result.rowCount === 0) {
                throw Error("Role not found");
            }
            const validate = RoleSchema.safeParse(result.rows[0]);
            if (!validate.success) {
                throw validate.error;
            }
            return { data: validate.data, error: null };
        } catch (error) {
            return { data: null, error: error };
        }
    }
}
