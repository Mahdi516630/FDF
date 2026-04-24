// =============================================================================
// client/src/features/designations/exportExcel.ts
// Hérité FDF — export désignations par catégorie (XLSX)
// =============================================================================
import * as XLSX from "xlsx";
import type { DesignationDetail, Category } from "../../types.js";

export function exportDesignationXlsx(
  category: Category,
  desigs: DesignationDetail[]
) {
  const header = [
    [], [],
    ["", "", "", "", "", "", "", "FÉDÉRATION DJIBOUTIENNE DE FOOTBALL"],
    ["", "", "", "", "", "", "", "Tel : (00253) 35 35 99 - Fax : (00253) 35 35 98 - B.P : 2694"],
    ["", "", "", "", "", "", "", "fdf@yahoo.fr"],
    [],
    ["", "", "", "", "", "", "", "COMMISSION CENTRALE DES ARBITRES"],
    [],
    ["", "", "", "", "", "", "", "", "", category.name.toUpperCase()],
    [],
    ["Date", "JOUR", "HEURE", "Équipe A", "Équipe B", "TERRAIN", "MATCH N°", "Arbitre", "Assistant 1", "Assistant 2", "4ème officiel", "OBSERVATEUR"],
  ];

  const rows = desigs.map(d => [
    d.date, d.jour ?? "", d.heure ?? "",
    d.teamA, d.teamB,
    d.terrain ?? "", d.matchNumber ?? "",
    d.centralName, d.assistant1Name, d.assistant2Name, d.fourthName,
    d.observateur ?? "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
  ws["!cols"] = [12, 10, 8, 18, 18, 20, 8, 22, 22, 22, 18, 18].map(wch => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, category.name);
  const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Désignation_${category.name.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}


// =============================================================================
// client/src/features/designations/DesignationForm.tsx
// =============================================================================
import { useState } from "react";
import type { DesignationDetail, Referee, Category, CreateDesignationPayload } from "../../types.js";

const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

interface FormProps {
  initial: DesignationDetail | null;
  referees: Referee[];
  categories: Category[];
  onSave: (body: CreateDesignationPayload) => Promise<void>;
  onClose: () => void;
}

export function DesignationForm({ initial, referees, categories, onSave, onClose }: FormProps) {
  const [date, setDate]         = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [jour, setJour]         = useState(initial?.jour ?? "");
  const [heure, setHeure]       = useState(initial?.heure ?? "");
  const [teamA, setTeamA]       = useState(initial?.teamA ?? "");
  const [teamB, setTeamB]       = useState(initial?.teamB ?? "");
  const [terrain, setTerrain]   = useState(initial?.terrain ?? "");
  const [matchNumber, setMatch] = useState(initial?.matchNumber ?? "");
  const [catId, setCatId]       = useState(initial?.categoryId ?? "");
  const [centralId, setCentral] = useState(initial?.centralId ?? "");
  const [a1Id, setA1]           = useState(initial?.assistant1Id ?? "");
  const [a2Id, setA2]           = useState(initial?.assistant2Id ?? "");
  const [fourthId, setFourth]   = useState(initial?.fourthId ?? "");
  const [observateur, setObs]   = useState(initial?.observateur ?? "");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  const handle = async () => {
    if (!date || !teamA || !teamB || !catId || !centralId || !a1Id || !a2Id || !fourthId) {
      setErr("Tous les champs obligatoires doivent être remplis."); return;
    }
    const ids = [centralId, a1Id, a2Id, fourthId];
    if (new Set(ids).size !== 4) { setErr("Un arbitre ne peut pas tenir deux rôles."); return; }
    setLoading(true);
    try {
      await onSave({ date, jour: jour || undefined, heure: heure || undefined, teamA, teamB, terrain: terrain || undefined, matchNumber: matchNumber || undefined, categoryId: catId, centralId, assistant1Id: a1Id, assistant2Id: a2Id, fourthId, observateur: observateur || undefined });
    } catch (e: any) {
      setErr(e.message === "DuplicateRoles" ? "Un arbitre ne peut pas tenir deux rôles." : e.message);
    } finally { setLoading(false); }
  };

  const IS: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 13px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit" };
  const LB: React.CSSProperties = { color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 };

  const RefSelect = ({ label, val, set, exclude }: { label: string; val: string; set: (v: string) => void; exclude: string[] }) => (
    <div>
      <label style={LB}>{label} *</label>
      <select value={val} onChange={e => set(e.target.value)} style={IS}>
        <option value="">— Choisir —</option>
        {referees
          .filter(r => r.id === val || !exclude.includes(r.id))
          .map(r => <option key={r.id} value={r.id}>{r.name}{r.level ? ` (${r.level})` : ""}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, overflowY: "auto", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#0b1628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 28, margin: "auto" }}>
        <h3 style={{ margin: "0 0 20px", color: "#f0fdf4", fontSize: 16, fontWeight: 700 }}>{initial ? "Modifier" : "Nouvelle"} désignation</h3>
        {err && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={LB}>DATE *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={IS} /></div>
          <div>
            <label style={LB}>JOUR</label>
            <select value={jour} onChange={e => setJour(e.target.value)} style={IS}>
              <option value="">—</option>
              {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div><label style={LB}>HEURE</label><input value={heure} onChange={e => setHeure(e.target.value)} placeholder="17H00" style={IS} /></div>
          <div><label style={LB}>MATCH N°</label><input value={matchNumber} onChange={e => setMatch(e.target.value)} style={IS} /></div>
          <div><label style={LB}>ÉQUIPE A *</label><input value={teamA} onChange={e => setTeamA(e.target.value)} style={IS} /></div>
          <div><label style={LB}>ÉQUIPE B *</label><input value={teamB} onChange={e => setTeamB(e.target.value)} style={IS} /></div>
          <div style={{ gridColumn: "1/-1" }}><label style={LB}>TERRAIN</label><input value={terrain} onChange={e => setTerrain(e.target.value)} style={IS} /></div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={LB}>CATÉGORIE *</label>
            <select value={catId} onChange={e => setCatId(e.target.value)} style={IS}>
              <option value="">— Choisir —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <RefSelect label="ARBITRE CENTRAL" val={centralId} set={setCentral} exclude={[a1Id, a2Id, fourthId].filter(Boolean)} />
          </div>
          <div>
            <RefSelect label="ASSISTANT 1" val={a1Id} set={setA1} exclude={[centralId, a2Id, fourthId].filter(Boolean)} />
          </div>
          <div>
            <RefSelect label="ASSISTANT 2" val={a2Id} set={setA2} exclude={[centralId, a1Id, fourthId].filter(Boolean)} />
          </div>
          <div>
            <RefSelect label="4ÈME ARBITRE" val={fourthId} set={setFourth} exclude={[centralId, a1Id, a2Id].filter(Boolean)} />
          </div>
          <div><label style={LB}>OBSERVATEUR</label><input value={observateur} onChange={e => setObs(e.target.value)} style={IS} /></div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={handle} disabled={loading} style={{ flex: 1, padding: "11px 0", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "…" : initial ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}


// =============================================================================
// client/src/features/designations/DesignationsTab.tsx
// =============================================================================
import type { CreateDesignationPayload } from "../../types.js";
import { fmtDate } from "../../utils/format.js";

interface TabProps {
  designations: DesignationDetail[];
  referees: Referee[];
  categories: Category[];
  toast: (msg: string, type?: string) => void;
  onCreate: (body: CreateDesignationPayload) => Promise<void>;
  onUpdate: (id: string, body: Partial<CreateDesignationPayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DesignationsTab({ designations, referees, categories, toast, onCreate, onUpdate, onDelete }: TabProps) {
  const [editing, setEditing]       = useState<DesignationDetail | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [filterCat, setFilterCat]   = useState("all");
  const [search, setSearch]         = useState("");
  const [exporting, setExporting]   = useState(false);

  const filtered = designations.filter(d => {
    const matchCat = filterCat === "all" || d.categoryId === filterCat;
    const q = search.toLowerCase();
    const matchSearch = !q || d.teamA.toLowerCase().includes(q) || d.teamB.toLowerCase().includes(q) ||
                        d.centralName.toLowerCase().includes(q) || (d.matchNumber ?? "").includes(q);
    return matchCat && matchSearch;
  });

  const handleExport = () => {
    const cat = categories.find(c => c.id === filterCat);
    if (!cat) { toast("Sélectionnez une catégorie pour exporter.", "error"); return; }
    setExporting(true);
    try { exportDesignationXlsx(cat, filtered); toast("Export Excel téléchargé !"); }
    finally { setExporting(false); }
  };

  const TH: React.CSSProperties = { padding: "10px 12px", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".07em", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap" };
  const TD: React.CSSProperties = { padding: "9px 12px", fontSize: 12, color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,.04)", verticalAlign: "middle" };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher équipe, arbitre, n° match…"
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 14px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit" }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 14px", color: "#f0fdf4", fontSize: 13 }}>
          <option value="all">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting || filterCat === "all"}
          style={{ padding: "10px 16px", background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 9, color: "#60a5fa", fontSize: 13, cursor: "pointer" }}>
          📥 Excel
        </button>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ padding: "10px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Ajouter
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.4)" }}>
              {["Date", "Match", "Catégorie", "Central", "Assistants", "4ème", "Terrain", ""].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#374151" }}>Aucune désignation</td></tr>
            )}
            {filtered.map(d => (
              <tr key={d.id}>
                <td style={TD}>
                  <span style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: 11 }}>{fmtDate(d.date)}</span>
                  {d.heure && <span style={{ display: "block", color: "#4b5563", fontSize: 10 }}>{d.jour} {d.heure}</span>}
                </td>
                <td style={TD}>
                  <div style={{ fontWeight: 700, color: "#f0fdf4" }}>{d.teamA}</div>
                  <div style={{ color: "#4b5563", fontSize: 11 }}>vs {d.teamB}</div>
                  {d.matchNumber && <div style={{ color: "#374151", fontSize: 10 }}>#{d.matchNumber}</div>}
                </td>
                <td style={TD}><span style={{ background: "rgba(16,185,129,.12)", color: "#10b981", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{d.categoryName}</span></td>
                <td style={{ ...TD, fontWeight: 600, color: "#f0fdf4" }}>{d.centralName}</td>
                <td style={TD}><div style={{ color: "#d1d5db" }}>{d.assistant1Name}</div><div style={{ color: "#9ca3af" }}>{d.assistant2Name}</div></td>
                <td style={TD}>{d.fourthName}</td>
                <td style={{ ...TD, color: "#6b7280", fontSize: 11 }}>{d.terrain ?? "—"}</td>
                <td style={TD}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => { setEditing(d); setShowForm(true); }}
                      style={{ padding: "4px 10px", background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 6, color: "#60a5fa", fontSize: 11, cursor: "pointer" }}>✏</button>
                    <button onClick={async () => { if (!confirm("Supprimer ?")) return; await onDelete(d.id); toast("Désignation supprimée."); }}
                      style={{ padding: "4px 10px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 6, color: "#f87171", fontSize: 11, cursor: "pointer" }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <DesignationForm
          initial={editing}
          referees={referees}
          categories={categories}
          onSave={async body => {
            if (editing) { await onUpdate(editing.id, body); toast("Désignation mise à jour."); }
            else { await onCreate(body); toast("Désignation créée."); }
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
