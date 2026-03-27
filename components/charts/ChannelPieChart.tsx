"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  whatsapp: "#25D366",
  instagram: "#E1306C",
  google_bm: "#4285F4",
  google: "#4285F4",
};

const LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  google_bm: "Google",
  google: "Google",
};

interface Props {
  data: Record<string, number>;
}

export default function ChannelPieChart({ data }: Props) {
  const entries = Object.entries(data).map(([k, v]) => ({
    name: LABELS[k] ?? k,
    value: v,
    color: COLORS[k] ?? "#6B6B7A",
  }));

  if (entries.length === 0) return <p className="text-fog text-sm">Aucune donnée.</p>;

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={entries} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
            {entries.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#1E2330", border: "1px solid #1E2330", borderRadius: 8, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
            <span className="text-mist">{e.name}</span>
            <span className="font-semibold text-ivory ml-auto pl-3">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
