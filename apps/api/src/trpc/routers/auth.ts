import { AppError } from "@never-code/shared";
import { loginSchema, registerSchema } from "@never-code/shared/validators";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AuthService } from "../../services/auth-service.js";
import { publicProcedure, router } from "../trpc.js";

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const authService = new AuthService(ctx.db);
    try {
      const result = await authService.register(input);
      return {
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        sessionId: result.session.id,
      };
    } catch (error) {
      if (error instanceof AppError && error.code === "CONFLICT") {
        throw new TRPCError({ code: "CONFLICT", message: error.message });
      }
      throw error;
    }
  }),

  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const authService = new AuthService(ctx.db);
    const result = await authService.login(input);
    if (!result) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    return {
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
      sessionId: result.session.id,
    };
  }),

  me: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }).optional())
    .query(async ({ ctx, input }) => {
      if (!input?.sessionId) return null;
      const authService = new AuthService(ctx.db);
      const user = await authService.validateSession(input.sessionId);
      if (!user) return null;
      return { id: user.id, email: user.email, name: user.name };
    }),

  logout: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }).optional())
    .mutation(async ({ ctx, input }) => {
      if (!input?.sessionId) return { ok: true };
      const authService = new AuthService(ctx.db);
      await authService.logout(input.sessionId);
      return { ok: true };
    }),
});
