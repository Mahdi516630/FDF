// =============================================================================
// client/src/features/reporting/exportNetAPayer.ts
// Hérité FDF — export Excel stylisé "Net à Payer"
// =============================================================================
import ExcelJS from "exceljs";
import type { RefereeNetPayer, Category } from "../../types.js";
import { fmt } from "../../utils/format.js";

function borderAll(thin = true): ExcelJS.Borders {
  const style: ExcelJS.BorderStyle = thin ? "thin" : "medium";
  const color = { argb: "FF9CA3AF" };
  return { top: { style, color }, left: { style, color }, bottom: { style, color }, right: { style, color } };
}

function styleRange(
  ws: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number,
  fn: (cell: ExcelJS.Cell) => void
) {
  for (let r = r1; r <= r2; r++)
    for (let c = c1; c <= c2; c++) fn(ws.getCell(r, c));
}

export async function exportNetPayerXLS(
  data: { referee: RefereeNetPayer; cats: Record<string, { total: number; C: number; A: number; F: number }>; net: number }[],
  categories: Category[],
  period: string
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FDF Referee Manager v3";
  const ws = wb.addWorksheet("Feuil2", { views: [{ showGridLines: false }] });

  const cols = ["N°", "NOM", "NIVEAU", ...categories.map(c => c.name.toUpperCase()), "NET À PAYER", "PHONE"];
  const widths = [5, 26, 16, ...categories.map(() => 10), 12, 14];
  ws.columns = widths.map(w => ({ width: w }));
  const lastCol = cols.length;

  // Header rows
  for (let i = 1; i <= 6; i++) ws.addRow([]);

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
  ws.getCell(6, 2).value = `FRAIS DU MOIS DE ${period.toUpperCase()} COMPLET`;
  ws.getCell(6, 2).font = { bold: true, size: 11 };
  ws.getCell(6, 2).alignment = { horizontal: "center", vertical: "middle" };
  styleRange(ws, 6, 2, 6, lastCol - 1, cell => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBD7EE" } };
    cell.border = borderAll();
  });

  // Column headers
  ws.addRow(cols);
  ws.getRow(7).height = 18;
  styleRange(ws, 7, 1, 7, lastCol, cell => {
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1D5DB" } };
    cell.border = borderAll(false);
  });

  // Data rows
  data.forEach((row, idx) => {
    const rowData = [
      idx + 1,
      row.referee.name,
      row.referee.level ?? "",
      ...categories.map(c => {
        const d = row.cats[c.id];
        return d?.total > 0 ? `${fmt(d.total)}\n(${d.C},${d.A},${d.F})` : "";
      }),
      row.net,
      row.referee.phone ?? "",
    ];
    ws.addRow(rowData);
  });

  if (data.length > 0) {
    styleRange(ws, 8, 1, 7 + data.length, lastCol, (cell, ) => {
      cell.border = borderAll();
      cell.font = { size: 10 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
  }

  // Total row
  const totals = categories.map(c => data.reduce((s, r) => s + (r.cats[c.id]?.total ?? 0), 0));
  const grandTotal = data.reduce((s, r) => s + r.net, 0);
  const totalRow = ws.addRow(["TOTAL", "", "", ...totals, grandTotal, ""]);
  totalRow.height = 18;
  styleRange(ws, totalRow.number, 1, totalRow.number, lastCol, cell => {
    cell.font = { bold: true, size: 10 };
    cell.border = borderAll(false);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Net_A_Payer_${period.replace(/\s/g, "_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}


// =============================================================================
// client/src/features/reporting/exportPDF.ts
// Hérité CCA — export PDF rapport arbitre (jsPDF + autoTable)
// =============================================================================
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function exportPDF(
  data: { referee: RefereeNetPayer; cats: Record<string, { total: number; C: number; A: number; F: number }>; net: number }[],
  categories: Category[],
  period: string
) {
  const doc = new jsPDF("l", "mm", "a4");
  const pw = doc.internal.pageSize.width;

  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("FÉDÉRATION DJIBOUTIENNE DE FOOTBALL", pw / 2, 15, { align: "center" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Tel : (00253) 35 35 99 - Fax : (00253) 35 35 98 - B.P : 2694 - fdf@yahoo.fr", pw / 2, 21, { align: "center" });
  doc.setFontSize(12); doc.setFont("helvetica", "bold");
  doc.text("COMMISSION CENTRALE DES ARBITRES", pw / 2, 30, { align: "center" });
  doc.setFontSize(10);
  doc.text(`FRAIS DU MOIS DE ${period.toUpperCase()} COMPLET`, pw / 2, 38, { align: "center" });

  const head = [["N°", "NOM", "NIVEAU", ...categories.map(c => c.name), "NET À PAYER", "PHONE"]];
  const body = data.map((row, idx) => [
    idx + 1,
    row.referee.name.toUpperCase(),
    row.referee.level ?? "",
    ...categories.map(c => {
      const d = row.cats[c.id];
      return d?.total > 0 ? `${d.total}(${d.C},${d.A},${d.F})` : "";
    }),
    row.net.toLocaleString(),
    row.referee.phone ?? "",
  ]);

  const totals = categories.map(c => data.reduce((s, r) => s + (r.cats[c.id]?.total ?? 0), 0));
  const grandTotal = data.reduce((s, r) => s + r.net, 0);
  body.push(["", "TOTAL", "", ...totals.map(String), grandTotal.toLocaleString(), ""]);

  autoTable(doc, {
    startY: 44, head, body,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0] },
    headStyles: { fillColor: [220, 220, 220], fontStyle: "bold", halign: "center" },
  });

  doc.save(`Net_A_Payer_${period.replace(/\s/g, "_")}.pdf`);
}


// =============================================================================
// client/src/features/reporting/ReportingTab.tsx
// =============================================================================
import { useEffect, useMemo, useState } from "react";
import { reportingApi } from "../../api/reporting.js";
import type { RefereeNetPayer, Category } from "../../types.js";
import { fmt } from "../../utils/format.js";
import { LEVEL_COLORS } from "../../constants/levels.js";

interface Props {
  categories: Category[];
  toast: (msg: string, type?: string) => void;
}

export function ReportingTab({ categories, toast }: Props) {
  const [raw, setRaw]           = useState<RefereeNetPayer[]>([]);
  const [loading, setLoading]   = useState(false);
  const [period, setPeriod]     = useState(() => {
    const d = new Date();
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase();
  });
  const [filterCat, setFilterCat] = useState("all");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await reportingApi.netAPayer({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, categoryId: filterCat !== "all" ? filterCat : undefined });
      setRaw(data);
    } catch (e: any) { toast("Erreur chargement rapport.", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Agréger par arbitre (toutes catégories)
  const reportData = useMemo(() => {
    const map: Record<string, { referee: RefereeNetPayer; cats: Record<string, { total: number; C: number; A: number; F: number }>; net: number }> = {};
    raw.forEach(r => {
      if (!map[r.id]) map[r.id] = { referee: r, cats: {}, net: 0 };
      map[r.id].cats[r.categoryId] = { total: r.totalFee, C: 0, A: 0, F: r.matchCount };
      map[r.id].net += r.totalFee;
    });
    return Object.values(map).filter(r => r.net > 0).sort((a, b) => a.referee.name.localeCompare(b.referee.name));
  }, [raw]);

  const totalFees = reportData.reduce((s, r) => s + r.net, 0);

  const TH: React.CSSProperties = { padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".07em", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" };
  const TD: React.CSSProperties = { padding: "9px 12px", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,.04)", textAlign: "center" };

  return (
    <div>
      {/* En-tête FDF */}
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "14px 20px", marginBottom: 18, textAlign: "center" }}>
        <p style={{ margin: 0, color: "#10b981", fontWeight: 800, fontSize: 14, letterSpacing: ".05em" }}>FÉDÉRATION DJIBOUTIENNE DE FOOTBALL</p>
        <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 11 }}>Tel : (00253) 35 35 99 — fdf@yahoo.fr</p>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,transparent,#10b981,transparent)", margin: "8px auto" }} />
        <p style={{ margin: 0, color: "#d1d5db", fontWeight: 700, fontSize: 13 }}>COMMISSION CENTRALE DES ARBITRES</p>
        <p style={{ margin: "4px 0 0", color: "#f59e0b", fontWeight: 800, fontSize: 15 }}>NET À PAYER — FRAIS DU MOIS DE {period.toUpperCase()}</p>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        {[
          { label: "PÉRIODE (affichage)", val: period, set: setPeriod, type: "text", placeholder: "AVRIL 2026" },
          { label: "DATE DÉBUT", val: dateFrom, set: setDateFrom, type: "date" },
          { label: "DATE FIN", val: dateTo, set: setDateTo, type: "date" },
        ].map(f => (
          <div key={f.label}>
            <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 13px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit" }} />
          </div>
        ))}
        <div>
          <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>CATÉGORIE</label>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 13px", color: "#f0fdf4", fontSize: 13 }}>
            <option value="all">Toutes</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={load} disabled={loading}
          style={{ padding: "10px 16px", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 9, color: "#10b981", fontSize: 13, cursor: "pointer" }}>
          {loading ? "…" : "Actualiser"}
        </button>
        <button onClick={() => exportNetPayerXLS(reportData, categories, period).then(() => toast("Export Excel téléchargé !"))}
          style={{ padding: "10px 16px", background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 9, color: "#60a5fa", fontSize: 13, cursor: "pointer" }}>
          📥 Excel
        </button>
        <button onClick={() => { exportPDF(reportData, categories, period); toast("PDF téléchargé !"); }}
          style={{ padding: "10px 16px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 9, color: "#f87171", fontSize: 13, cursor: "pointer" }}>
          📄 PDF
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "ARBITRES ACTIFS", val: reportData.length, color: "#3b82f6" },
          { label: "TOTAL FDJ",       val: fmt(totalFees),    color: "#f59e0b" },
          { label: "CATÉGORIES",      val: categories.length, color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".07em" }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {reportData.length === 0
        ? <div style={{ textAlign: "center", padding: 60, color: "#374151" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📊</div><p>Aucune donnée. Ajustez les filtres et actualisez.</p></div>
        : (
          <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid rgba(255,255,255,.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,.5)" }}>
                  <th style={{ ...TH, textAlign: "left" }}>N°</th>
                  <th style={{ ...TH, textAlign: "left", minWidth: 160 }}>NOM</th>
                  <th style={{ ...TH, textAlign: "left" }}>NIVEAU</th>
                  {categories.map(c => <th key={c.id} style={{ ...TH, minWidth: 90 }}>{c.name.toUpperCase()}</th>)}
                  <th style={{ ...TH, color: "#f59e0b", minWidth: 110 }}>NET À PAYER</th>
                  <th style={{ ...TH, textAlign: "left" }}>TÉLÉPHONE</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={row.referee.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                    <td style={{ ...TD, textAlign: "left", color: "#4b5563" }}>{idx + 1}</td>
                    <td style={{ ...TD, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                          {row.referee.name.charAt(0)}
                        </div>
                        <span style={{ color: "#f0fdf4", fontWeight: 700 }}>{row.referee.name}</span>
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign: "left" }}>
                      <span style={{ background: `${LEVEL_COLORS[row.referee.level ?? ""] ?? "#6b7280"}18`, color: LEVEL_COLORS[row.referee.level ?? ""] ?? "#6b7280", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {row.referee.level ?? "—"}
                      </span>
                    </td>
                    {categories.map(c => {
                      const d = row.cats[c.id];
                      return (
                        <td key={c.id} style={TD}>
                          {d?.total > 0
                            ? <span style={{ color: "#10b981", fontWeight: 700, fontFamily: "monospace" }}>{fmt(d.total)}</span>
                            : <span style={{ color: "#1f2937" }}>—</span>}
                        </td>
                      );
                    })}
                    <td style={TD}><span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>{fmt(row.net)}</span></td>
                    <td style={{ ...TD, textAlign: "left", color: "#6b7280", fontFamily: "monospace" }}>{row.referee.phone ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}
