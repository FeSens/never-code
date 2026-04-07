import { authRouter } from "./routers/auth.js";
import { userRouter } from "./routers/user.js";
import { router } from "./trpc.js";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
