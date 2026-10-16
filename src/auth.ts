import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "./lib/mongodb";
import { User } from "./models";
import { loginSchema } from "./lib/validations/auth";
import { USER_STATUS } from "./constants";

/**
 * Full Auth.js configuration (runs in the Node.js runtime).
 * Exposes `handlers` for the route handler, plus `auth`, `signIn`
 * and `signOut` helpers used across the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectToDatabase();
        const user = await User.findOne({ email }).select("+password");
        if (!user?.password) return null;

        if (user.status === USER_STATUS.SUSPENDED) return null;

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
});
