import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              理财助手
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              仪表盘
            </Link>
            <Link
              href="/stocks"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              股票
            </Link>
            <Link
              href="/funds"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              基金
            </Link>
            <Link
              href="/portfolio"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              持仓
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/alerts">
              <Bell className="h-5 w-5" />
              <span className="sr-only">价格提醒</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">用户</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
