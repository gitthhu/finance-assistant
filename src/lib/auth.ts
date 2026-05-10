// Supabase Auth 配置
// 用于多用户模式（可选）

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 获取当前登录用户
 */
export async function getCurrentUser() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const result = await supabase.auth.getUser();
  
  if (result.error) {
    console.error("获取用户信息失败:", result.error);
    return null;
  }
  
  return result.data.user;
}

/**
 * 注册新用户
 */
export async function register(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * 登录
 */
export async function login(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * 登出
 */
export async function logout() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("登出失败:", error);
  }
}

/**
 * 重置密码
 */
export async function resetPassword(email: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
  });
  
  if (error) {
    throw error;
  }
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase.auth.onAuthStateChange(callback);
}
