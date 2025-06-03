"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Login } from "@reasonjun/design-system-app";

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
    .max(100, "비밀번호는 100자를 초과할 수 없습니다"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Credentials 방식 (직접 로그인)
  const handleDirectLogin = async (data: LoginFormData) => {
    try {
      const result = await signIn("keycloak-credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        // 로그인 성공 - 수동으로 페이지 이동
        router.push("/");
      } else {
        setError("root", {
          type: "manual",
          message: "로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.",
        });
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("root", {
        type: "manual",
        message: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  const handleSignUpClick = () => {
    router.push("/auth/signup");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <Login
        control={control}
        errors={errors}
        isLoading={isSubmitting}
        formError={errors.root?.message}
        onSubmit={handleSubmit(handleDirectLogin)}
        onSignUpClick={handleSignUpClick}
      />
    </div>
  );
}
