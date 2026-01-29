import type { FieldValues, Resolver } from "react-hook-form";
import * as z from "zod";

// Simple Zod -> React Hook Form resolver factory.
// Uses `safeParse` to avoid `instanceof` checks that can fail in some RN bundlers.
export function zodResolver<T extends z.ZodTypeAny>(
  schema: T,
): Resolver<z.infer<T> extends FieldValues ? z.infer<T> : FieldValues> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data as any, errors: {} };
    }

    const errors: Record<string, any> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path : ["_root"];
      let cursor = errors;
      for (let i = 0; i < path.length; i++) {
        const key = String(path[i]);
        if (i === path.length - 1) {
          cursor[key] = { type: issue.code, message: issue.message };
        } else {
          cursor[key] = cursor[key] ?? {};
          cursor = cursor[key];
        }
      }
    }

    return { values: {}, errors };
  };
}

export default zodResolver;
