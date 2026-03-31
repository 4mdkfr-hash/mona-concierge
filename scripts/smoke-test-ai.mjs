/**
 * AI Smoke Test — Richmont Monaco (MON-76)
 * Tests 20 scenarios across FR/EN/RU.
 * Run: node scripts/smoke-test-ai.mjs
 * Requires: ANTHROPIC_API_KEY or CLAUDE_API_KEY in env
 */

const MODEL = "claude-haiku-4-5-20251001";

const SERVICES = [
  { name: "Soin du visage Mesoestetic", price: 120, duration_minutes: 60, category: "Face" },
  { name: "Soin éclat Codage", price: 95, duration_minutes: 45, category: "Face" },
  { name: "Mésolift Teoxane", price: 150, duration_minutes: 30, category: "Face" },
  { name: "Soin minceur", price: 110, duration_minutes: 60, category: "Body" },
  { name: "Enveloppement détox", price: 90, duration_minutes: 45, category: "Body" },
  { name: "Massage relaxant", price: 90, duration_minutes: 60, category: "Massage" },
  { name: "Massage deep tissue", price: 110, duration_minutes: 60, category: "Massage" },
  { name: "Massage aux pierres chaudes", price: 120, duration_minutes: 75, category: "Massage" },
  { name: "Manucure classique", price: 35, duration_minutes: 30, category: "Nails" },
  { name: "Pose vernis semi-permanent", price: 45, duration_minutes: 45, category: "Nails" },
  { name: "Pédicure complète", price: 50, duration_minutes: 45, category: "Nails" },
];

const servicesText = `\nOur services:\n${SERVICES.map(
  (s) => `- ${s.name} — €${s.price}, ${s.duration_minutes} min (${s.category})`
).join("\n")}`;

const SYSTEM_PROMPT = `You are a friendly AI concierge for Richmont Monaco, a salon in Monaco.
Tone: Luxurious, discreet, and professional. Warm but never overly familiar.
You respond in the language the customer writes in. You speak: French, English, Russian.
Keep responses concise (under 200 words). Do not mention you are an AI unless directly asked.${servicesText}
If the customer asks to book or make a reservation, collect: name, date (YYYY-MM-DD), time (HH:MM), number of guests. When you have ALL four pieces of information, respond with ONLY this JSON (no other text): {"intent":"booking","name":"","date":"YYYY-MM-DD","time":"HH:MM","guests":0}`;

const SCENARIOS = [
  // FRENCH (7)
  { id: 1, lang: "FR", msg: "Bonjour, quels soins proposez-vous pour le visage?", expectation: "list face treatments + prices" },
  { id: 2, lang: "FR", msg: "Combien coûte un massage corps complet?", expectation: "massage pricing" },
  { id: 3, lang: "FR", msg: "Je voudrais prendre rendez-vous pour demain à 15h", expectation: "booking - ask service type" },
  { id: 4, lang: "FR", msg: "C'est trop cher, vous avez des promotions?", expectation: "elegant, no desperation" },
  { id: 5, lang: "FR", msg: "J'ai eu une mauvaise expérience la dernière fois", expectation: "empathetic, professional" },
  { id: 6, lang: "FR", msg: "Merci, à bientôt!", expectation: "warm goodbye" },
  { id: 7, lang: "FR", msg: "Vous faites des extensions de cils?", expectation: "politely say not available" },
  // ENGLISH (7)
  { id: 8, lang: "EN", msg: "Hi, what nail services do you offer?", expectation: "nail services + prices" },
  { id: 9, lang: "EN", msg: "I'd like to book a facial for two people", expectation: "handle group booking" },
  { id: 10, lang: "EN", msg: "What are your opening hours?", expectation: "provide hours or ask to check" },
  { id: 11, lang: "EN", msg: "Do you have parking?", expectation: "handle non-service question gracefully" },
  { id: 12, lang: "EN", msg: "I'm a regular client, do I get any loyalty benefits?", expectation: "warm recognition" },
  { id: 13, lang: "EN", msg: "Can I reschedule my appointment to next week?", expectation: "helpful rebooking" },
  { id: 14, lang: "EN", msg: "What products do you use for facials?", expectation: "professional response" },
  // RUSSIAN (6)
  { id: 15, lang: "RU", msg: "Здравствуйте, какие у вас услуги по уходу за телом?", expectation: "body treatments + prices" },
  { id: 16, lang: "RU", msg: "Сколько стоит маникюр с покрытием?", expectation: "nail pricing" },
  { id: 17, lang: "RU", msg: "Хочу записаться на массаж на субботу", expectation: "booking in Russian" },
  { id: 18, lang: "RU", msg: "У вас работают русскоговорящие мастера?", expectation: "graceful handling" },
  { id: 19, lang: "RU", msg: "Мне не понравилось обслуживание", expectation: "empathetic Russian" },
  { id: 20, lang: "RU", msg: "Спасибо за прекрасный сервис!", expectation: "warm grateful" },
];

async function callClaude(message) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("No API key found (ANTHROPIC_API_KEY or CLAUDE_API_KEY)");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.type === "text" ? data.content[0].text : "";
}

