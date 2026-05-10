"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { register, login, getCurrentUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // 登录
        const { error } = await login(email, password);
        if (error) throw error;
        router.push("/dashboard");
      } else {
        // 注册
        const { error } = await register(email, password);
        if (error) throw error;
        setMessage("注册成功！请检查邮箱验证链接。");
      }
    } catch (err: any) {
      setError(err.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isLogin ? "登录" : "注册"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                邮箱
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                密码
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-500">
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "处理中..." : isLogin ? "登录" : "注册"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isLogin ? (
              <>
                没有账号？{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  立即登录
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              返回首页
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
