import type { IRepository, IService } from "src/lib/interface.ts";

import {
    RefreshTokenCreateDTO,
    type RefreshTokenCreateDTOType,
    RefreshTokenResponseDTO,
    type RefreshTokenResponseDTOType,
    type RefreshTokenSchemaType,
} from "src/dto/refresh-token.dto.ts";
import type { UserSchemaType } from "src/dto/user.dto.ts";

import type { IRefreshTokenRepository } from "src/repositories/refresh-token.repository.ts";
import type { IUserRepository } from "src/repositories/user.repository.ts";

export interface IRefreshTokenService {
    add(
        request: RefreshTokenCreateDTOType,
    ): Promise<IService<RefreshTokenResponseDTOType>>;

    getByToken(token: string): Promise<IService<RefreshTokenResponseDTOType>>;
}

export default class RefreshTokenService implements IRefreshTokenService {
    #repo: IRefreshTokenRepository;
    #userRepo: IUserRepository;

    constructor(repo: IRefreshTokenRepository, userRepo: IUserRepository) {
        this.#repo = repo;
        this.#userRepo = userRepo;
    }

    async add(
        request: RefreshTokenCreateDTOType,
    ): Promise<IService<RefreshTokenResponseDTOType>> {
        const findID: IRepository<UserSchemaType> = await this
            .#userRepo
            .findByID(request.user_id);
        if (findID.error) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        const validate = await RefreshTokenCreateDTO.safeParseAsync({
            ...request,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const result: IRepository<RefreshTokenSchemaType> = await this
            .#repo
            .create(validate.data);

        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 500,
            };
        }

        const response = RefreshTokenResponseDTO.safeParse(result.data);
        if (!response.success) {
            return {
                response: { data: null, error: response.error },
                code: 500,
            };
        }
        return {
            response: {
                data: response.data,
                error: null,
            },
            code: 200,
        };
    }

    async getByToken(
        token: string,
    ): Promise<IService<RefreshTokenResponseDTOType>> {
        const result: IRepository<RefreshTokenSchemaType> = await this
            .#repo
            .findByToken(token);
        if (result.error) {
            return {
                response: { data: null, error: "Refresh Token not found" },
                code: 400,
            };
        }

        const response = RefreshTokenResponseDTO.safeParse(result.data);
        if (!response.success) {
            return {
                response: { data: null, error: response.error },
                code: 500,
            };
        }
        return {
            response: {
                data: response.data,
                error: null,
            },
            code: 200,
        };
    }
}
