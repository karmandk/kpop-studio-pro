import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Song, TierContainer } from "../../lib/types";
import { getTierColor } from "../../lib/types";
import { BarChart3 } from "lucide-react";

interface StatsPageProps {
  songs: Song[];
  containers: TierContainer[];
}

export default function StatsPage({ songs, containers }: StatsPageProps) {
  const tierColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    containers.forEach((c) => { map[c.header] = getTierColor(c.header, c.color); });
    return map;
  }, [containers]);

  const topGroups = useMemo(() => {
    const map: Record<string, number> = {};
    songs.forEach((s) => {
      map[s.group] = (map[s.group] || 0) + parseInt(s.views || "0");
    });
    return Object.entries(map)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);
  }, [songs]);

  const tierDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    songs.forEach((s) => {
      const t = s.tier || "?";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([tier, count]) => ({
      name: tier,
      value: count,
      color: tierColorMap[tier] || "#888",
    }));
  }, [songs, tierColorMap]);

  const viewsByTier = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    songs.forEach((s) => {
      const t = s.tier || "?";
      if (!map[t]) map[t] = { total: 0, count: 0 };
      map[t].total += parseInt(s.views || "0");
      map[t].count += 1;
    });
    return containers
      .map((c) => ({
        name: c.header,
        avgViews: map[c.header] ? Math.round(map[c.header].total / map[c.header].count) : 0,
        totalViews: map[c.header]?.total || 0,
        color: getTierColor(c.header, c.color),
      }))
      .filter((d) => d.totalViews > 0);
  }, [songs, containers]);

  const yearBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    songs.forEach((s) => {
      map[s.year] = (map[s.year] || 0) + 1;
    });
    return Object.entries(map)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [songs]);

  const formatViews = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return v.toLocaleString();
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-semibold">No data to visualize</p>
        <p className="text-sm mt-1">Go to Discovery Hub and <strong>BAKE DATA</strong> first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tracks" value={songs.length.toString()} />
        <StatCard label="Groups" value={new Set(songs.map((s) => s.group)).size.toString()} />
        <StatCard label="Most Viewed" value={songs.reduce((a, b) => parseInt(a.views || "0") > parseInt(b.views || "0") ? a : b).group} />
        <StatCard label="Total Views" value={formatViews(songs.reduce((sum, s) => sum + parseInt(s.views || "0"), 0))} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Groups by Views */}
        <ChartCard title="Top Groups by Total Views">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topGroups} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tickFormatter={formatViews} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#d1d5db", fontSize: 11 }} />
              <Tooltip
                formatter={(v: number | undefined) => [formatViews(v ?? 0), "Views"]}
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Songs per Tier */}
        <ChartCard title="Songs per Tier">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={tierDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {tierDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Average Views per Tier */}
        <ChartCard title="Average Views per Tier">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={viewsByTier}>
              <XAxis dataKey="name" tick={{ fill: "#d1d5db", fontSize: 12 }} />
              <YAxis tickFormatter={formatViews} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip
                formatter={(v: number | undefined) => [formatViews(v ?? 0), "Avg Views"]}
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="avgViews" radius={[4, 4, 0, 0]}>
                {viewsByTier.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Year Breakdown */}
        {yearBreakdown.length > 1 && (
          <ChartCard title="Tracks by Year">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearBreakdown}>
                <XAxis dataKey="year" tick={{ fill: "#d1d5db", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-xl p-4">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</p>
      <p className="text-2xl font-black mt-1 truncate">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}
