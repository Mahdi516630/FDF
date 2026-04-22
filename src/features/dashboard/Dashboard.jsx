import React, { useMemo } from "react";
import { I } from "../../ui/icons";
import { Badge, StatCard } from "../../ui/primitives";
import { fmt } from "../../utils/format";

export function Dashboard({ designations, referees, categories }) {
  const totalFees = useMemo(
    () =>
      designations.reduce((sum, d) => {
        const cat = categories.find((c) => c.id === d.categoryid);
        return cat ? sum + cat.centralfee + cat.assistantfee * 2 + cat.fourthfee : sum;
      }, 0),
    [designations, categories]
  );

  const recent = [...designations].slice(0, 6);
  const getCat = (id) => categories.find((c) => c.id === id);
  const catColors = {};
  categories.forEach((c, i) => {
    catColors[c.id] = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5];
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={I.cal} label="TOTAL MATCHS" value={designations.length} sub="toutes périodes" color="#10b981" />
        <StatCard icon={I.users} label="ARBITRES" value={referees.length} color="#3b82f6" />
        <StatCard icon={I.tag} label="CATÉGORIES" value={categories.length} color="#8b5cf6" />
        <StatCard icon={I.bar} label="FRAIS CUMULÉS" value={fmt(totalFees)} sub="FDJ" color="#f59e0b" />
      </div>
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 20 }}>
        <h3 style={{ margin: "0 0 14px", color: "#f0fdf4", fontSize: 14, fontWeight: 700 }}>Dernières désignations</h3>
        {recent.length === 0 ? (
          <p style={{ color: "#374151", textAlign: "center", padding: 24 }}>Aucune désignation.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map((d) => {
              const cat = getCat(d.categoryid);
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", background: "rgba(0,0,0,.2)", borderRadius: 9 }}>
                  <span style={{ color: "#10b981" }}>{I.cal}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#f0fdf4", fontWeight: 600, fontSize: 13 }}>
                      {d.teama} <span style={{ color: "#374151" }}>vs</span> {d.teamb}
                    </span>
                    <span style={{ color: "#4b5563", fontSize: 11, marginLeft: 8 }}>
                      {d.date} {d.heure}
                    </span>
                  </div>
                  {cat && <Badge color={catColors[cat.id]}>{cat.name}</Badge>}
                  {d.matchnumber && <span style={{ color: "#374151", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>#{d.matchnumber}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

