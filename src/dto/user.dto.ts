import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

import { RoleSchema } from "./role.dto.ts";
import { AvatarSchema } from "./avatar.dto.ts";

const validatePassword = {
    action: async (val: any) => {
        const result = await bcrypt.compare(val.confirm_password, val.password);
        return result;
    },
    rules: {
        message: "Password incorrect",
        path: ["confirm_password"],
    },
};

export const UserUpdateSchema = z.object({
    xata_id: z.string(),
    name: z.string().min(3).nullable(),
    email: z.string().email().nullable(),
    new_password: z.string().nullable(),
    profession: z.string().nullable(),
    avatar_id: z.string().nullable(),
});
export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;

export const UserSchema = z.object({
    xata_id: z.string(),
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string(),
    profession: z.string().nullable(),
    role_id: z.string(),
    role: RoleSchema,
    avatar_id: z.string().nullable(),
    avatar: AvatarSchema.nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});
export type UserSchemaType = z.infer<typeof UserSchema>;

// User Repository -> Create, FindByEmail
export const UserCreateDTO = UserSchema.omit({
    xata_id: true,
    role: true,
    avatar_id: true,
    avatar: true,
    created_at: true,
    updated_at: true,
}).transform(async (data) => {
    const salt = await bcrypt.genSalt(10);
    return {
        ...data,
        password: await bcrypt.hash(data.password, salt),
    };
});
export type UserCreateDTOType = z.infer<typeof UserCreateDTO>;

// User Service -> Register
export const UserRegisterDTO = UserSchema.omit({
    xata_id: true,
    role_id: true,
    role: true,
    avatar_id: true,
    avatar: true,
    created_at: true,
    updated_at: true,
});
export type UserRegisterDTOType = z.infer<typeof UserRegisterDTO>;

// User Service -> Login
export const UserLoginDTO = UserSchema.pick({
    email: true,
    password: true,
});
export type UserLoginDTOType = z.infer<typeof UserLoginDTO>;
export const UserValidatePasswordDTO = z.object({
    password: z.string().min(3),
    confirm_password: z.string().min(3),
}).refine(
    async (val) => {
        const result = await bcrypt.compare(val.confirm_password, val.password);
        return result;
    },
    {
        message: "Password incorrect",
        path: ["confirm_password"],
    },
);
export type UserValidatePasswordSchemaType = z.infer<
    typeof UserValidatePasswordDTO
>;

// User Service -> UpdateProfile
export const UserUpdateProfileDTO = UserUpdateSchema.omit({
    avatar_id: true,
    password: true,
});
export type UserUpdateProfileDTOType = z.infer<typeof UserUpdateProfileDTO>;

// User Service -> UpdateAvatar
export const UserUpdateAvatarDTO = z.object({
    xata_id: z.string(),
    avatar: z
        .instanceof(File, { message: "Please upload a file." })
        .refine((f) => f.size < 1000_000, "Max 1 mb upload size."),
});
export type UserUpdateAvatarDTOType = z.infer<typeof UserUpdateAvatarDTO>;

// User Service -> UpdatePassword
export const UserUpdatePasswordDTO = z.object({
    xata_id: z.string(),
    old_password: z.string().min(3),
    new_password: z.string().min(3),
}).refine(validatePassword.action, validatePassword.rules).transform(
    async (data) => {
        if (data.new_password) {
            const salt = await bcrypt.genSalt(10);
            return {
                ...data,
                new_password: await bcrypt.hash(data.new_password, salt),
            };
        }
        return data;
    },
);
export type UserUpdatePasswordDTOType = z.infer<typeof UserUpdatePasswordDTO>;

// User Service -> Return All
export const UserResponseDTO = UserSchema.omit({
    created_at: true,
    updated_at: true,
});
export type UserResponseDTOType = z.infer<typeof UserResponseDTO>;
