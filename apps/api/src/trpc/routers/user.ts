import { users } from "@never-code/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";

export const userRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return user;
    }),
});
