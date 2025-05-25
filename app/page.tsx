"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>로딩 중...</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>로그인이 필요합니다</h1>
        <p>잠시 후 로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header
        style={{
          borderBottom: "1px solid #ccc",
          paddingBottom: "20px",
          marginBottom: "20px",
        }}
      >
        <h1>환영합니다! 🎉</h1>
        <button
          onClick={() => signOut()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </header>

      <main>
        <section style={{ marginBottom: "30px" }}>
          <h2>사용자 정보</h2>
          <div style={{ padding: "20px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>이름:</strong> {session.user?.name || "정보 없음"}
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>이메일:</strong> {session.user?.email || "정보 없음"}
            </div>
            {session.user?.image && (
              <div style={{ marginBottom: "10px" }}>
                <strong>프로필 이미지:</strong>
                <br />
                <img
                  src={session.user.image}
                  alt="프로필 이미지"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    marginTop: "5px",
                  }}
                />
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2>세션 정보</h2>
          <div style={{ padding: "20px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "10px" }}>
              <strong>Access Token:</strong>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {session.accessToken ? " ✅ 존재" : " ❌ 없음"}
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Access Token:</strong>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {session.refreshToken ? " ✅ 존재" : " ❌ 없음"}
              </span>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>ID Token:</strong>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {session.idToken ? " ✅ 존재" : " ❌ 없음"}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2>전체 세션 데이터 (개발용)</h2>
          <details>
            <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
              <strong>세션 객체 보기 (클릭)</strong>
            </summary>
            <pre
              style={{
                padding: "15px",
                borderRadius: "5px",
                fontSize: "12px",
                overflow: "auto",
                maxHeight: "300px",
              }}
            >
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </section>
      </main>
    </div>
  );
}
