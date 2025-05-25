import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"]
    accessToken: string
    idToken: string
    refreshToken?: string
    error?: "RefreshTokenError"
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    accessToken: string
    idToken: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    accessToken: string
    idToken: string
    expiresAt: number
    refreshToken?: string
    error?: "RefreshTokenError"
  }
}
