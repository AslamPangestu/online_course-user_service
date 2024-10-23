import {
    UserCreateDTO,
    type UserLoginDTOType,
    type UserRegisterDTOType,
    UserResponseDTO,
    type UserResponseDTOType,
    type UserSchemaType,
    type UserUpdateAvatarDTOType,
    type UserUpdatePasswordDTOType,
    type UserUpdateProfileDTOType,
    UserUpdateSchema,
    UserValidatePasswordDTO,
} from "src/dto/user.dto.ts";
import type { RoleSchemaType } from "src/dto/role.dto.ts";
import type { RefreshTokenSchemaType } from "src/dto/refresh-token.dto.ts";

import type { IRepository, IService } from "src/lib/interface.ts";
import fetcher, { BaseURL, Method } from "src/lib/fetcher.ts";

import type { IUserRepository } from "src/repositories/user.repository.ts";
import type { IRoleRepository } from "src/repositories/role.repository.ts";
import type { IRefreshTokenRepository } from "src/repositories/refresh-token.repository.ts";

export interface IUserService {
    register(
        request: UserRegisterDTOType,
    ): Promise<IService<UserResponseDTOType>>;
    login(
        request: UserLoginDTOType,
    ): Promise<IService<UserResponseDTOType>>;
    logout(
        userId: string,
    ): Promise<IService<null>>;
    updateProfile(
        request: UserUpdateProfileDTOType,
    ): Promise<IService<UserResponseDTOType>>;
    updateAvatar(
        request: UserUpdateAvatarDTOType,
    ): Promise<IService<UserResponseDTOType>>;
    updatePassword(
        request: UserUpdatePasswordDTOType,
    ): Promise<IService<UserResponseDTOType>>;

    getByID(id: string): Promise<IService<UserResponseDTOType>>;
    getAll(): Promise<IService<Array<UserResponseDTOType | null>>>;
}

export default class UserService implements IUserService {
    #repo: IUserRepository;
    #roleRepo: IRoleRepository;
    #refreshTokenRepo: IRefreshTokenRepository;

    constructor(
        repo: IUserRepository,
        roleRepo: IRoleRepository,
        refreshTokenRepo: IRefreshTokenRepository,
    ) {
        this.#repo = repo;
        this.#roleRepo = roleRepo;
        this.#refreshTokenRepo = refreshTokenRepo;
    }

