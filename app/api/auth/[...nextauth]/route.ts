import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import constants from "@/constants";
import { decodeJwt } from "jose";

const handler = NextAuth({
  secret: constants.NEXTAUTH_SECRET,
  providers: [
    // Credentials Provider (직접 로그인)
    CredentialsProvider({
      id: "keycloak-credentials",
      name: "Keycloak Direct Login",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "사용자명을 입력하세요",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "비밀번호를 입력하세요",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Keycloak Token Endpoint에 직접 ROPC 요청
          const tokenResponse = await fetch(
            `${constants.KEYCLOAK_OIDC_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "password", // ← ROPC Grant Type
                client_id: constants.KEYCLOAK_ID,
                client_secret: constants.KEYCLOAK_SECRET,
                username: credentials.username,
                password: credentials.password,
                scope: "openid email profile",
              }),
            },
          );

          if (!tokenResponse.ok) {
            console.error("Token request failed:", await tokenResponse.text());
            return null;
          }

          const tokens = await tokenResponse.json();

          // UserInfo Endpoint에서 사용자 정보 가져오기
          const userInfoResponse = await fetch(
            `${constants.KEYCLOAK_OIDC_ISSUER}/protocol/openid-connect/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            },
          );

          if (!userInfoResponse.ok) {
            console.error("UserInfo request failed");
            return null;
          }

          const userInfo = await userInfoResponse.json();

          // NextAuth 형식으로 사용자 객체 반환
          return {
            id: userInfo.sub,
            name: userInfo.name || userInfo.preferred_username,
            email: userInfo.email,
            image: userInfo.picture,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            idToken: tokens.id_token,
          };
        } catch (error) {
          console.error("Keycloak ROPC authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // 최초 로그인 시 토큰과 만료 시간을 저장합니다.
      if (user) {
        let expiresAt: number =
          Math.floor(Date.now() / 1000) + constants.JWT.FALLBACK_EXPIRY_TIME;

        try {
          // accessToken을 디코딩하여 실제 exp 시간 추출
          const decodedAccessToken = decodeJwt(user.accessToken!);

          if (decodedAccessToken?.exp) expiresAt = decodedAccessToken.exp;
        } catch (error) {
          console.error("Failed to decode accessToken:", error);
        }

        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          idToken: user.idToken,
          expiresAt,
        };
      }
      // 토큰이 아직 유효한 경우
      else if (Date.now() < token.expiresAt * 1000) {
        return token;
      }
      // 토큰이 만료된 경우: 리프레시 시도
      else {
        if (!token.refreshToken) {
          return { ...token, error: "RefreshTokenError" };
        }

        try {
          console.log("Access token expired, refreshing...");

          // Keycloak 토큰 갱신 요청
          const response = await fetch(
            `${constants.KEYCLOAK_OIDC_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: constants.KEYCLOAK_ID,
                client_secret: constants.KEYCLOAK_SECRET,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
              }),
            },
          );

          if (!response.ok) {
            return { ...token, error: "RefreshTokenError" };
          }

          const newTokens = await response.json();
          // 새로운 accessToken에서 실제 만료 시간 추출
          let newExpiresAt: number =
            Math.floor(Date.now() / 1000) + constants.JWT.FALLBACK_EXPIRY_TIME;

          try {
            const decodedNewAccessToken = decodeJwt(newTokens.access_token);

            if (decodedNewAccessToken?.exp) newExpiresAt = decodedNewAccessToken.exp;
          } catch (error) {
            console.error("Failed to decode new accessToken:", error);
          }

          return {
            ...token,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || token.refreshToken,
            idToken: newTokens.id_token,
            expiresAt: newExpiresAt,
            error: undefined, // 에러 클리어
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);

          // 토큰 갱신에 실패하면, 페이지에서 처리할 수 있도록 에러를 반환해야 합니다.
          return { ...token, error: "RefreshTokenError" };
        }
      }
    },
    async session({ session, token }) {
      // 토큰들을 세션에 직접 할당
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.idToken = token.idToken;
      session.error = token.error;

      // JWT의 exp 클레임에 맞춰 세션 만료시간 설정
      if (token.expiresAt) {
        session.expires = new Date(token.expiresAt * 1000).toISOString();
        console.log("Session expires aligned with JWT exp:", session.expires);
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
