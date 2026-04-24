// =============================================================================
// client/src/features/referees/RefereesTab.tsx
// =============================================================================
import { useState } from "react";
import type { Referee, CreateRefereePayload, UpdateRefereePayload } from "../../types.js";
import { LEVEL_COLORS, REFEREE_LEVELS } from "../../constants/levels.js";
import { RefereeForm } from "./RefereeForm.js";

interface Props {
  referees: Referee[];
  toast: (msg: string, type?: string) => void;
  onCreate: (body: CreateRefereePayload) => Promise<void>;
  onUpdate: (id: string, body: UpdateRefereePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function RefereesTab({ referees, toast, onCreate, onUpdate, onDelete }: Props) {
  const [search, setSearch]       = useState("");
  const [filterLevel, setFilter]  = useState("all");
  const [editing, setEditing]     = useState<Referee | null>(null);
  const [showForm, setShowForm]   = useState(false);

  const filtered = referees.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        (r.phone ?? "").includes(search);
    const matchLevel  = filterLevel === "all" || r.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleDelete = async (r: Referee) => {
    if (!confirm(`Supprimer ${r.name} ?`)) return;
    try {
      await onDelete(r.id);
      toast("Arbitre supprimé.");
    } catch (e: any) {
      toast(e.message === "RefereeInUse" ? "Arbitre utilisé dans une désignation." : "Erreur.", "error");
    }
  };

  const S = {
    badge: (level: string | null) => ({
      display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${LEVEL_COLORS[level ?? ""] ?? "#6b7280"}18`,
      color: LEVEL_COLORS[level ?? ""] ?? "#6b7280",
      border: `1px solid ${LEVEL_COLORS[level ?? ""] ?? "#6b7280"}40`,
    }) as React.CSSProperties,
    avatar: (name: string) => ({
      width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0,
    }) as React.CSSProperties,
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom ou téléphone…"
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 14px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit" }}
        />
        <select value={filterLevel} onChange={e => setFilter(e.target.value)}
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "10px 14px", color: "#f0fdf4", fontSize: 13 }}>
          <option value="all">Tous niveaux</option>
          {REFEREE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ padding: "10px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Ajouter
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.4)" }}>
              {["Arbitre", "Niveau", "Téléphone", "Actions"].map(h => (
                <th key={h} style={{ padding: "11px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: ".07em", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#374151" }}>Aucun arbitre</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={S.avatar(r.name)}>{r.name.charAt(0).toUpperCase()}</div>
                    <span style={{ color: "#f0fdf4", fontWeight: 600 }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={S.badge(r.level)}>{r.level ?? "—"}</span>
                </td>
                <td style={{ padding: "10px 14px", color: "#9ca3af", fontFamily: "monospace" }}>{r.phone ?? "—"}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setEditing(r); setShowForm(true); }}
                      style={{ padding: "5px 12px", background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 7, color: "#60a5fa", fontSize: 12, cursor: "pointer" }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(r)}
                      style={{ padding: "5px 12px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 7, color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {showForm && (
        <RefereeForm
          initial={editing}
          onSave={async body => {
            if (editing) { await onUpdate(editing.id, body); toast("Arbitre mis à jour."); }
            else { await onCreate(body); toast("Arbitre ajouté."); }
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}


// =============================================================================
// client/src/features/referees/RefereeForm.tsx
// =============================================================================
import type { CreateRefereePayload } from "../../types.js";

interface FormProps {
  initial: Referee | null;
  onSave: (body: CreateRefereePayload) => Promise<void>;
  onClose: () => void;
}

export function RefereeForm({ initial, onSave, onClose }: FormProps) {
  const [name, setName]   = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [level, setLevel] = useState<string>(initial?.level ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    if (!name.trim()) { setErr("Le nom est requis."); return; }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim() || undefined, level: level || undefined } as CreateRefereePayload);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const IS: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 9, padding: "11px 14px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit", outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#0b1628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 28 }}>
        <h3 style={{ margin: "0 0 20px", color: "#f0fdf4", fontSize: 16, fontWeight: 700 }}>{initial ? "Modifier" : "Nouvel"} arbitre</h3>
        {err && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{err}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>NOM *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={IS} placeholder="Nom complet" />
          </div>
          <div>
            <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>TÉLÉPHONE</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} style={IS} placeholder="77xxxxxx" />
          </div>
          <div>
            <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>NIVEAU</label>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ ...IS }}>
              <option value="">— Non renseigné —</option>
              {REFEREE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>Annuler</button>
            <button onClick={handle} disabled={loading} style={{ flex: 1, padding: "11px 0", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {loading ? "…" : initial ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
