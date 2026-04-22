import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

/* ═══════════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════════ */
const Ic = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const I = {
  shield:   <Ic d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  users:    <Ic d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"]} />,
  tag:      <Ic d={["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"]} />,
  cal:      <Ic d={["M8 2v4","M16 2v4","M3 10h18","M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"]} />,
  bar:      <Ic d={["M12 20V10","M18 20V4","M6 20v-4"]} />,
  dl:       <Ic d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} />,
  plus:     <Ic d={["M12 5v14","M5 12h14"]} />,
  edit:     <Ic d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} />,
  trash:    <Ic d={["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"]} />,
  search:   <Ic d={["M21 21l-4.35-4.35","M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"]} />,
  x:        <Ic d={["M18 6L6 18","M6 6l12 12"]} />,
  logout:   <Ic d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"]} />,
  eye:      <Ic d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />,
  eyeOff:   <Ic d={["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24","M1 1l22 22"]} />,
  file:     <Ic d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />,
  upload:   <Ic d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />,
  check:    <Ic d="M20 6L9 17l-5-5" />,
  filter:   <Ic d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  trophy:   <Ic d={["M6 9H4.5a2.5 2.5 0 0 1 0-5H6","M18 9h1.5a2.5 2.5 0 0 0 0-5H18","M4 22h16","M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22","M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22","M18 2H6v7a6 6 0 0 0 12 0V2z"]} />,
  table:    <Ic d={["M3 3h18v18H3z","M3 9h18","M3 15h18","M9 3v18","M15 3v18"]} />,
  star:     <Ic d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  award:    <Ic d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"]} />,
};

/* ═══════════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════════ */
const genId = () => Math.random().toString(36).substr(2, 9);
const fmt = (n) => (n || 0).toLocaleString("fr-FR");
const today = new Date().toISOString().slice(0, 10);

const storage = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ═══════════════════════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════════════════════ */
const LEVELS = ["Élite","International","National A","National B","Régional","Stagiaire 2023","Stagiaire 2024","Stagiaire 2025"];

const SEED_REFS = [
  { id:"r1", name:"Abdi Hassan Omar",     phone:"77831245", level:"International",   createdAt: today },
  { id:"r2", name:"Fadumo Warsame Ali",   phone:"77913467", level:"National A",      createdAt: today },
  { id:"r3", name:"Mahad Ismail Dirie",   phone:"77567890", level:"Élite",           createdAt: today },
  { id:"r4", name:"Hodan Jama Elmi",      phone:"77234512", level:"National B",      createdAt: today },
  { id:"r5", name:"Daher Guirreh Aden",   phone:"77678901", level:"Régional",        createdAt: today },
  { id:"r6", name:"Said Ali Ahmed",       phone:"77658774", level:"Stagiaire 2023",  createdAt: today },
  { id:"r7", name:"Moussa Dirieh",        phone:"77112233", level:"National A",      createdAt: today },
];
const SEED_CATS = [
  { id:"c1", name:"Ligue 1",    centralfee:8000,  assistantfee:5000, fourthfee:3000 },
  { id:"c2", name:"Ligue 2",    centralfee:6000,  assistantfee:4000, fourthfee:2500 },
  { id:"c3", name:"Coupe FDF",  centralfee:10000, assistantfee:6500, fourthfee:4000 },
];
const SEED_DESIGS = [
  { id:"d1", date:"21 AVRIL", jour:"LUNDI",  heure:"17H00", teama:"AS Port",     teamb:"Artar Sihid",  terrain:"Académie Douda", matchnumber:"61", categoryid:"c3", centralid:"r1", assistant1id:"r2", assistant2id:"r3", fourthid:"r4", observateur:"Med Ali Farah" },
  { id:"d2", date:"21 AVRIL", jour:"LUNDI",  heure:"19H00", teama:"ASAS Télécom",teamb:"FC Obock",     terrain:"",               matchnumber:"62", categoryid:"c3", centralid:"r5", assistant1id:"r6", assistant2id:"r7", fourthid:"r1", observateur:"Ourouke" },
  { id:"d3", date:"22 AVRIL", jour:"MARDI",  heure:"17H00", teama:"AS Arta",     teamb:"Dikhil FC",   terrain:"El Hadj Hassan",  matchnumber:"01", categoryid:"c1", centralid:"r2", assistant1id:"r3", assistant2id:"r4", fourthid:"r5", observateur:"" },
  { id:"d4", date:"22 AVRIL", jour:"MARDI",  heure:"19H00", teama:"FC Djibouti", teamb:"Gendarmerie", terrain:"El Hadj Hassan",  matchnumber:"02", categoryid:"c1", centralid:"r6", assistant1id:"r7", assistant2id:"r1", fourthid:"r2", observateur:"" },
  { id:"d5", date:"23 AVRIL", jour:"MERCREDI",heure:"17H00",teama:"Police FC",   teamb:"AS Tadjourah",terrain:"El Hadj Hassan",  matchnumber:"03", categoryid:"c2", centralid:"r3", assistant1id:"r4", assistant2id:"r5", fourthid:"r6", observateur:"" },
];

/* ═══════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = genId();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}
function Toaster({ toasts }) {
  return (
    <div style={{ position:"fixed", top:16, right:16, zIndex:999, display:"flex", flexDirection:"column", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px", borderRadius:12, color:"#fff", fontWeight:600, fontSize:13, boxShadow:"0 8px 32px rgba(0,0,0,.4)", minWidth:260, animation:"toastIn .3s ease",
          background: t.type==="error"?"linear-gradient(135deg,#ef4444,#dc2626)":t.type==="warning"?"linear-gradient(135deg,#f59e0b,#d97706)":"linear-gradient(135deg,#10b981,#059669)" }}>
          <span style={{ fontSize:16 }}>{t.type==="error"?"✕":t.type==="warning"?"⚠":"✓"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXCEL EXPORT ENGINE (.xlsx)
═══════════════════════════════════════════════════════════════════ */
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
    for (let c = c1; c <= c2; c++) {
      const cell = ws.getCell(r, c);
      styleFn(cell, r, c);
    }
  }
}

