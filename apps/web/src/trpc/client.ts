import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@never-code/api/src/trpc/router";

export const trpc = createTRPCReact<AppRouter>();
