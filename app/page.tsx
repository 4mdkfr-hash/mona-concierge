"use client";

import { useState, useEffect, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabaseRef.current = sb;

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/inbox");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseRef.current) return;
    setLoading(true);
    setError("");

    const { error } = await supabaseRef.current.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/inbox`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            MonaConcierge
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            AI-powered customer engagement for Monaco &amp; Cote d&apos;Azur
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="font-medium text-emerald-800">Check your email</p>
            <p className="mt-1 text-sm text-emerald-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Sign in with Magic Link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
