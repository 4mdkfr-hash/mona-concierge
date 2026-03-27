"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  label: string;
  count: number;
}

interface Props {
  data: DataPoint[];
}

export default function ActivityBarChart({ data }: Props) {
  if (data.length === 0) return <p className="text-fog text-sm">Aucune donnée.</p>;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={16}>
        <XAxis dataKey="label" tick={{ fill: "#6B6B7A", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6B6B7A", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{ background: "#1E2330", border: "1px solid #1E2330", borderRadius: 8, fontSize: 11 }}
          cursor={{ fill: "rgba(212,175,55,0.05)" }}
        />
        <Bar dataKey="count" name="Messages" fill="#D4AF37" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
