import React, { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { I } from "../../ui/icons";
import { Badge, Btn, IS, SS, StatCard } from "../../ui/primitives";
import { fmt } from "../../utils/format";

async function downloadExcel(workbook, filename) {
  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function borderAll(thin = true) {
  const style = thin ? "thin" : "medium";
  return {
    top: { style, color: { argb: "FF9CA3AF" } },
    left: { style, color: { argb: "FF9CA3AF" } },
    bottom: { style, color: { argb: "FF9CA3AF" } },
    right: { style, color: { argb: "FF9CA3AF" } },
  };
}

function styleRange(ws, r1, c1, r2, c2, styleFn) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) styleFn(ws.getCell(r, c), r, c);
  }
}

async function exportNetPayerXLS(reportData, categories, period) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FDF Referee Manager";
  const ws = wb.addWorksheet("Feuil2", { views: [{ showGridLines: false }] });

  const cols = ["N°", "NOM", "NIVEAU", ...categories.map((c) => c.name.toUpperCase()), "NET A PAYER", "PHONE"];
  const colWidths = [5, 26, 16, ...categories.map(() => 10), 12, 14];
  ws.columns = colWidths.map((w) => ({ width: w }));
  const lastCol = cols.length;

  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);
  ws.addRow([]);

  ws.mergeCells(2, 2, 2, lastCol - 1);
  ws.getCell(2, 2).value = "FÉDÉRATION DJIBOUTIENNE DE FOOTBALL";
  ws.getCell(2, 2).font = { bold: true, size: 12 };
  ws.getCell(2, 2).alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(3, 2, 3, lastCol - 1);
  ws.getCell(3, 2).value = "Tel : (00253) 35 35 99 - Fax : (00253) 35 35 98 - B.P : 2694";
  ws.getCell(3, 2).font = { size: 10 };
  ws.getCell(3, 2).alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(4, 2, 4, lastCol - 1);
  ws.getCell(4, 2).value = "fdf@yahoo.fr";
  ws.getCell(4, 2).font = { size: 10 };
  ws.getCell(4, 2).alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(5, 2, 5, lastCol - 1);
  ws.getCell(5, 2).value = "COMMISSION CENTRALE DES ARBITRES";
  ws.getCell(5, 2).font = { bold: true, size: 11 };
  ws.getCell(5, 2).alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(6, 2, 6, lastCol - 1);
  ws.getCell(6, 2).value = `FRAIS DU MOIS DE ${String(period || "").toUpperCase()} COMPLET`;
  ws.getCell(6, 2).font = { bold: true, size: 11, color: { argb: "FF000000" } };
  ws.getCell(6, 2).alignment = { horizontal: "center", vertical: "middle" };
  styleRange(ws, 6, 2, 6, lastCol - 1, (cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBD7EE" } };
    cell.border = borderAll(true);
  });
  ws.getRow(6).height = 20;

  ws.addRow(cols);
  ws.getRow(7).height = 18;
  styleRange(ws, 7, 1, 7, lastCol, (cell) => {
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1D5DB" } };
    cell.border = borderAll(false);
  });

  reportData.forEach((row, idx) => {
    const data = [
      idx + 1,
      row.referee.name,
      row.referee.level || "",
      ...categories.map((c) => {
        const d = row.cats[c.id];
        return d?.total > 0 ? `${fmt(d.total)}\n(${d.C},${d.A},${d.F})` : "";
      }),
      row.net,
      row.referee.phone || "",
    ];
    ws.addRow(data);
  });

  const firstDataRow = 8;
  const lastDataRow = firstDataRow + reportData.length - 1;
  if (reportData.length > 0) {
    styleRange(ws, firstDataRow, 1, lastDataRow, lastCol, (cell, _r, c) => {
      cell.border = borderAll(true);
      if (c === 2 || c === 3) cell.alignment = { horizontal: "left", vertical: "middle" };
      else if (c >= 4 && c <= lastCol - 2) cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      else cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { size: 10 };
      if (c === lastCol - 1) cell.numFmt = "#,##0";
    });
  }

  const totals = categories.map((c) => reportData.reduce((s, r) => s + (r.cats[c.id]?.total || 0), 0));
  const netTotal = reportData.reduce((s, r) => s + (r.net || 0), 0);
  const totalRow = ws.addRow(["TOTAL", "", "", ...totals, netTotal, ""]);
  totalRow.height = 18;
  styleRange(ws, totalRow.number, 1, totalRow.number, lastCol, (cell) => {
    cell.font = { bold: true, size: 10 };
    cell.border = borderAll(false);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    if (typeof cell.value === "number") cell.numFmt = "#,##0";
  });
  ws.getCell(totalRow.number, 2).alignment = { horizontal: "left", vertical: "middle" };

  ws.pageSetup = {
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };

  await downloadExcel(wb, `Net_A_Payer_${String(period || "").replace(/\\s/g, "_")}.xlsx`);
}

