import { redirect } from "next/navigation";

// Root redirect — next-intl middleware handles / → /fr (default locale)
// This file is a fallback only; middleware runs first.
export default function RootPage() {
  redirect("/fr");
}
