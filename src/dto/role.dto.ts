import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

const _RoleSchema = z.object({
    xata_id: z.string(),
    name: z.string().min(3),
    created_at: z.string(),
    updated_at: z.string(),
});

export const RoleSchema = _RoleSchema.omit({ created_at: true, updated_at: true });

export type RoleSchemaType = z.infer<typeof RoleSchema>;