export function ReportingTab({ designations, referees, categories, toast }) {
  const [period, setPeriod] = useState("MARS 2026");
  const [filterCat, setFilterCat] = useState("all");

  const filteredDesigs = filterCat === "all" ? designations : designations.filter((d) => d.categoryid === filterCat);

  const reportData = useMemo(() => {
    return referees
      .map((referee) => {
        let net = 0;
        const cats = {};
        categories.forEach((cat) => {
          const ms = filteredDesigs.filter((d) => d.categoryid === cat.id);
          const C = ms.filter((d) => d.centralid === referee.id).length;
          const A = ms.filter((d) => d.assistant1id === referee.id || d.assistant2id === referee.id).length;
          const F = ms.filter((d) => d.fourthid === referee.id).length;
          const total = C * cat.centralfee + A * cat.assistantfee + F * cat.fourthfee;
          net += total;
          cats[cat.id] = { total, C, A, F };
        });
        return { referee, cats, net };
      })
      .filter((r) => r.net > 0)
      .sort((a, b) => a.referee.name.localeCompare(b.referee.name));
  }, [filteredDesigs, referees, categories]);

  const totalFees = reportData.reduce((s, r) => s + r.net, 0);

  const levelColor = {
    Élite: "#f59e0b",
    International: "#10b981",
    "National A": "#3b82f6",
    "National B": "#8b5cf6",
    Régional: "#06b6d4",
    "Stagiaire 2023": "#6b7280",
    "Stagiaire 2024": "#6b7280",
    "Stagiaire 2025": "#6b7280",
  };
  const catColors = {};
  categories.forEach((c, i) => {
    catColors[c.id] = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][i % 5];
  });

  const TH = { padding: "11px 12px", textAlign: "center", color: "#6b7280", fontSize: 10, fontWeight: 700, letterSpacing: ".07em", borderBottom: "1px solid rgba(255,255,255,.08)", whiteSpace: "nowrap" };
  const TD = { padding: "9px 12px", fontSize: 12 };

  return (
    <div>
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "16px 24px", marginBottom: 20, textAlign: "center" }}>
        <p style={{ margin: 0, color: "#10b981", fontWeight: 800, fontSize: 14, letterSpacing: ".05em" }}>FÉDÉRATION DJIBOUTIENNE DE FOOTBALL</p>
        <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>Tel : (00253) 35 35 99 — fdf@yahoo.fr</p>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,transparent,#10b981,transparent)", margin: "10px auto" }} />
        <p style={{ margin: 0, color: "#d1d5db", fontWeight: 700, fontSize: 13 }}>COMMISSION CENTRALE DES ARBITRES</p>
        <p style={{ margin: "4px 0 0", color: "#f59e0b", fontWeight: 800, fontSize: 15, letterSpacing: ".02em" }}>NET À PAYER — FRAIS DU MOIS DE {period.toUpperCase()}</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>PÉRIODE</label>
          <input value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...IS, width: 160 }} placeholder="MARS 2026" />
        </div>
        <div>
          <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>FILTRER CATÉGORIE</label>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...SS, width: 160 }}>
            <option value="all">Toutes</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 18 }}>
          <Btn
            onClick={() => {
              exportNetPayerXLS(reportData, categories, period);
              toast("Export Excel téléchargé !");
            }}
            color="#3b82f6"
          >
            {I.dl} Export Excel
          </Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={I.trophy} label="MATCHS TOTAL" value={filteredDesigs.length} color="#10b981" />
        <StatCard icon={I.users} label="ARBITRES ACTIFS" value={reportData.length} color="#3b82f6" />
        <StatCard icon={I.bar} label="TOTAL FDJ" value={`${fmt(totalFees)}`} sub="FDJ" color="#f59e0b" />
      </div>

      {reportData.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#374151" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p>Aucune donnée.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,.6)" }}>
                <th style={TH}>N°</th>
                <th style={{ ...TH, textAlign: "left", minWidth: 160 }}>NOM</th>
                <th style={{ ...TH, textAlign: "left", minWidth: 120 }}>NIVEAU</th>
                {categories.map((c) => (
                  <th key={c.id} style={{ ...TH, color: catColors[c.id], minWidth: 100 }}>
                    {c.name.toUpperCase()}
                  </th>
                ))}
                <th style={{ ...TH, color: "#f59e0b", minWidth: 110 }}>NET À PAYER</th>
                <th style={{ ...TH, textAlign: "left", minWidth: 100 }}>TÉLÉPHONE</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={row.referee.id} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ ...TD, textAlign: "center", color: "#4b5563" }}>{idx + 1}</td>
                  <td style={{ ...TD }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{row.referee.name.charAt(0)}</div>
                      <span style={{ color: "#f0fdf4", fontWeight: 700 }}>{row.referee.name}</span>
                    </div>
                  </td>
                  <td style={{ ...TD }}>
                    <Badge color={levelColor[row.referee.level] || "#6b7280"}>{row.referee.level || "—"}</Badge>
                  </td>
                  {categories.map((c) => {
                    const d = row.cats[c.id];
                    return (
                      <td key={c.id} style={{ ...TD, textAlign: "center" }}>
                        {d.total > 0 ? (
                          <div>
                            <span style={{ color: catColors[c.id], fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(d.total)}</span>
                            <br />
                            <span style={{ color: "#4b5563", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>({d.C},{d.A},{d.F})</span>
                          </div>
                        ) : (
                          <span style={{ color: "#1f2937" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ ...TD, textAlign: "center" }}>
                    <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 14, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(row.net)}</span>
                  </td>
                  <td style={{ ...TD, color: "#6b7280", fontFamily: "'JetBrains Mono',monospace" }}>{row.referee.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