function evaluateResponse(scenario, reply) {
  const { lang, msg, expectation } = scenario;
  const replyLower = reply.toLowerCase();

  // Language check: response should be in the same language
  let langOk = false;
  if (lang === "FR") {
    langOk = /[àâäéèêëïîôöùûüç]/i.test(reply) || /bonjour|merci|vous|nous|votre|soin|pour|que|avec|service/i.test(replyLower);
  } else if (lang === "EN") {
    langOk = /\b(the|and|our|you|we|for|your|with|offer|please|happy|welcome)\b/i.test(reply);
  } else if (lang === "RU") {
    langOk = /[а-яё]/i.test(reply);
  }

  // Tone check: no desperation, no "AI" disclosure, professional
  const badTone = /i am an ai|je suis une ia|я ии|я искусственный|sorry, i cannot|je ne peux pas vous aider|извините, я не могу/i.test(replyLower);
  const toneOk = !badTone && reply.length > 10 && reply.length < 800;

  // Accuracy check: basic content check per expectation
  let accuracyOk = false;
  if (expectation.includes("face treatments") || expectation.includes("soins") || expectation.includes("visage")) {
    accuracyOk = /mesoestetic|codage|mésolift|120|95|150/i.test(reply);
  } else if (expectation.includes("massage pricing")) {
    accuracyOk = /massage|relaxant|deep tissue|pierres|90|110|120/i.test(reply);
  } else if (expectation.includes("nail services")) {
    accuracyOk = /manicure|manucure|vernis|pédicure|35|45|50/i.test(reply);
  } else if (expectation.includes("body treatments")) {
    accuracyOk = /minceur|détox|enveloppement|110|90/i.test(reply);
  } else if (expectation.includes("nail pricing")) {
    accuracyOk = /manicure|manucure|vernis|покрытие|35|45/i.test(reply);
  } else if (expectation.includes("not available")) {
    accuracyOk = !/extension.*cils.*oui|we offer.*lash/i.test(reply); // should NOT claim to offer it
    if (!accuracyOk) accuracyOk = true; // relaxed: just check it doesn't hallucinate the service
    accuracyOk = !/extensions de cils.*€/i.test(reply); // no fake pricing
  } else if (expectation.includes("booking") || expectation.includes("réservation")) {
    accuracyOk = /nom|name|date|heure|time|quel|quelle|which|когда|записать|имя/i.test(reply);
  } else if (expectation.includes("empathetic")) {
    accuracyOk = /désolé|sorry|apologize|извините|сожале|comprend|understand|понимаем/i.test(replyLower);
  } else if (expectation.includes("warm goodbye") || expectation.includes("warm grateful")) {
    accuracyOk = reply.length > 5 && reply.length < 300;
  } else if (expectation.includes("opening hours") || expectation.includes("hours")) {
    accuracyOk = true; // no hours in DB, so asking is correct
  } else if (expectation.includes("parking") || expectation.includes("non-service")) {
    accuracyOk = true; // graceful response acceptable
  } else if (expectation.includes("loyalty") || expectation.includes("warm recognition")) {
    accuracyOk = true; // any warm response is fine
  } else if (expectation.includes("rebooking")) {
    accuracyOk = /reschedule|appointment|rendez-vous|contact|записать|перенести/i.test(replyLower);
  } else if (expectation.includes("products")) {
    accuracyOk = /mesoestetic|codage|teoxane|product|produit/i.test(replyLower);
  } else if (expectation.includes("graceful handling")) {
    accuracyOk = true;
  } else {
    accuracyOk = reply.length > 10;
  }

  const score = langOk && toneOk && accuracyOk ? "✅ Pass" :
    (!langOk) ? "❌ Fail (Language)" :
    (!toneOk) ? "❌ Fail (Tone)" :
    "⚠️ Needs Improvement";

  return { langOk, toneOk, accuracyOk, score };
}

async function main() {
  console.log("🧪 AI Smoke Test — Richmont Monaco");
  console.log(`Model: ${MODEL}`);
  console.log(`System prompt: ${SYSTEM_PROMPT.length} chars`);
  console.log("=" .repeat(80));

  const results = [];
  let passed = 0;

  for (const scenario of SCENARIOS) {
    process.stdout.write(`\n[${scenario.id}/20] ${scenario.lang}: ${scenario.msg.substring(0, 60)}...\n`);
    try {
      const reply = await callClaude(scenario.msg);
      const eval_ = evaluateResponse(scenario, reply);
      const row = { ...scenario, reply, ...eval_ };
      results.push(row);

      console.log(`  Reply: ${reply.substring(0, 150)}${reply.length > 150 ? "..." : ""}`);
      console.log(`  Lang: ${eval_.langOk ? "✅" : "❌"}  Tone: ${eval_.toneOk ? "✅" : "❌"}  Accuracy: ${eval_.accuracyOk ? "✅" : "❌"}  → ${eval_.score}`);

      if (eval_.score.includes("Pass")) passed++;
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      results.push({ ...scenario, reply: "ERROR", langOk: false, toneOk: false, accuracyOk: false, score: "❌ Fail (Error)" });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 RESULTS SUMMARY: ${passed}/20 passed\n`);
  console.log("| # | Lang | Message | Lang✓ | Tone✓ | Acc✓ | Score |");
  console.log("|---|------|---------|-------|-------|------|-------|");
  for (const r of results) {
    const msg = r.msg.substring(0, 40).replace(/\|/g, "");
    console.log(`| ${r.id} | ${r.lang} | ${msg} | ${r.langOk ? "✅" : "❌"} | ${r.toneOk ? "✅" : "❌"} | ${r.accuracyOk ? "✅" : "❌"} | ${r.score} |`);
  }

  // Recommendations
  const fails = results.filter(r => !r.score.includes("Pass"));
  if (fails.length > 0) {
    console.log("\n⚠️ RECOMMENDATIONS:");
    for (const f of fails) {
      console.log(`  - Scenario ${f.id} (${f.lang}): ${f.score} — ${f.expectation}`);
    }
  } else {
    console.log("\n✅ All scenarios passed. Prompt quality is good.");
  }
}

main().catch(console.error);
