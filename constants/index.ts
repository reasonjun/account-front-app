/**
 * 환경 변수를 가져오고, 값이 없을 경우 에러를 발생시키는 함수입니다.
 * @param key
 * @returns {string} 환경 변수의 값
 */
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    // 환경 변수가 없을 경우 에러를 발생시킵니다.
    // 이는 애플리케이션 시작 시점에 문제를 감지하는 데 도움이 됩니다.
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};

const constants = {
  NEXTAUTH_SECRET: getRequiredEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getRequiredEnv("NEXTAUTH_URL"),

  KEYCLOAK_ID: getRequiredEnv("KEYCLOAK_ID"),
  KEYCLOAK_OIDC_ISSUER: getRequiredEnv("KEYCLOAK_OIDC_ISSUER"),
  KEYCLOAK_SECRET: getRequiredEnv("KEYCLOAK_SECRET"),

  // JWT 토큰 관련 설정
  JWT: {
    // 토큰 디코딩 실패 시 fallback 만료 시간 (초 단위)
    FALLBACK_EXPIRY_TIME: 5 * 60, // 5분
  },
};

export default constants;