    async register(
        request: UserRegisterDTOType,
    ): Promise<IService<UserResponseDTOType>> {
        const findEmail: IRepository<UserSchemaType> = await this
            .#repo
            .findByEmail(request.email);
        if (!findEmail.error) {
            return {
                response: { data: null, error: "Email already exists" },
                code: 400,
            };
        }

        const findRole: IRepository<RoleSchemaType> = await this
            .#roleRepo
            .findByName("Student");
        if (!findRole.error) {
            return {
                response: { data: null, error: "Role not found" },
                code: 400,
            };
        }

        const validate = await UserCreateDTO.safeParseAsync({
            ...request,
            role_id: findRole.data?.xata_id,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const result: IRepository<UserSchemaType> = await this
            .#repo
            .create(validate.data);

        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 500,
            };
        }

        const response = UserResponseDTO.safeParse(result.data);
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

    async login(
        request: UserLoginDTOType,
    ): Promise<IService<UserResponseDTOType>> {
        const findEmail: IRepository<UserSchemaType> = await this
            .#repo
            .findByEmail(request.email);
        if (!findEmail.data) {
            return {
                response: { data: null, error: findEmail.error },
                code: 400,
            };
        }

        const validate = UserValidatePasswordDTO.safeParse({
            password: findEmail.data.password,
            confirm_password: request.password,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const response = UserResponseDTO.safeParse(findEmail.data);
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

    async logout(userId: string): Promise<IService<null>> {
        const findUser: IRepository<RefreshTokenSchemaType> = await this
            .#refreshTokenRepo
            .findByUserID(userId);
        if (findUser.error) {
            return {
                response: { data: null, error: "Refresh Token not found" },
                code: 400,
            };
        }

        const result: IRepository<RefreshTokenSchemaType> = await this
            .#refreshTokenRepo
            .delete(userId);
        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 400,
            };
        }

        return {
            response: {
                data: null,
                error: null,
            },
            code: 200,
        };
    }

    async updateProfile(
        request: UserUpdateProfileDTOType,
    ): Promise<IService<UserResponseDTOType>> {
        const findID: IRepository<UserSchemaType> = await this
            .#repo
            .findByID(request.xata_id);
        if (findID.error) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        if (request.email) {
            const findEmail: IRepository<UserSchemaType> = await this
                .#repo
                .findByEmail(request.email);
            if (!findEmail.error) {
                return {
                    response: { data: null, error: "Email already exists" },
                    code: 400,
                };
            }
        }

        const validate = await UserUpdateSchema.safeParseAsync({
            ...request,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const result: IRepository<UserSchemaType> = await this
            .#repo
            .update(validate.data);

        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 500,
            };
        }

        const response = UserResponseDTO.safeParse(result.data);
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

    async updateAvatar(
        request: UserUpdateAvatarDTOType,
    ): Promise<IService<UserResponseDTOType>> {
        const findID: IRepository<UserSchemaType> = await this
            .#repo
            .findByID(request.xata_id);
        if (findID.error) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        let oldAvatar = findID.data?.avatar_id;

        const formData = new FormData();
        formData.append("file", request.avatar);

        const { error, response: fetchResponse } = await fetcher<
            { xata_id: string }
        >({
            baseUrl: BaseURL.Media,
            path: "/",
            method: Method.POST,
            request: formData,
        });

        if (error) {
            return {
                response: { data: null, error },
                code: 400,
            };
        }

        const validate = await UserUpdateSchema.safeParseAsync({
            ...request,
            avatar_id: fetchResponse?.xata_id,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const result: IRepository<UserSchemaType> = await this
            .#repo
            .update(validate.data);

        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 500,
            };
        }

        const response = UserResponseDTO.safeParse(result.data);
        if (!response.success) {
            return {
                response: { data: null, error: response.error },
                code: 500,
            };
        }

        // TODO: Queue remove old media
        if (oldAvatar) {
        }
        return {
            response: {
                data: response.data,
                error: null,
            },
            code: 200,
        };
    }

    async updatePassword(
        request: UserUpdatePasswordDTOType,
    ): Promise<IService<UserResponseDTOType>> {
        const findID: IRepository<UserSchemaType> = await this
            .#repo
            .findByID(request.xata_id);
        if (findID.error) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        const validate = await UserUpdateSchema.safeParseAsync({
            ...request,
        });
        if (!validate.success) {
            return {
                response: { data: null, error: validate.error },
                code: 400,
            };
        }

        const result: IRepository<UserSchemaType> = await this
            .#repo
            .update(validate.data);

        if (result.error) {
            return {
                response: { data: null, error: result.error },
                code: 500,
            };
        }

        const response = UserResponseDTO.safeParse(result.data);
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

    async getByID(id: string): Promise<IService<UserResponseDTOType>> {
        const result: IRepository<UserSchemaType> = await this
            .#repo
            .findByID(id);
        if (result.error) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        const response = UserResponseDTO.safeParse(result.data);
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

    async getAll(): Promise<IService<Array<UserResponseDTOType | null>>> {
        const result: IRepository<Array<UserSchemaType | null>> = await this
            .#repo
            .find();
        if (!result.data) {
            return {
                response: { data: null, error: "User not found" },
                code: 400,
            };
        }

        return {
            response: {
                data: result.data.map((item) => {
                    const validate = UserResponseDTO.safeParse(item);
                    if (!validate.success) {
                        return null;
                    }
                    return validate.data;
                }),
                error: null,
            },
            code: 200,
        };
    }
}
