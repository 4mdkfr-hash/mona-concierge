"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MessageSquare,
  Bot,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Business", icon: Building2 },
  { id: 2, label: "WhatsApp", icon: MessageSquare },
  { id: 3, label: "AI Tone", icon: Bot },
  { id: 4, label: "Confirm", icon: CheckCircle2 },
];

const TYPES = [
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "salon", label: "Salon", emoji: "💇" },
  { id: "boutique", label: "Boutique", emoji: "🛍️" },
];

const TONES = [
  { id: "professional", label: "Professional", desc: "Formal and courteous" },
  { id: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { id: "luxury", label: "Luxury", desc: "Elegant, refined language" },
];

const LANGUAGES = [
  { id: "fr", label: "Français", flag: "FR" },
  { id: "en", label: "English", flag: "EN" },
  { id: "ru", label: "Русский", flag: "RU" },
];

const SANDBOX_NUMBER = "+14155238886";
const SANDBOX_CODE = "join silver-river";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<string>("");
  const [address, setAddress] = useState("");

  // Step 3
  const [tone, setTone] = useState("luxury");
  const [languages, setLanguages] = useState<string[]>(["fr", "en", "ru"]);

  const toggleLanguage = (id: string) => {
    setLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 1) return businessName.trim() !== "" && businessType !== "" && address.trim() !== "";
    if (step === 3) return languages.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, type: businessType, address, tone, languages }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save venue");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-3xl font-light text-gold-400 mb-1">MonaConcierge</div>
          <p className="text-sm text-fog">Set up your venue in minutes</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gold-400/10 text-gold-400 border border-gold-400/20"
                      : isDone
                      ? "text-emerald-400 border border-emerald-400/20 bg-emerald-400/5"
                      : "text-fog border border-graphite/50 bg-graphite/20"
                  }`}
                >
                  {isDone ? <Check size={12} /> : <Icon size={12} />}
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px ${isDone ? "bg-emerald-400/30" : "bg-graphite/50"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-carbon border border-graphite rounded-2xl p-6 space-y-6">

          {/* Step 1 — Business info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-light text-ivory mb-0.5">Your Business</h2>
                <p className="text-xs text-fog">Tell us about your venue</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-fog mb-1.5">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Le Grill Monaco"
                    className="w-full px-4 py-2.5 rounded-xl bg-void border border-graphite text-sm text-ivory placeholder-fog/50 focus:border-gold-400/40 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-fog mb-1.5">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setBusinessType(t.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          businessType === t.id
                            ? "border-gold-400/30 bg-gold-400/[0.06] text-gold-400"
                            : "border-graphite text-mist hover:border-graphite/80"
                        }`}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-fog mb-1.5">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Place du Casino, Monaco"
                    className="w-full px-4 py-2.5 rounded-xl bg-void border border-graphite text-sm text-ivory placeholder-fog/50 focus:border-gold-400/40 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Connect WhatsApp */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-light text-ivory mb-0.5">Connect WhatsApp</h2>
                <p className="text-xs text-fog">Join the Twilio Sandbox to test messaging</p>
              </div>

              <div className="bg-void border border-graphite/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="text-sm text-ivory">Open WhatsApp</p>
                    <p className="text-xs text-fog">on your phone</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="text-sm text-ivory">Send a message to the sandbox number</p>
                    <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-graphite/40 inline-block">
                      <span className="text-sm font-mono text-gold-400">{SANDBOX_NUMBER}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="text-sm text-ivory">Send this join code</p>
                    <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-graphite/40 inline-block">
                      <span className="text-sm font-mono text-gold-400">{SANDBOX_CODE}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-fog">
                You can skip this step and connect later from Settings → Connected Channels.
              </p>
            </div>
          )}

          {/* Step 3 — AI tone */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-light text-ivory mb-0.5">AI Personality</h2>
                <p className="text-xs text-fog">How should your AI assistant communicate?</p>
              </div>

              <div>
                <label className="block text-xs text-fog mb-2">Tone</label>
                <div className="space-y-2">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                        tone === t.id
                          ? "border-gold-400/30 bg-gold-400/[0.06]"
                          : "border-graphite hover:border-graphite/80"
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-medium ${tone === t.id ? "text-gold-400" : "text-ivory"}`}>
                          {t.label}
                        </div>
                        <div className="text-xs text-fog mt-0.5">{t.desc}</div>
                      </div>
                      {tone === t.id && <Check size={16} className="text-gold-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-fog mb-2">Response languages</label>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGES.map((l) => {
                    const active = languages.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        onClick={() => toggleLanguage(l.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${
                          active
                            ? "border-gold-400/30 bg-gold-400/[0.06] text-gold-400"
                            : "border-graphite text-fog hover:text-mist"
                        }`}
                      >
                        <span className="text-xs font-mono">{l.flag}</span>
                        {l.label}
                        {active && <Check size={13} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-light text-ivory mb-0.5">All set!</h2>
                <p className="text-xs text-fog">Review your settings before launching</p>
              </div>

              <div className="space-y-3">
                <div className="bg-void border border-graphite/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-fog uppercase tracking-wider">Venue</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-mist">Name</span>
                      <span className="text-xs text-ivory font-medium">{businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mist">Type</span>
                      <span className="text-xs text-ivory font-medium capitalize">{businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mist">Address</span>
                      <span className="text-xs text-ivory font-medium">{address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-void border border-graphite/50 rounded-xl p-4 space-y-3">
                  <span className="text-xs text-fog uppercase tracking-wider">AI Settings</span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-mist">Tone</span>
                      <span className="text-xs text-ivory font-medium capitalize">{tone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mist">Languages</span>
                      <div className="flex gap-1">
                        {languages.map((l) => (
                          <span key={l} className="text-xs font-mono bg-graphite/60 text-mist px-1.5 py-0.5 rounded-md uppercase">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-fog hover:text-mist disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gold-400 text-void text-sm font-semibold hover:bg-gold-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-400 text-void text-sm font-semibold hover:bg-gold-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Launch Dashboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
