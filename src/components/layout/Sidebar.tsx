import Link from "next/link";
import { Home, TrendingUp, DollarSign, Bell } from "lucide-react";

const menuItems = [
  {
    title: "仪表盘",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "股票",
    href: "/stocks",
    icon: TrendingUp,
  },
  {
    title: "基金",
    href: "/funds",
    icon: DollarSign,
  },
  {
    title: "提醒",
    href: "/alerts",
    icon: Bell,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="font-bold">
          理财助手
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
