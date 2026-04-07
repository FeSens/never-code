import { userRouter } from "./routers/user.js";
import { router } from "./trpc.js";

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
