// =============================================================================
// client/src/features/categories/CategoriesTab.tsx
// =============================================================================
import { useState } from "react";
import type { Category, CreateCategoryPayload } from "../../types.js";
import { fmt } from "../../utils/format.js";

interface Props {
  categories: Category[];
  toast: (msg: string, type?: string) => void;
  onCreate: (body: CreateCategoryPayload) => Promise<void>;
  onUpdate: (id: string, body: Partial<CreateCategoryPayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const IS: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)",
  borderRadius: 9, padding: "10px 13px", color: "#f0fdf4", fontSize: 13, fontFamily: "inherit", outline: "none",
};

function CategoryModal({ initial, onSave, onClose }: {
  initial: Category | null;
  onSave: (b: CreateCategoryPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName]           = useState(initial?.name ?? "");
  const [centralFee, setCentral]  = useState(String(initial?.centralFee ?? ""));
  const [assistantFee, setAssist] = useState(String(initial?.assistantFee ?? ""));
  const [fourthFee, setFourth]    = useState(String(initial?.fourthFee ?? ""));
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");

  const handle = async () => {
    if (!name.trim())                   { setErr("Le nom est requis."); return; }
    if (isNaN(+centralFee) || +centralFee < 0) { setErr("Frais central invalide."); return; }
    setLoading(true);
    try {
      await onSave({ name: name.trim(), centralFee: +centralFee, assistantFee: +assistantFee, fourthFee: +fourthFee });
    } catch (e: any) { setErr(e.message === "NameExists" ? "Ce nom existe déjà." : e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#0b1628", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 28 }}>
        <h3 style={{ margin: "0 0 20px", color: "#f0fdf4", fontSize: 16, fontWeight: 700 }}>{initial ? "Modifier" : "Nouvelle"} catégorie</h3>
        {err && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{err}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>NOM *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={IS} placeholder="Ligue 1" />
          </div>
          {[
            { label: "FRAIS ARBITRE CENTRAL (FDJ)", val: centralFee, set: setCentral },
            { label: "FRAIS ASSISTANT (FDJ)",        val: assistantFee, set: setAssist },
            { label: "FRAIS 4ÈME ARBITRE (FDJ)",     val: fourthFee, set: setFourth },
          ].map(f => (
            <div key={f.label}>
              <label style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 5 }}>{f.label}</label>
              <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)} style={IS} placeholder="0" />
            </div>
          ))}
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

export function CategoriesTab({ categories, toast, onCreate, onUpdate, onDelete }: Props) {
  const [editing, setEditing]   = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (c: Category) => {
    if (!confirm(`Supprimer "${c.name}" ?`)) return;
    try { await onDelete(c.id); toast("Catégorie supprimée."); }
    catch (e: any) { toast(e.message === "CategoryInUse" ? "Catégorie utilisée dans une désignation." : "Erreur.", "error"); }
  };

  const total = (c: Category) => c.centralFee + c.assistantFee * 2 + c.fourthFee;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ padding: "10px 18px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          + Ajouter
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {categories.length === 0 && <p style={{ color: "#374151", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>Aucune catégorie</p>}
        {categories.map(c => (
          <div key={c.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f0fdf4" }}>{c.name}</span>
              <span style={{ fontSize: 11, background: "rgba(16,185,129,.12)", color: "#10b981", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
                {fmt(total(c))} FDJ/match
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Arbitre central", val: c.centralFee },
                { label: "Assistant", val: c.assistantFee },
                { label: "4ème officiel", val: c.fourthFee },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6b7280" }}>{r.label}</span>
                  <span style={{ color: "#d1d5db", fontWeight: 600, fontFamily: "monospace" }}>{fmt(r.val)} FDJ</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => { setEditing(c); setShowForm(true); }}
                style={{ flex: 1, padding: "7px 0", background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.25)", borderRadius: 8, color: "#60a5fa", fontSize: 12, cursor: "pointer" }}>
                Modifier
              </button>
              <button onClick={() => handleDelete(c)}
                style={{ flex: 1, padding: "7px 0", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, color: "#f87171", fontSize: 12, cursor: "pointer" }}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <CategoryModal
          initial={editing}
          onSave={async body => {
            if (editing) { await onUpdate(editing.id, body); toast("Catégorie mise à jour."); }
            else { await onCreate(body); toast("Catégorie ajoutée."); }
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
