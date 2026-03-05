"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Heart, TrendingUp } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/donate", label: "Give", icon: Heart },
  { href: "/invest", label: "Invest", icon: TrendingUp },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
