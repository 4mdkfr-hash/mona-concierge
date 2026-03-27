"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Star,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/bookings", icon: Calendar, label: "Reservations" },
  { href: "/reviews", icon: Star, label: "Reviews" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabaseRef.current = sb;
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/");
      else {
        setUserEmail(session.user.email ?? null);
        setReady(true);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabaseRef.current?.auth.signOut();
    router.replace("/");
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-void">
        <span className="text-gold-400/50 text-sm tracking-widest">✦</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-void text-ivory">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-graphite border-r border-graphite/50 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-graphite/50">
          <div className="font-display text-base font-semibold text-gold-400">MonaConcierge</div>
          <div className="text-[10px] text-fog mt-0.5 tracking-wide">Dashboard</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm transition-all ${
                  active
                    ? "bg-gold-400/10 text-gold-400 font-medium"
                    : "text-mist hover:text-ivory hover:bg-white/5"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-graphite/50 space-y-2">
          {userEmail && (
            <div className="text-[11px] text-fog px-2 truncate">{userEmail}</div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs text-fog hover:text-ivory hover:bg-white/5 transition-all"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col bg-obsidian">
        {children}
      </main>
    </div>
  );
}