function buildXLSXBlob(sheetName, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (Array.isArray(colWidths) && colWidths.length) {
    ws["!cols"] = colWidths.map((wch) => ({ wch }));
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function exportDesignationXLS(category, selectedDesigs, referees, categories) {
  const cat = categories.find(c => c.id === category?.id);
  const getRef = (id) => referees.find(r => r.id === id);

  const header = [
    ["","","","","","","","","","","","",""],
    ["","","","","","","","","","","","",""],
    ["","","","","","","","FÉDÉRATION DJIBOUTIENNE DE FOOTBALL","","","","",""],
    ["","","","","","","","Tel : (00253) 35 35 99 - Fax : (00253) 35 35 98 - B.P : 2694","","","","",""],
    ["","","","","","","","fdf@yahoo.fr","","","","",""],
    ["","","","","","","","","","","","",""],
    ["","","","","","","","COMMISSION CENTRALE DES ARBITRES","","","","",""],
    ["","","","","","","","","","","","",""],
    ["","","","","","","","","",cat ? cat.name.toUpperCase() : "DÉSIGNATION","","",""],
    ["","","","","","","","","","","","",""],
    ["Date","JOUR","HEURE","Equipe A","Equipe B","TERRAIN","MATC N°","Arbitre","Assisstant 1","Assisstant 2","4eme officiel","OBSERVATEUR",""],
  ];

  const dataRows = selectedDesigs.map(d => [
    d.date,
    d.jour || "",
    d.heure || "",
    d.teama,
    d.teamb,
    d.terrain || "",
    d.matchnumber,
    getRef(d.centralid)?.name || "",
    getRef(d.assistant1id)?.name || "",
    getRef(d.assistant2id)?.name || "",
    getRef(d.fourthid)?.name || "",
    d.observateur || "",
    "",
  ]);

  const allRows = [...header, ...dataRows];
  const blob = buildXLSXBlob(cat?.name || "Désignation", allRows, [12,10,8,18,18,20,8,22,22,22,18,18,5]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Désignation_${(cat?.name||"matchs").replace(/\s/g,"_")}_${new Date().toISOString().slice(0,10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportNetPayerXLS(reportData, categories, period) {
  // Template close to your screenshot (merges + blue band + grey header + strong borders).
  const wb = new ExcelJS.Workbook();
  wb.creator = "FDF Referee Manager";
  const ws = wb.addWorksheet("Feuil2", { views: [{ showGridLines: false }] });

  // Columns: N | NOM | NIVEAU | (categories...) | NET A PAYER | PHONE
  const cols = ["N°", "NOM", "NIVEAU", ...categories.map((c) => c.name.toUpperCase()), "NET A PAYER", "PHONE"];
  const colWidths = [
    5,
    26,
    16,
    ...categories.map(() => 10),
    12,
    14,
  ];
  ws.columns = colWidths.map((w) => ({ width: w }));

  const lastCol = cols.length; // 1-based in ExcelJS

  // Top header area (rows 1-6)
  ws.addRow([]); // 1
  ws.addRow([]); // 2
  ws.addRow([]); // 3
  ws.addRow([]); // 4
  ws.addRow([]); // 5
  ws.addRow([]); // 6

  // Centered federation block (merged across)
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

  // Blue band
  ws.mergeCells(6, 2, 6, lastCol - 1);
  ws.getCell(6, 2).value = `FRAIS DU MOIS DE ${String(period || "").toUpperCase()} COMPLET`;
  ws.getCell(6, 2).font = { bold: true, size: 11, color: { argb: "FF000000" } };
  ws.getCell(6, 2).alignment = { horizontal: "center", vertical: "middle" };
  styleRange(ws, 6, 2, 6, lastCol - 1, (cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBD7EE" } }; // light blue
    cell.border = borderAll(true);
  });
  ws.getRow(6).height = 20;

  // Table header (row 7)
  ws.addRow(cols); // row 7
  ws.getRow(7).height = 18;
  styleRange(ws, 7, 1, 7, lastCol, (cell) => {
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1D5DB" } }; // grey
    cell.border = borderAll(false);
  });

  // Data rows start at row 8
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

  // Body borders + alignment
  if (reportData.length > 0) {
    styleRange(ws, firstDataRow, 1, lastDataRow, lastCol, (cell, r, c) => {
      cell.border = borderAll(true);
      if (c === 2) cell.alignment = { horizontal: "left", vertical: "middle" };
      else if (c === 3) cell.alignment = { horizontal: "left", vertical: "middle" };
      else if (c >= 4 && c <= lastCol - 2) cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      else cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { size: 10 };
      if (c === lastCol - 1) cell.numFmt = "#,##0";
    });
  }

  // TOTAL row
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

  // Print settings (nice A4 portrait like screenshot)
  ws.pageSetup = {
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };

  await downloadExcel(wb, `Net_A_Payer_${String(period || "").replace(/\s/g, "_")}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS COMMUNS
═══════════════════════════════════════════════════════════════════ */
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", backdropFilter:"blur(6px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#0b1628", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, width:"100%", maxWidth: wide?760:520, maxHeight:"92vh", overflowY:"auto", animation:"slideIn .25s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,.07)", position:"sticky", top:0, background:"#0b1628", zIndex:1 }}>
          <h3 style={{ margin:0, color:"#f0fdf4", fontWeight:800, fontSize:15 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", color:"#9ca3af", display:"flex", alignItems:"center", justifyContent:"center" }}>{I.x}</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

const IS = { width:"100%", background:"rgba(0,0,0,.35)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", color:"#f0fdf4", fontFamily:"'Syne',sans-serif", fontSize:13, outline:"none", boxSizing:"border-box" };
const SS = { ...IS, cursor:"pointer" };

function Field({ label, children, half }) {
  return (
    <div style={{ marginBottom:12, width: half?"calc(50% - 6px)":"100%" }}>
      <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em", display:"block", marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color="#10b981", outline, sm, disabled }) {
  const bg = outline ? "transparent" : `linear-gradient(135deg, ${color}, ${color}dd)`;
  return (
    <button onClick={onClick} disabled={disabled} style={{ display:"flex", alignItems:"center", gap:6, padding: sm?"7px 13px":"10px 18px", background: disabled?"rgba(255,255,255,.05)":bg, border: outline?`1px solid ${color}40`:"none", borderRadius:8, color: disabled?"#4b5563": outline?color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize: sm?12:13, cursor: disabled?"not-allowed":"pointer", opacity: disabled?.6:1, transition:"all .2s", whiteSpace:"nowrap" }}>
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, sub, color="#10b981" }) {
  return (
    <div style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-16, right:-16, width:70, height:70, borderRadius:"50%", background:`${color}18` }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ margin:"0 0 4px", color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em" }}>{label}</p>
          <p style={{ margin:0, color:"#f0fdf4", fontSize:24, fontWeight:800, letterSpacing:"-.5px" }}>{value}</p>
          {sub && <p style={{ margin:"3px 0 0", color:"#374151", fontSize:11 }}>{sub}</p>}
        </div>
        <div style={{ color, background:`${color}18`, borderRadius:9, padding:8 }}>{icon}</div>
      </div>
    </div>
  );
}

function Badge({ children, color="#10b981" }) {
  return <span style={{ background:`${color}20`, color, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{children}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════════════════════════ */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const UKEY = "fdf_users";
  const getUsers = () => storage.get(UKEY, [{ email:"admin@fdf.dj", password:"admin123" }]);

  const handle = () => {
    setErr("");
    const e = email.toLowerCase().trim();
    if (!e||!pw) { setErr("Tous les champs sont requis."); return; }
    const users = getUsers();
    if (mode==="login") {
      const u = users.find(u=>u.email===e&&u.password===pw);
      if (!u) { setErr("Email ou mot de passe incorrect."); return; }
    } else {
      if (users.find(u=>u.email===e)) { setErr("Email déjà utilisé."); return; }
      if (pw.length<6) { setErr("Mot de passe trop court (min 6)."); return; }
      storage.set(UKEY,[...users,{email:e,password:pw}]);
    }
    onLogin({ email: e, token: genId() });
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#07101d 0%,#0a1828 60%,#071018 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#07101d}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
        input,select,textarea{font-family:'Syne',sans-serif!important;color:#f0fdf4!important}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6)}
        input::placeholder{color:#374151!important}
        select option{background:#0b1628;color:#f0fdf4}
        .row-hover:hover{background:rgba(255,255,255,.04)!important}
        .btn-ghost:hover{background:rgba(255,255,255,.08)!important}
        .cb-row:hover{background:rgba(16,185,129,.06)!important;cursor:pointer}
      `}</style>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32, animation:"floatY 4s ease-in-out infinite" }}>
          <div style={{ display:"inline-flex", width:68, height:68, borderRadius:18, background:"linear-gradient(135deg,#10b981,#059669)", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(16,185,129,.35)", marginBottom:14, color:"#fff" }}>{I.shield}</div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#f0fdf4", letterSpacing:"-.5px" }}>Referee Manager</h1>
          <p style={{ margin:"4px 0 0", color:"#374151", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>FDF — Fédération Djiboutienne de Football</p>
        </div>
        <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:28, backdropFilter:"blur(20px)" }}>
          <div style={{ display:"flex", background:"rgba(0,0,0,.3)", borderRadius:10, padding:4, marginBottom:22 }}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{ flex:1, padding:"8px 0", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, background:mode===m?"linear-gradient(135deg,#10b981,#059669)":"transparent", color:mode===m?"#fff":"#6b7280" }}>
                {m==="login"?"Connexion":"Inscription"}
              </button>
            ))}
          </div>
          {err && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:8, padding:"9px 13px", color:"#fca5a5", fontSize:13, marginBottom:14 }}>{err}</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div><label style={{ color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em", display:"block", marginBottom:5 }}>EMAIL</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="admin@fdf.dj" style={IS} onFocus={e=>e.target.style.borderColor="#10b981"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"} />
            </div>
            <div style={{ position:"relative" }}>
              <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em", display:"block", marginBottom:5 }}>MOT DE PASSE</label>
              <input value={pw} onChange={e=>setPw(e.target.value)} type={show?"text":"password"} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} style={{ ...IS, paddingRight:40 }} onFocus={e=>e.target.style.borderColor="#10b981"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"} />
              <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:10, top:32, background:"none", border:"none", color:"#6b7280", cursor:"pointer" }}>{show?I.eyeOff:I.eye}</button>
            </div>
            <button onClick={handle} style={{ padding:"12px 0", background:"linear-gradient(135deg,#10b981,#059669)", border:"none", borderRadius:9, color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:"0 4px 20px rgba(16,185,129,.3)" }}>
              {mode==="login"?"Se connecter →":"Créer le compte →"}
            </button>
          </div>
          <p style={{ textAlign:"center", color:"#1f2937", fontSize:11, marginTop:18, fontFamily:"'JetBrains Mono',monospace" }}>Demo : admin@fdf.dj / admin123</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ARBITRES TAB
═══════════════════════════════════════════════════════════════════ */
function RefereesTab({ referees, setReferees, toast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:"", phone:"", level:"National A" });

  const filtered = referees.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.phone||"").includes(search) ||
    (r.level||"").toLowerCase().includes(search.toLowerCase())
  );

  const save = () => {
    if (!form.name.trim()) { toast("Le nom est requis.","error"); return; }
    if (modal==="add") {
      const nr = { id:genId(), name:form.name.trim(), phone:form.phone.trim(), level:form.level, createdAt:today };
      setReferees(prev=>{ const n=[...prev,nr]; storage.set("fdf_refs",n); return n; });
      toast("Arbitre ajouté !");
    } else {
      setReferees(prev=>{ const n=prev.map(r=>r.id===modal?{...r,...form}:r); storage.set("fdf_refs",n); return n; });
      toast("Arbitre modifié !");
    }
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer cet arbitre ?")) return;
    setReferees(prev=>{ const n=prev.filter(r=>r.id!==id); storage.set("fdf_refs",n); return n; });
    toast("Supprimé.","warning");
  };

  const levelColor = { "Élite":"#f59e0b","International":"#10b981","National A":"#3b82f6","National B":"#8b5cf6","Régional":"#06b6d4","Stagiaire 2023":"#6b7280","Stagiaire 2024":"#6b7280","Stagiaire 2025":"#6b7280" };

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#4b5563" }}>{I.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, téléphone, niveau..." style={{ ...IS, paddingLeft:34 }} />
        </div>
        <Btn onClick={()=>{ setForm({name:"",phone:"",level:"National A"}); setModal("add"); }}>{I.plus} Ajouter</Btn>
      </div>
      <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid rgba(255,255,255,.07)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
          <thead>
            <tr style={{ background:"rgba(0,0,0,.4)" }}>
              {["N°","Nom","Niveau","Téléphone","Actions"].map((h,i)=>(
                <th key={i} style={{ padding:"11px 14px", textAlign:i===4?"center":"left", color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em", borderBottom:"1px solid rgba(255,255,255,.07)", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={5} style={{ padding:40, textAlign:"center", color:"#374151" }}>Aucun arbitre.</td></tr>}
            {filtered.map((r,i)=>(
              <tr key={r.id} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                <td style={{ padding:"10px 14px", color:"#4b5563", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{String(i+1).padStart(2,"0")}</td>
                <td style={{ padding:"10px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>{r.name.charAt(0)}</div>
                    <span style={{ color:"#f0fdf4", fontWeight:600, fontSize:13 }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding:"10px 14px" }}><Badge color={levelColor[r.level]||"#6b7280"}>{r.level||"—"}</Badge></td>
                <td style={{ padding:"10px 14px", color:"#6b7280", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{r.phone||"—"}</td>
                <td style={{ padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                    <button onClick={()=>{ setForm({name:r.name,phone:r.phone||"",level:r.level||"National A"}); setModal(r.id); }} style={{ background:"rgba(59,130,246,.1)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#60a5fa" }}>{I.edit}</button>
                    <button onClick={()=>del(r.id)} style={{ background:"rgba(239,68,68,.1)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#f87171" }}>{I.trash}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal==="add"?"Ajouter un arbitre":"Modifier l'arbitre"} onClose={()=>setModal(null)}>
          <Field label="NOM COMPLET"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={IS} placeholder="Prénom Nom" /></Field>
          <Field label="TÉLÉPHONE"><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={IS} placeholder="77 XX XX XX" /></Field>
          <Field label="NIVEAU / GRADE">
            <select value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))} style={SS}>
              {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={()=>setModal(null)} outline color="#6b7280">Annuler</Btn>
            <Btn onClick={save}>Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CATEGORIES TAB
═══════════════════════════════════════════════════════════════════ */
function CategoriesTab({ categories, setCategories, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:"", centralfee:"", assistantfee:"", fourthfee:"" });

  const save = () => {
    if (!form.name.trim()||!form.centralfee||!form.assistantfee||!form.fourthfee) { toast("Tous les champs sont requis.","error"); return; }
    const data = { name:form.name.trim(), centralfee:Number(form.centralfee), assistantfee:Number(form.assistantfee), fourthfee:Number(form.fourthfee) };
    if (modal==="add") {
      setCategories(prev=>{ const n=[...prev,{id:genId(),...data}]; storage.set("fdf_cats",n); return n; });
      toast("Catégorie ajoutée !");
    } else {
      setCategories(prev=>{ const n=prev.map(c=>c.id===modal?{...c,...data}:c); storage.set("fdf_cats",n); return n; });
      toast("Modifiée !");
    }
    setModal(null);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:18 }}>
        <Btn onClick={()=>{ setForm({name:"",centralfee:"",assistantfee:"",fourthfee:""}); setModal("add"); }}>{I.plus} Nouvelle catégorie</Btn>
      </div>
      <div style={{ display:"grid", gap:12 }}>
        {categories.map(c=>(
          <div key={c.id} style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"16px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}><span style={{ color:"#10b981" }}>{I.tag}</span><span style={{ color:"#f0fdf4", fontWeight:800, fontSize:15 }}>{c.name}</span></div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{ setForm({name:c.name,centralfee:String(c.centralfee),assistantfee:String(c.assistantfee),fourthfee:String(c.fourthfee)}); setModal(c.id); }} style={{ background:"rgba(59,130,246,.1)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#60a5fa" }}>{I.edit}</button>
                <button onClick={()=>{ if(!confirm("Supprimer ?"))return; setCategories(prev=>{ const n=prev.filter(x=>x.id!==c.id); storage.set("fdf_cats",n); return n; }); toast("Supprimée.","warning"); }} style={{ background:"rgba(239,68,68,.1)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#f87171" }}>{I.trash}</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[["Central","#10b981",c.centralfee],["Assistant","#3b82f6",c.assistantfee],["4ème Arbitre","#f59e0b",c.fourthfee]].map(([l,col,v])=>(
                <div key={l} style={{ background:`${col}10`, border:`1px solid ${col}30`, borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                  <p style={{ margin:0, color:col, fontSize:10, fontWeight:700, letterSpacing:".06em" }}>{l.toUpperCase()}</p>
                  <p style={{ margin:"4px 0 0", color:"#f0fdf4", fontWeight:800, fontSize:18, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(v)}</p>
                  <p style={{ margin:0, color:"#374151", fontSize:10 }}>FDJ</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title={modal==="add"?"Nouvelle catégorie":"Modifier"} onClose={()=>setModal(null)}>
          <Field label="NOM"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={IS} placeholder="ex: Ligue 1" /></Field>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["centralfee","CENTRAL (FDJ)"],["assistantfee","ASSISTANT (FDJ)"],["fourthfee","4ÈME (FDJ)"]].map(([k,l])=>(
              <Field key={k} label={l} half><input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={IS} type="number" placeholder="0" /></Field>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={()=>setModal(null)} outline color="#6b7280">Annuler</Btn>
            <Btn onClick={save}>Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DESIGNATIONS TAB  (+ Export XLS sélectif)
═══════════════════════════════════════════════════════════════════ */
function DesignationsTab({ designations, setDesignations, referees, categories, toast }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [exportModal, setExportModal] = useState(false);
  const [form, setForm] = useState({ date:"21 AVRIL", jour:"LUNDI", heure:"17H00", teama:"", teamb:"", terrain:"", matchnumber:"", categoryid:"", centralid:"", assistant1id:"", assistant2id:"", fourthid:"", observateur:"" });

  const getRef = (id) => referees.find(r=>r.id===id);
  const getCat = (id) => categories.find(c=>c.id===id);

  const filtered = designations.filter(d => {
    const matchSearch = d.teama.toLowerCase().includes(search.toLowerCase())||d.teamb.toLowerCase().includes(search.toLowerCase())||(d.matchnumber||"").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat==="all"||d.categoryid===filterCat;
    return matchSearch&&matchCat;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size===filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(d=>d.id)));
  };

  const save = () => {
    const { date, teama, teamb, categoryid, centralid, assistant1id, assistant2id, fourthid } = form;
    if (!date||!teama||!teamb||!categoryid||!centralid||!assistant1id||!assistant2id||!fourthid) { toast("Champs obligatoires manquants.","error"); return; }
    const roles=[centralid,assistant1id,assistant2id,fourthid];
    if (new Set(roles).size!==roles.length) { toast("Un arbitre ne peut avoir deux rôles.","error"); return; }
    if (modal==="add") {
      const nd={id:genId(),...form};
      setDesignations(prev=>{ const n=[nd,...prev]; storage.set("fdf_desigs",n); return n; });
      toast("Désignation créée !");
    }
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer ?")) return;
    setDesignations(prev=>{ const n=prev.filter(d=>d.id!==id); storage.set("fdf_desigs",n); return n; });
    setSelected(prev=>{ const n=new Set(prev); n.delete(id); return n; });
    toast("Supprimée.","warning");
  };

  const doExport = () => {
    const sel = designations.filter(d=>selected.has(d.id));
    if (sel.length===0) { toast("Aucun match sélectionné.","error"); return; }
    // Use first match's category
    const cat = getCat(sel[0].categoryid);
    exportDesignationXLS(cat, sel, referees, categories);
    toast(`Export CSV: ${sel.length} match(s) exporté(s) !`);
    setExportModal(false);
  };

  const catColors = {};
  categories.forEach((c,i)=>{ catColors[c.id]=["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444"][i%5]; });

  const JOURS = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI","DIMANCHE"];

  return (
    <div>
      {/* toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#4b5563" }}>{I.search}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Équipe, N° match..." style={{ ...IS, paddingLeft:34 }} />
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...SS, width:"auto", minWidth:130 }}>
          <option value="all">Toutes catégories</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Btn onClick={()=>{ setForm({date:"21 AVRIL",jour:"LUNDI",heure:"17H00",teama:"",teamb:"",terrain:"",matchnumber:"",categoryid:categories[0]?.id||"",centralid:"",assistant1id:"",assistant2id:"",fourthid:"",observateur:""}); setModal("add"); }}>{I.plus} Nouveau</Btn>
        <Btn onClick={()=>{ if(selected.size===0){toast("Sélectionnez d'abord des matchs.","warning");return;} setExportModal(true); }} color="#3b82f6">{I.upload} Exporter ({selected.size})</Btn>
      </div>

      {/* table */}
      <div style={{ overflowX:"auto", borderRadius:12, border:"1px solid rgba(255,255,255,.07)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
          <thead>
            <tr style={{ background:"rgba(0,0,0,.5)" }}>
              <th style={{ padding:"11px 14px", width:36 }}>
                <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ cursor:"pointer", accentColor:"#10b981" }} />
              </th>
              {["N°","Date / Heure","Match","Catégorie","Arbitre Central","Assistants","4ème","Actions"].map((h,i)=>(
                <th key={i} style={{ padding:"11px 14px", textAlign:"left", color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em", borderBottom:"1px solid rgba(255,255,255,.07)", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0&&<tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"#374151" }}>Aucune désignation.</td></tr>}
            {filtered.map((d,i)=>{
              const cat=getCat(d.categoryid);
              const isSel=selected.has(d.id);
              return (
                <tr key={d.id} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,.04)", background:isSel?"rgba(16,185,129,.06)":"transparent", transition:"background .15s" }}>
                  <td style={{ padding:"9px 14px" }}>
                    <input type="checkbox" checked={isSel} onChange={()=>toggleSelect(d.id)} style={{ cursor:"pointer", accentColor:"#10b981" }} />
                  </td>
                  <td style={{ padding:"9px 14px", color:"#6b7280", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{String(i+1).padStart(2,"0")}</td>
                  <td style={{ padding:"9px 14px" }}>
                    <p style={{ margin:0, color:"#f0fdf4", fontSize:12, fontWeight:600 }}>{d.date} — {d.heure}</p>
                    <p style={{ margin:"1px 0 0", color:"#4b5563", fontSize:11 }}>{d.jour}</p>
                  </td>
                  <td style={{ padding:"9px 14px" }}>
                    <p style={{ margin:0, color:"#f0fdf4", fontSize:13, fontWeight:700 }}>{d.teama} <span style={{ color:"#374151" }}>vs</span> {d.teamb}</p>
                    {d.matchnumber&&<p style={{ margin:"2px 0 0", color:"#4b5563", fontSize:11 }}>N° {d.matchnumber} {d.terrain&&`• ${d.terrain}`}</p>}
                  </td>
                  <td style={{ padding:"9px 14px" }}>{cat&&<Badge color={catColors[cat.id]}>{cat.name}</Badge>}</td>
                  <td style={{ padding:"9px 14px", color:"#d1d5db", fontSize:12, fontWeight:600 }}>{getRef(d.centralid)?.name||"—"}</td>
                  <td style={{ padding:"9px 14px" }}>
                    <p style={{ margin:0, color:"#9ca3af", fontSize:11 }}>{getRef(d.assistant1id)?.name||"—"}</p>
                    <p style={{ margin:"2px 0 0", color:"#9ca3af", fontSize:11 }}>{getRef(d.assistant2id)?.name||"—"}</p>
                  </td>
                  <td style={{ padding:"9px 14px", color:"#9ca3af", fontSize:12 }}>{getRef(d.fourthid)?.name||"—"}</td>
                  <td style={{ padding:"9px 14px" }}>
                    <button onClick={()=>del(d.id)} style={{ background:"rgba(239,68,68,.1)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#f87171" }}>{I.trash}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EXPORT MODAL */}
      {exportModal && (
        <Modal title="📤 Exporter la feuille de désignation" onClose={()=>setExportModal(false)} wide>
          <div style={{ marginBottom:16 }}>
            <p style={{ margin:"0 0 12px", color:"#9ca3af", fontSize:13 }}>
              <strong style={{ color:"#10b981" }}>{selected.size}</strong> match(s) sélectionné(s) — aperçu de la feuille :
            </p>
            <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid rgba(255,255,255,.1)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:"rgba(0,0,0,.5)" }}>
                    {["Date","Jour","Heure","Équipe A","Équipe B","Terrain","Matc N°","Arbitre","Assisstant 1","Assisstant 2","4eme officiel","Observateur"].map(h=>(
                      <th key={h} style={{ padding:"8px 10px", color:"#6b7280", fontWeight:700, fontSize:10, letterSpacing:".05em", textAlign:"left", borderBottom:"1px solid rgba(255,255,255,.07)", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {designations.filter(d=>selected.has(d.id)).map(d=>(
                    <tr key={d.id} style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      {[d.date,d.jour,d.heure,d.teama,d.teamb,d.terrain,d.matchnumber,
                        referees.find(r=>r.id===d.centralid)?.name,
                        referees.find(r=>r.id===d.assistant1id)?.name,
                        referees.find(r=>r.id===d.assistant2id)?.name,
                        referees.find(r=>r.id===d.fourthid)?.name,
                        d.observateur
                      ].map((v,i)=>(
                        <td key={i} style={{ padding:"7px 10px", color:"#d1d5db", whiteSpace:"nowrap" }}>{v||"—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin:"12px 0 0", color:"#374151", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
              ℹ️ Le fichier Excel (.xlsx) respecte la structure officielle FDF (avec en-tête FEDERATION DJIBOUTIENNE DE FOOTBALL).
            </p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setExportModal(false)} outline color="#6b7280">Annuler</Btn>
            <Btn onClick={doExport} color="#3b82f6">{I.dl} Télécharger Excel</Btn>
          </div>
        </Modal>
      )}

      {/* ADD MODAL */}
      {modal==="add" && (
        <Modal title="Nouvelle désignation" onClose={()=>setModal(null)} wide>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            <Field label="DATE" half><input value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={IS} placeholder="21 AVRIL" /></Field>
            <Field label="JOUR" half>
              <select value={form.jour} onChange={e=>setForm(f=>({...f,jour:e.target.value}))} style={SS}>
                {JOURS.map(j=><option key={j} value={j}>{j}</option>)}
              </select>
            </Field>
            <Field label="HEURE" half><input value={form.heure} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} style={IS} placeholder="17H00" /></Field>
            <Field label="N° MATCH" half><input value={form.matchnumber} onChange={e=>setForm(f=>({...f,matchnumber:e.target.value}))} style={IS} placeholder="61" /></Field>
            <Field label="ÉQUIPE A" half><input value={form.teama} onChange={e=>setForm(f=>({...f,teama:e.target.value}))} style={IS} placeholder="AS Port" /></Field>
            <Field label="ÉQUIPE B" half><input value={form.teamb} onChange={e=>setForm(f=>({...f,teamb:e.target.value}))} style={IS} placeholder="FC Obock" /></Field>
            <Field label="TERRAIN"><input value={form.terrain} onChange={e=>setForm(f=>({...f,terrain:e.target.value}))} style={IS} placeholder="Académie Douda" /></Field>
            <Field label="CATÉGORIE">
              <select value={form.categoryid} onChange={e=>setForm(f=>({...f,categoryid:e.target.value}))} style={SS}>
                <option value="">-- Sélectionner --</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:16, marginTop:4 }}>
            <p style={{ margin:"0 0 12px", color:"#6b7280", fontSize:11, fontWeight:700, letterSpacing:".06em" }}>DÉSIGNATION DES ARBITRES</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              {[["centralid","🟢 ARBITRE CENTRAL"],["assistant1id","🔵 ASSISTANT 1"],["assistant2id","🔵 ASSISTANT 2"],["fourthid","🟡 4ÈME ARBITRE"]].map(([k,l])=>(
                <Field key={k} label={l} half>
                  <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={SS}>
                    <option value="">-- Sélectionner --</option>
                    {referees.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          </div>
          <Field label="OBSERVATEUR (optionnel)"><input value={form.observateur} onChange={e=>setForm(f=>({...f,observateur:e.target.value}))} style={IS} placeholder="Nom de l'observateur" /></Field>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={()=>setModal(null)} outline color="#6b7280">Annuler</Btn>
            <Btn onClick={save}>Créer la désignation</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RAPPORT NET À PAYER
═══════════════════════════════════════════════════════════════════ */
function ReportingTab({ designations, referees, categories, toast }) {
  const [period, setPeriod] = useState("MARS 2026");
  const [filterCat, setFilterCat] = useState("all");

  const filteredDesigs = filterCat==="all" ? designations : designations.filter(d=>d.categoryid===filterCat);

  const reportData = useMemo(()=>{
    return referees.map(referee=>{
      let net=0;
      const cats={};
      categories.forEach(cat=>{
        const ms = filteredDesigs.filter(d=>d.categoryid===cat.id);
        const C=ms.filter(d=>d.centralid===referee.id).length;
        const A=ms.filter(d=>d.assistant1id===referee.id||d.assistant2id===referee.id).length;
        const F=ms.filter(d=>d.fourthid===referee.id).length;
        const total=(C*cat.centralfee)+(A*cat.assistantfee)+(F*cat.fourthfee);
        net+=total;
        cats[cat.id]={total,C,A,F};
      });
      return {referee,cats,net};
    }).filter(r=>r.net>0).sort((a,b)=>a.referee.name.localeCompare(b.referee.name));
  },[filteredDesigs,referees,categories]);

  const totalFees = reportData.reduce((s,r)=>s+r.net,0);

  const levelColor = { "Élite":"#f59e0b","International":"#10b981","National A":"#3b82f6","National B":"#8b5cf6","Régional":"#06b6d4","Stagiaire 2023":"#6b7280","Stagiaire 2024":"#6b7280","Stagiaire 2025":"#6b7280" };
  const catColors = {};
  categories.forEach((c,i)=>{ catColors[c.id]=["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444"][i%5]; });

  return (
    <div>
      {/* Header FDF style */}
      <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"16px 24px", marginBottom:20, textAlign:"center" }}>
        <p style={{ margin:0, color:"#10b981", fontWeight:800, fontSize:14, letterSpacing:".05em" }}>FÉDÉRATION DJIBOUTIENNE DE FOOTBALL</p>
        <p style={{ margin:"2px 0 0", color:"#6b7280", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>Tel : (00253) 35 35 99 — fdf@yahoo.fr</p>
        <div style={{ width:60, height:2, background:"linear-gradient(90deg,transparent,#10b981,transparent)", margin:"10px auto" }} />
        <p style={{ margin:0, color:"#d1d5db", fontWeight:700, fontSize:13 }}>COMMISSION CENTRALE DES ARBITRES</p>
        <p style={{ margin:"4px 0 0", color:"#f59e0b", fontWeight:800, fontSize:15, letterSpacing:".02em" }}>NET À PAYER — FRAIS DU MOIS DE {period.toUpperCase()}</p>
      </div>

      {/* Filtres & actions */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
        <div>
          <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, display:"block", marginBottom:4 }}>PÉRIODE</label>
          <input value={period} onChange={e=>setPeriod(e.target.value)} style={{ ...IS, width:160 }} placeholder="MARS 2026" />
        </div>
        <div>
          <label style={{ color:"#6b7280", fontSize:11, fontWeight:700, display:"block", marginBottom:4 }}>FILTRER CATÉGORIE</label>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...SS, width:160 }}>
            <option value="all">Toutes</option>
            {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop:18 }}>
          <Btn onClick={()=>{ exportNetPayerXLS(reportData,categories,period); toast("Export Excel téléchargé !"); }} color="#3b82f6">{I.dl} Export Excel</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        <StatCard icon={I.trophy} label="MATCHS TOTAL" value={filteredDesigs.length} color="#10b981" />
        <StatCard icon={I.users} label="ARBITRES ACTIFS" value={reportData.length} color="#3b82f6" />
        <StatCard icon={I.bar} label="TOTAL FDJ" value={`${fmt(totalFees)}`} sub="FDJ" color="#f59e0b" />
      </div>

      {/* TABLE RAPPORT */}
      {reportData.length===0 ? (
        <div style={{ textAlign:"center", padding:60, color:"#374151" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
          <p>Aucune donnée.</p>
        </div>
      ):(
        <div style={{ overflowX:"auto", borderRadius:14, border:"1px solid rgba(255,255,255,.07)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"rgba(0,0,0,.6)" }}>
                <th style={TH}>N°</th>
                <th style={{ ...TH, textAlign:"left", minWidth:160 }}>NOM</th>
                <th style={{ ...TH, textAlign:"left", minWidth:120 }}>NIVEAU</th>
                {categories.map(c=>(
                  <th key={c.id} style={{ ...TH, color:catColors[c.id], minWidth:100 }}>{c.name.toUpperCase()}</th>
                ))}
                <th style={{ ...TH, color:"#f59e0b", minWidth:110 }}>NET À PAYER</th>
                <th style={{ ...TH, textAlign:"left", minWidth:100 }}>TÉLÉPHONE</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row,idx)=>(
                <tr key={row.referee.id} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ ...TD, textAlign:"center", color:"#4b5563" }}>{idx+1}</td>
                  <td style={{ ...TD }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:6, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:11, flexShrink:0 }}>{row.referee.name.charAt(0)}</div>
                      <span style={{ color:"#f0fdf4", fontWeight:700 }}>{row.referee.name}</span>
                    </div>
                  </td>
                  <td style={{ ...TD }}><Badge color={levelColor[row.referee.level]||"#6b7280"}>{row.referee.level||"—"}</Badge></td>
                  {categories.map(c=>{
                    const d=row.cats[c.id];
                    return (
                      <td key={c.id} style={{ ...TD, textAlign:"center" }}>
                        {d.total>0?(
                          <div>
                            <span style={{ color:catColors[c.id], fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(d.total)}</span>
                            <br/>
                            <span style={{ color:"#4b5563", fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>({d.C},{d.A},{d.F})</span>
                          </div>
                        ):<span style={{ color:"#1f2937" }}>—</span>}
                      </td>
                    );
                  })}
                  <td style={{ ...TD, textAlign:"center" }}>
                    <span style={{ color:"#f59e0b", fontWeight:800, fontSize:14, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(row.net)}</span>
                  </td>
                  <td style={{ ...TD, color:"#6b7280", fontFamily:"'JetBrains Mono',monospace" }}>{row.referee.phone||"—"}</td>
                </tr>
              ))}
              {/* TOTAL ROW */}
              <tr style={{ background:"rgba(16,185,129,.06)", borderTop:"2px solid rgba(16,185,129,.25)" }}>
                <td colSpan={3} style={{ ...TD, color:"#10b981", fontWeight:800, fontSize:13 }}>TOTAL GÉNÉRAL</td>
                {categories.map(c=>{
                  const t=reportData.reduce((s,r)=>s+r.cats[c.id].total,0);
                  return <td key={c.id} style={{ ...TD, textAlign:"center", color:"#d1d5db", fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>{t>0?fmt(t):"—"}</td>;
                })}
                <td style={{ ...TD, textAlign:"center", color:"#f59e0b", fontWeight:800, fontSize:15, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(totalFees)}</td>
                <td style={TD} />
              </tr>
            </tbody>
          </table>
          <p style={{ padding:"8px 14px", color:"#374151", fontSize:10, fontFamily:"'JetBrains Mono',monospace", borderTop:"1px solid rgba(255,255,255,.04)" }}>
            * Format cellule : Montant_Total (Central, Assistant, 4ème) — ex : 23 000 (2,3,1) = 2 matchs central + 3 assistant + 1 quatrième
          </p>
        </div>
      )}
    </div>
  );
}

const TH = { padding:"11px 12px", textAlign:"center", color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:".07em", borderBottom:"1px solid rgba(255,255,255,.08)", whiteSpace:"nowrap" };
const TD = { padding:"9px 12px", fontSize:12 };

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════ */
function Dashboard({ designations, referees, categories }) {
  const totalFees = useMemo(()=>designations.reduce((sum,d)=>{
    const cat=categories.find(c=>c.id===d.categoryid);
    return cat?sum+cat.centralfee+cat.assistantfee*2+cat.fourthfee:sum;
  },0),[designations,categories]);

  const recent = [...designations].slice(0,6);
  const getCat = (id)=>categories.find(c=>c.id===id);
  const catColors={};categories.forEach((c,i)=>{catColors[c.id]=["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444"][i%5];});

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard icon={I.cal} label="TOTAL MATCHS" value={designations.length} sub="toutes périodes" color="#10b981" />
        <StatCard icon={I.users} label="ARBITRES" value={referees.length} color="#3b82f6" />
        <StatCard icon={I.tag} label="CATÉGORIES" value={categories.length} color="#8b5cf6" />
        <StatCard icon={I.bar} label="FRAIS CUMULÉS" value={fmt(totalFees)} sub="FDJ" color="#f59e0b" />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:20 }}>
        <h3 style={{ margin:"0 0 14px", color:"#f0fdf4", fontSize:14, fontWeight:700 }}>Dernières désignations</h3>
        {recent.length===0?<p style={{ color:"#374151", textAlign:"center", padding:24 }}>Aucune désignation.</p>:(
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {recent.map(d=>{
              const cat=getCat(d.categoryid);
              return (
                <div key={d.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 14px", background:"rgba(0,0,0,.2)", borderRadius:9 }}>
                  <span style={{ color:"#10b981" }}>{I.cal}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ color:"#f0fdf4", fontWeight:600, fontSize:13 }}>{d.teama} <span style={{ color:"#374151" }}>vs</span> {d.teamb}</span>
                    <span style={{ color:"#4b5563", fontSize:11, marginLeft:8 }}>{d.date} {d.heure}</span>
                  </div>
                  {cat&&<Badge color={catColors[cat.id]}>{cat.name}</Badge>}
                  {d.matchnumber&&<span style={{ color:"#374151", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>#{d.matchnumber}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(()=>storage.get("fdf_user",null));
  const [tab, setTab] = useState("dashboard");
  const [referees, setReferees] = useState(()=>storage.get("fdf_refs",SEED_REFS));
  const [categories, setCategories] = useState(()=>storage.get("fdf_cats",SEED_CATS));
  const [designations, setDesignations] = useState(()=>storage.get("fdf_desigs",SEED_DESIGS));
  const { toasts, toast } = useToast();

  const onLogin = (u)=>{ storage.set("fdf_user",u); setUser(u); };
  const logout = ()=>{ storage.set("fdf_user",null); setUser(null); };

  if (!user) return <><AuthScreen onLogin={onLogin}/><Toaster toasts={toasts}/></>;

  const TABS = [
    { id:"dashboard", label:"Dashboard", icon:I.bar },
    { id:"referees",  label:"Arbitres",  icon:I.users },
    { id:"categories",label:"Catégories",icon:I.tag },
    { id:"designations",label:"Désignations",icon:I.cal },
    { id:"reporting", label:"Net à Payer",icon:I.file },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#07101d", fontFamily:"'Syne',sans-serif", color:"#f0fdf4", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes toastIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#07101d}::-webkit-scrollbar-thumb{background:#1a3050;border-radius:3px}
        input,select,textarea{font-family:'Syne',sans-serif!important;color:#f0fdf4!important}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6)}
        input::placeholder{color:#374151!important}
        select option{background:#0b1628;color:#f0fdf4}
        .row-hover:hover{background:rgba(255,255,255,.03)!important}
        /* Tablet: shrink sidebar + padding */
        @media(max-width:1024px){
          .sidebar{width:190px!important;padding:18px 12px!important}
          .main-pad{margin-left:190px!important;padding:20px 18px!important}
        }
        /* Small tablet / large phone */
        @media(max-width:820px){
          .sidebar{width:170px!important}
          .main-pad{margin-left:170px!important;padding:18px 14px!important}
          .main-pad h2{font-size:18px!important}
        }
        @media(max-width:640px){.sidebar{display:none!important}.mobile-nav{display:flex!important}.main-pad{margin-left:0!important;padding:16px 14px 80px!important}}
        @media(max-width:420px){
          .main-pad{padding:14px 12px 86px!important}
          .main-pad h2{font-size:17px!important}
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar" style={{ position:"fixed", top:0, left:0, bottom:0, width:210, background:"rgba(7,16,29,.97)", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column", zIndex:30, padding:"20px 14px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:2 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>{I.shield}</div>
            <div><p style={{ margin:0, fontWeight:800, fontSize:13, color:"#f0fdf4" }}>Referee</p><p style={{ margin:0, fontWeight:800, fontSize:13, color:"#10b981" }}>Manager FDF</p></div>
          </div>
        </div>
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 11px", borderRadius:9, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"'Syne',sans-serif", fontWeight:tab===t.id?700:500, fontSize:13, background:tab===t.id?"rgba(16,185,129,.12)":"transparent", color:tab===t.id?"#10b981":"#6b7280", borderLeft:tab===t.id?"2px solid #10b981":"2px solid transparent", transition:"all .2s" }}>
              <span style={{ color:tab===t.id?"#10b981":"#374151" }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:14 }}>
          <p style={{ margin:"0 0 8px", fontSize:11, color:"#1f2937", fontFamily:"'JetBrains Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</p>
          <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 11px", borderRadius:8, border:"none", cursor:"pointer", background:"rgba(239,68,68,.08)", color:"#f87171", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, width:"100%" }}>
            {I.logout} Déconnexion
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-pad" style={{ flex:1, marginLeft:210, padding:"24px 28px" }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#f0fdf4", letterSpacing:"-.5px" }}>{TABS.find(t=>t.id===tab)?.label}</h2>
          <p style={{ margin:"3px 0 0", color:"#1f2937", fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        {tab==="dashboard"    && <Dashboard designations={designations} referees={referees} categories={categories}/>}
        {tab==="referees"     && <RefereesTab referees={referees} setReferees={setReferees} toast={toast}/>}
        {tab==="categories"   && <CategoriesTab categories={categories} setCategories={setCategories} toast={toast}/>}
        {tab==="designations" && <DesignationsTab designations={designations} setDesignations={setDesignations} referees={referees} categories={categories} toast={toast}/>}
        {tab==="reporting"    && <ReportingTab designations={designations} referees={referees} categories={categories} toast={toast}/>}
      </div>

      {/* MOBILE NAV */}
      <div className="mobile-nav" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, background:"rgba(7,16,29,.98)", borderTop:"1px solid rgba(255,255,255,.07)", padding:"6px 0", zIndex:30 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 0", background:"none", border:"none", cursor:"pointer", color:tab===t.id?"#10b981":"#374151", fontFamily:"'Syne',sans-serif", fontSize:9, fontWeight:700 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <Toaster toasts={toasts}/>
    </div>
  );
}
