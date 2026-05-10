import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "理财助手 - 智能投资分析工具",
  description: "基于技术分析和基本面分析的智能理财辅助工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
