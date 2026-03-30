"use client";

import { useEffect, useState, useRef } from "react";
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

    // onAuthStateChange handles both existing sessions and magic link redirects
    // INITIAL_SESSION fires immediately with current session (or null)
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          if (!session) {
            if (event === "INITIAL_SESSION") router.replace("/");
            return;
          }
          await handleSession(session.user.id, session.user.email);
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
        {/* Subscription banner */}
        {subscriptionStatus !== "active" && subscriptionStatus !== "trialing" && (
          <div className="flex items-center justify-between gap-4 px-6 py-3 bg-gold-400/[0.08] border-b border-gold-400/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gold-400 font-semibold">Activez MonaConcierge</span>
              <span className="text-mist/70">— €200/mois, tout inclus</span>
            </div>
            <button
              onClick={handleSubscribeBanner}
              disabled={bannerLoading}
              className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-gold-400 text-void text-xs font-semibold hover:bg-gold-500 disabled:opacity-60 transition-all"
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
            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
            : "bg-fog/10 border border-graphite text-fog"
        }`}>
          {paymentToast === "success"
            ? "✓ Abonnement activé — bienvenue !"
            : "Paiement annulé."}
        </div>
      )}
    </div>
  );
}
