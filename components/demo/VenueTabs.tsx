import { DemoVenue } from "@/lib/demo-data";

interface Props {
  venues: DemoVenue[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function VenueTabs({ venues, activeId, onSelect }: Props) {
  return (
    <div className="flex gap-2 p-1 bg-carbon rounded-card border border-graphite">
      {venues.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v.id)}
          className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-sm font-medium transition-all ${
            activeId === v.id
              ? "bg-graphite text-ivory shadow-sm"
              : "text-mist hover:text-ivory hover:bg-graphite/50"
          }`}
        >
          <span className="text-base">{v.avatar}</span>
          <div className="text-left">
            <div className="font-semibold leading-tight">{v.name}</div>
            <div className="text-xs text-fog capitalize">{v.type} · {v.location}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
