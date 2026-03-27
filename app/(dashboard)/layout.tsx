"use client";

import { useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "◈", label: "Dashboard" },
  { href: "/inbox", icon: "💬", label: "Inbox" },
  { href: "/bookings", icon: "📅", label: "Bookings" },
  { href: "/reviews", icon: "⭐", label: "Reviews" },
  { href: "/settings", icon: "⚙", label: "Settings" },
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
      if (!session) {
        router.replace("/");
      } else {
        setUserEmail(session.user.email ?? null);
        setReady(true);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    if (!supabaseRef.current) return;
    await supabaseRef.current.auth.signOut();
    router.replace("/");
  };

  if (!ready) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0A0A0F" }}>
        <div style={{ color: "rgba(201,168,76,0.5)", fontSize: "0.8rem", letterSpacing: "0.15em" }}>✦</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0A0A0F", color: "#F5F0E8", fontFamily: "inherit" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px",
        flexShrink: 0,
        background: "#0D0D17",
        borderRight: "1px solid rgba(201,168,76,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#C9A84C", letterSpacing: "0.04em" }}>
            MonaConcierge
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(245,240,232,0.3)", marginTop: "2px", letterSpacing: "0.06em" }}>
            Dashboard
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.75rem", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.75rem",
                  marginBottom: "2px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  background: active ? "rgba(201,168,76,0.1)" : "transparent",
                  color: active ? "#C9A84C" : "rgba(245,240,232,0.55)",
                  fontSize: "0.82rem",
                  fontWeight: active ? 500 : 400,
                  transition: "background 0.15s, color 0.15s",
                  borderLeft: active ? "2px solid #C9A84C" : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: "1rem", width: "18px", textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
          {userEmail && (
            <div style={{ fontSize: "0.68rem", color: "rgba(245,240,232,0.35)", marginBottom: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "0.45rem",
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "3px",
              color: "rgba(245,240,232,0.4)",
              fontSize: "0.72rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)";
              (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,240,232,0.4)";
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
