import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginUser, loginWithGoogle, refreshToken } from "@/lib/api/auth/auth";
import { JWT } from "next-auth/jwt";
import { AxiosError } from "axios";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const response = await refreshToken({
      refresh_token: token.refreshToken as string,
    });

    return {
      ...token,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + (response.expires_in || 3600) * 1000,
      role: response.role,
      error: undefined,
    };
  } catch (error) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
        user_json: { label: "User JSON", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          if (credentials?.token && credentials?.user_json) {
            const user = JSON.parse(credentials.user_json as string);
            const tokenResponse = JSON.parse(credentials.token as string);
            return {
              id: user.id,
              name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
              email: user.email,
              image: user.avatar_url,
              role: user.role,
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token,
              expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
            };
          }

          if (!credentials?.identifier || !credentials?.password) return null;

          const response = await loginUser({
            identifier: credentials.identifier as string,
            password: credentials.password as string,
          });

          if (response.access_token && response.user) {
            return {
              id: response.user.id,
              name: `${response.user.first_name || ""} ${response.user.last_name || ""}`.trim(),
              email: response.user.email,
              image: response.user.avatar_url,
              role: response.role,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              expiresAt: Date.now() + response.expires_in * 1000,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          expiresAt: user.expiresAt,
          id: user.id,
          picture: user.image,
        };
      }

      if (account && account.provider === "google") {
        try {
          const response = await loginWithGoogle({
            id_token: account.id_token as string,
          });
          return {
            ...token,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: Date.now() + response.expires_in * 1000,
            role: response.role,
            id: response.user.id,
            name: `${response.user.first_name} ${response.user.last_name}`,
            picture: response.user.avatar_url,
          };
        } catch (error) {
          console.error("Google Login Sync Failed", error);
          return { ...token, error: "GoogleLoginError" };
        }
      }

      if (token.expiresAt && Date.now() < (token.expiresAt as number)) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.image = token.picture;
        session.error = token.error as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
