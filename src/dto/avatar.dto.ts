import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

const _AvatarSchema = z.object({
    xata_id: z.string(),
    image_path: z.string().min(3).url(),
    filename: z.string().min(3),
    created_at: z.string(),
    updated_at: z.string(),
});

export const AvatarSchema = _AvatarSchema.omit({ created_at: true, updated_at: true });

export type AvatarSchemaType = z.infer<typeof AvatarSchema>;
