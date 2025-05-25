"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod 스키마 정의
const loginSchema = z.object({
  username: z
    .string()
    .min(1, "사용자명을 입력해주세요")
    .min(3, "사용자명은 최소 3자 이상이어야 합니다")
    .max(50, "사용자명은 50자를 초과할 수 없습니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다")
    .max(100, "비밀번호는 100자를 초과할 수 없습니다")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur" // 포커스가 벗어날 때 유효성 검사
  });

  // Credentials 방식 (직접 로그인)
  const handleDirectLogin = async (data: LoginFormData) => {
    try {
      const result = await signIn("keycloak-credentials", {
        username: data.username,
        password: data.password,
        redirect: false, // 페이지 리다이렉트 방지
      });

      if (result?.ok) {
        // 로그인 성공 - 수동으로 페이지 이동
        router.push("/");
      } else {
        // 로그인 실패 처리
        alert("로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>로그인</h1>

      {/* 직접 로그인 폼 */}
      <form onSubmit={handleSubmit(handleDirectLogin)}>
        <div style={{ marginBottom: "15px" }}>
          <label>사용자명:</label>
          <input
            type="text"
            {...register("username")}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: errors.username ? "1px solid #dc3545" : "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder="사용자명을 입력하세요"
          />
          {errors.username && (
            <p style={{
              color: "#dc3545",
              fontSize: "14px",
              marginTop: "5px",
              marginBottom: "0"
            }}>
              {errors.username.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>비밀번호:</label>
          <input
            type="password"
            {...register("password")}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              border: errors.password ? "1px solid #dc3545" : "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder="비밀번호를 입력하세요"
          />
          {errors.password && (
            <p style={{
              color: "#dc3545",
              fontSize: "14px",
              marginTop: "5px",
              marginBottom: "0"
            }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "500"
          }}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
