const FLAGS: Record<string, string> = { fr: "🇫🇷", en: "🇬🇧", ru: "🇷🇺" };

interface Props {
  lang: string;
}

export default function LanguageBadge({ lang }: Props) {
  const flag = FLAGS[lang.toLowerCase()] ?? "🌐";
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-fog">
      {flag} {lang.toUpperCase()}
    </span>
  );
}
