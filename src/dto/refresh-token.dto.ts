import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

import { UserSchema } from "./user.dto.ts";

export const RefreshTokenSchema = z.object({
    xata_id: z.string(),
    token: z.string().min(3),
    user_id: z.string(),
    user: UserSchema,
    created_at: z.string(),
    updated_at: z.string(),
});

export type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;

// RefreshToken Repository -> Create
export const RefreshTokenCreateDTO = RefreshTokenSchema.omit({
    xata_id: true,
    user: true,
    created_at: true,
    updated_at: true,
});
export type RefreshTokenCreateDTOType = z.infer<typeof RefreshTokenCreateDTO>;


// RefreshToken Service -> Return All
export const RefreshTokenResponseDTO = UserSchema.omit({
    user: true,
    created_at: true,
    updated_at: true,
});
export type RefreshTokenResponseDTOType = z.infer<typeof RefreshTokenResponseDTO>;
