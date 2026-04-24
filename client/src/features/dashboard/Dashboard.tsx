// =============================================================================
// client/src/features/dashboard/Dashboard.tsx
// Hérité FDF — migré TypeScript + Recharts
// =============================================================================
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { DesignationDetail, Referee, Category } from "../../types.js";
import { fmt, fmtDate } from "../../utils/format.js";
import { LEVEL_COLORS } from "../../constants/levels.js";

interface Props {
  designations: DesignationDetail[];
  referees: Referee[];
  categories: Category[];
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#4b5563" }}>{sub}</p>}
      </div>
    </div>
  );
}

export function Dashboard({ designations, referees, categories }: Props) {
  // Stats globales
  const totalFees = useMemo(() => {
    return designations.reduce((s, d) => s + d.totalMatchFee, 0);
  }, [designations]);

  // Matchs par catégorie pour le bar chart
  const chartData = useMemo(() => {
    return categories.map(c => ({
      name: c.name,
      matchs: designations.filter(d => d.categoryId === c.id).length,
    }));
  }, [designations, categories]);

  // 5 dernières désignations
  const recent = useMemo(() =>
    [...designations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [designations]
  );

  // Distribution des niveaux arbitres
  const levelDist = useMemo(() => {
    const map: Record<string, number> = {};
    referees.forEach(r => {
      const key = r.level ?? "—";
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [referees]);

  const TH: React.CSSProperties = { padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".07em", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" };
  const TD: React.CSSProperties = { padding: "9px 12px", fontSize: 12, color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,.04)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <StatCard icon="🏟" label="Matchs total"    value={designations.length}  color="#10b981" />
        <StatCard icon="👤" label="Arbitres"         value={referees.length}      color="#3b82f6" />
        <StatCard icon="📂" label="Catégories"       value={categories.length}    color="#8b5cf6" />
        <StatCard icon="💰" label="Total frais"      value={fmt(totalFees)} sub="FDJ" color="#f59e0b" />
      </div>

      {/* Graphique + distribution niveaux */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>

        {/* Bar chart matchs par catégorie */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 16px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em" }}>Matchs par catégorie</p>
          {chartData.length === 0
            ? <p style={{ color: "#374151", textAlign: "center", padding: 40 }}>Aucune donnée</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0b1628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#f0fdf4" }}
                    itemStyle={{ color: "#10b981" }}
                  />
                  <Bar dataKey="matchs" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Distribution niveaux */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "18px 16px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em" }}>Niveaux arbitres</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {levelDist.map(([level, count]) => (
              <div key={level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: LEVEL_COLORS[level] ?? "#6b7280", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#d1d5db", flex: 1 }}>{level}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_COLORS[level] ?? "#9ca3af" }}>{count}</span>
              </div>
            ))}
            {levelDist.length === 0 && <p style={{ color: "#374151", fontSize: 12 }}>Aucun arbitre</p>}
          </div>
        </div>
      </div>

      {/* Désignations récentes */}
      <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
        <p style={{ margin: 0, padding: "14px 18px", fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          Désignations récentes
        </p>
        {recent.length === 0
          ? <p style={{ color: "#374151", textAlign: "center", padding: 40 }}>Aucune désignation</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><th style={TH}>Date</th><th style={TH}>Match</th><th style={TH}>Catégorie</th><th style={TH}>Arbitre central</th></tr>
              </thead>
              <tbody>
                {recent.map(d => (
                  <tr key={d.id}>
                    <td style={TD}>{fmtDate(d.date)}</td>
                    <td style={TD}><span style={{ color: "#f0fdf4", fontWeight: 600 }}>{d.teamA}</span> <span style={{ color: "#4b5563" }}>vs</span> <span style={{ color: "#f0fdf4", fontWeight: 600 }}>{d.teamB}</span></td>
                    <td style={TD}><span style={{ background: "rgba(16,185,129,.12)", color: "#10b981", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.categoryName}</span></td>
                    <td style={TD}>{d.centralName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}
