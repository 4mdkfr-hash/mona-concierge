"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Star,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { VenueContext } from "@/contexts/VenueContext";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/bookings", icon: Calendar, label: "Reservations" },
  { href: "/reviews", icon: Star, label: "Reviews" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: "#F0F4F8" }}>
        <div className="spinner-cyan" />
      </div>
    }>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [paymentToast, setPaymentToast] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabaseRef.current = sb;
    let initialized = false;

    const handleSession = async (userId: string, email: string | undefined) => {
      if (initialized) return;
      initialized = true;
      setUserEmail(email ?? null);

      // Find venue linked to this user
      const { data: venue } = await sb
        .from("venues")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();

      if (!venue) {
        router.replace("/onboarding");
        return;
      }

      setVenueId(venue.id);

      // Fetch subscription status
      fetch(`/api/settings?venueId=${venue.id}`)
        .then((r) => (r.ok ? r.json() : {}))
        .then((data: Record<string, unknown>) => {
          if (data.subscription_status != null) {
            setSubscriptionStatus(data.subscription_status as string);
          }
        })
        .catch(() => {});

      setReady(true);
    };

    // Detect if this is an OAuth redirect (hash fragment contains access_token)
    // In that case, INITIAL_SESSION fires with null before Supabase processes the token.
    // We must wait for the SIGNED_IN event instead of redirecting away.
    const isOAuthRedirect = typeof window !== "undefined" && window.location.hash.includes("access_token");
    let waitingForOAuth = isOAuthRedirect;

    const { data: { subscription } } = sb.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION") {
          if (session) {
            await handleSession(session.user.id, session.user.email);
          } else if (!waitingForOAuth) {
            // No session and not an OAuth redirect — go to landing
            router.replace("/");
          }
          // If waitingForOAuth, do nothing — SIGNED_IN will fire next
        } else if (event === "SIGNED_IN") {
          waitingForOAuth = false;
          if (session) {
            await handleSession(session.user.id, session.user.email);
          }
        } else if (event === "SIGNED_OUT") {
          router.replace("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") {
      setSubscriptionStatus("active");
      setPaymentToast("success");
      setTimeout(() => setPaymentToast(null), 4000);
    } else if (billing === "cancelled") {
      setPaymentToast("cancelled");
      setTimeout(() => setPaymentToast(null), 3000);
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await supabaseRef.current?.auth.signOut();
    router.replace("/");
  };

  const handleSubscribeBanner = async () => {
    if (!venueId) return;
    setBannerLoading(true);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setBannerLoading(false);
  };

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#F0F4F8" }}>
        <div className="spinner-cyan" />
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: "#F0F4F8", color: "#0F2B3C" }}>
      {/* Sidebar — stays dark navy */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col"
        style={{ background: "#0F2B3C", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="font-display text-base font-semibold" style={{ color: "#C4A35A" }}>MonaConcierge</div>
          <div className="text-[10px] mt-0.5 tracking-wide" style={{ color: "rgba(91,143,168,0.7)" }}>Dashboard</div>
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm transition-all"
                style={{
                  background: active ? "rgba(196,163,90,0.12)" : "transparent",
                  color: active ? "#C4A35A" : "rgba(240,244,248,0.55)",
                  fontWeight: active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#F0F4F8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,244,248,0.55)";
                  }
                }}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {userEmail && (
            <div className="text-[11px] px-2 truncate" style={{ color: "rgba(91,143,168,0.6)" }}>{userEmail}</div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs transition-all"
            style={{ color: "rgba(91,143,168,0.6)", background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F0F4F8";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(91,143,168,0.6)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex flex-col" style={{ background: "#F0F4F8" }}>
        {/* Subscription banner */}
        {subscriptionStatus !== "active" && subscriptionStatus !== "trialing" && (
          <div
            className="flex items-center justify-between gap-4 px-6 py-3"
            style={{ background: "rgba(196,163,90,0.08)", borderBottom: "1px solid rgba(196,163,90,0.2)" }}
          >
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: "#C4A35A" }} className="font-semibold">Activez MonaConcierge</span>
              <span style={{ color: "#5B8FA8" }}>— €200/mois, tout inclus</span>
            </div>
            <button
              onClick={handleSubscribeBanner}
              disabled={bannerLoading}
              className="flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60 transition-all"
              style={{ background: "#C4A35A", color: "#FFFFFF" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#B0924E"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C4A35A"; }}
            >
              {bannerLoading ? "…" : "S'abonner →"}
            </button>
          </div>
        )}
        <VenueContext.Provider value={{ venueId: venueId! }}>
          {children}
        </VenueContext.Provider>
      </main>

      {/* Payment toast */}
      {paymentToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg transition-all ${
          paymentToast === "success"
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700"
            : "border text-mist"
        }`}
        style={paymentToast !== "success" ? { background: "#FFFFFF", borderColor: "#DDE4EB" } : {}}
        >
          {paymentToast === "success"
            ? "✓ Abonnement activé — bienvenue !"
            : "Paiement annulé."}
        </div>
      )}
    </div>
  );
}
